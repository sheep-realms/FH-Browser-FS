class FHFileManager {
    #cache;

    /**
     * 文件管理器
     * @param {String} id ID
     */
    constructor(id) {
        this.id = id;
        this.root_handle = null;
        this.root_entry = null;

        this.is_ready = false;
        this.read_only = true;

        this.view = new Map();
        this.view_index = 0;

        this.config = {
            security: {
                max_path_length: 200
            },
            cache: {
                recently_access_length: 128
            }
        };

        this.#cache = {
            // entry_map: new Map(),
            // recently_access_path: []
        };
    }

    // #updateRecentlyAccess(path, entry) {
    //     if (path === '' || path === '/') return this.#cache.recently_access_path;

    //     let list = this.#cache.recently_access_path.filter(e => e !== path);
    //     list.unshift(path);

    //     const removePath = list.splice(this.config.cache.recently_access_path_length);
    //     removePath.forEach(e => {
    //         this.#cache.entry_map.delete(e);
    //     });

    //     this.#cache.entry_map.set(path, entry);
    //     this.#cache.recently_access_path = list;

    //     return this.#cache.recently_access_path;
    // }

    // #sortRecentlyAccess(path) {
    //     if (!this.#cache.recently_access_path.includes(path)) return this.#cache.recently_access_path;

    //     let list = this.#cache.recently_access_path.filter(e => e !== path);
    //     list.unshift(path);

    //     this.#cache.recently_access_path = list;
    //     return this.#cache.recently_access_path;
    // }

    // #getEntryCache(path) {
    //     if (path === '' || path === '/') return this.root_entry;
    //     const entry = this.#cache.entry_map.get(path);
    //     if (entry !== undefined) this.#sortRecentlyAccess(path);
    //     return entry
    // }

    async pickDirectory() {
        if (typeof window.showDirectoryPicker !== 'function') {
            return this._rejectReturnReason('SYSTEM__FILE_SYSTEM_ACCESS_API_UNAVAILABLE');
        }

        try {
            this.root_handle = await window.showDirectoryPicker({ id: this.id, mode: 'readwrite' });
        } catch (error) {
            const ERROR_REASON = {
                AbortError: 'SYSTEM__PICK_DIRECTORY_ABORT',
                SecurityError: 'SYSTEM__SECURITY_ERROR'
            }
            if (ERROR_REASON[error.name] === undefined) {
                return this._rejectReturnReason('SYSTEM__UNKNOW_ERROR');
            }
            return this._rejectReturnReason(ERROR_REASON[error.name]);
        }

        const permission = await this.root_handle.requestPermission({ mode: 'readwrite' });
        if (permission !== 'granted') {
            console.alert('[FHFileManager] Read Only');
            this.read_only = true;
        } else {
            this.read_only = false;
        }

        this.root_entry = this.createEntry(this.root_handle, '/', { root_directory: true });
        this.is_ready = true;

        return this._resolveReturn(this.root_entry, undefined, this.root_entry.name);
    }

    getRootEntry() {
        return this.root_entry;
    }

    /**
     * 拼接并规范化路径
     * @param {...(string|Object)} args ...路径, 选项
     * @param {Boolean} args.trailingSlash 保留末尾斜杠
     * @returns {string} 路径
     * @throws {Error}
     */
    _resolvePath(...args) {
        const options =
            args.length > 0 &&
            typeof args[args.length - 1] === 'object' &&
            args[args.length - 1] !== null &&
            !Array.isArray(args[args.length - 1])
                ? args.pop()
                : {};

        const {
            trailingSlash = false,
        } = options;

        if (args.length === 0) return '/';

        let path = "";
        for (const part of args) {
            const str = String(part ?? '');
            if (!path.endsWith('/') && !str.startsWith('/')) path += '/';
            path += str;
        }

        if (!path.startsWith("/")) path = "/" + path;

        path = path
            .replace(/\/{2,}/g, "/")
            .replace(/\/\.\//g, "/")
            .replace(/\/\.{3,}\//g, "/");

        const stack = [];

        for (const segment of path.split("/")) {
            if (segment === "" || segment === ".") continue;
            if (segment === "..") {
                if (stack.length === 0) {
                    throw new Error("[FHFileManager] Path escapes the root directory.");
                }
                stack.pop();
                continue;
            }
            stack.push(segment);
        }

        let result = "/" + stack.join("/");

        if (
            trailingSlash &&
            result !== "/" &&
            !result.endsWith("/")
        ) {
            result += "/";
        }

        return result;
    }

    /**
     * 接受返回值
     * @param {Object} payload 载荷
     * @param {string} path 路径
     * @param {string} name 文件名
     * @returns {Promise} Promise
     */
    _resolveReturn(payload = {}, path, name) {
        return new Promise(resolve => {
            resolve({
                success: true,
                path,
                name,
                payload
            });
        });
    }

    /**
     * 拒绝返回值
     * @param {Object} payload 载荷
     * @param {string} path 路径
     * @param {string} name 文件名
     * @returns {Promise} Promise
     */
    _rejectReturn(payload = {}, path, name) {
        return new Promise((_, reject) => {
            reject({
                success: false,
                path,
                name,
                payload
            });
        });
    }

    /**
     * 拒绝返回理由
     * @param {Object} reason 理由
     * @param {string} path 路径
     * @param {string} name 文件名
     * @returns {Promise} Promise
     */
    _rejectReturnReason(reason, path, name, ) {
        return this._rejectReturn({ reason }, path, name);
    }

    createEntry(handle, path, options = {}) {
        if (handle.kind === 'directory') {
            return new FHDirectoryEntry(this, handle, path, options);
        } else {
            return new FHFileEntry(this, handle, path, options);
        }
    }

    async cerateView(id, path) {
        if (!this.is_ready) return this._rejectReturnReason('SYSTEM__NOT_READY');

        const index = ++this.view_index;
        const viewId = typeof id === 'string' ? id : `__fh_view_index_${ index }`;

        // TODO: 转到指定路径
        if (typeof path === 'string' && !path.startsWith('/')) {
            path = this._resolvePath(this.current_path, path);
        }
        const view = new FHFileView(this);

        this.view.set(viewId, view);

        return this._resolveReturn(view, path);
    }

    getView(id) {
        return this.view.get(id);
    }
}

window.FHFileManager = FHFileManager;