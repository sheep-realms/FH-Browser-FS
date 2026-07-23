class FHFileView {
    #destroyed;

    constructor(manager) {
        this.manager = manager;
        this.root_entry = manager.root_entry;
        this.directory_stack = [];
        this.#destroyed = false;
    }

    // 可返回上一级目录
    get can_back() {
        return this.directory_stack.length > 0;
    }
    
    // 当前路径
    get current_path() {
        let stack = [];
        this.directory_stack.forEach(e => {
            if (typeof e.name !== 'string' || e.name.trim() === '') {
                throw new Error('[FHFileView] Invalid File Name');
            }
            stack.push(e.name);
        });
        if (stack.length === 0) return '/';
        return '/' + stack.join('/');
    }

    // 当前目录入口
    get current_directory_entry() {
        if (this.directory_stack.length === 0) return this.root_entry;
        return this.directory_stack[this.directory_stack.length - 1];
    }

    /**
     * 添加目录堆栈
     * @private
     * @param {FHDirectoryEntry} entry 要添加的目录入口
     */
    #addDirectoryStack(entry) {
        this.directory_stack.push(entry);
    }

    /**
     * 移除顶层目录堆栈
     * @private
     * @param {FHDirectoryEntry} entry 用于匹配的要移除的目录入口
     */
    #removeDirectoryStack(entry = undefined) {
        if (typeof entry === 'object' && entry.name !== this.current_directory_entry.name) {
            console.alert('[FHFileView] Rejected removal of mismatched stacks.');
            return;
        }
        this.directory_stack.pop();
    }

    /**
     * 访问文件
     * @param {string} name 文件名
     * @returns {Promise} Promise
     */
    async access(name) {
        if (typeof name !== 'string') {
            return this.manager._rejectReturnReason('INPUT__TYPE_ERROR');
        }

        name = name.trim();
        if (name === '') {
            return this.manager._rejectReturnReason('INPUT__VALUE_INVALID');
        }

        const r = await this.current_directory_entry.get(name);
        if (!r.success) return r;
        const entry = r.payload;
        if (entry.is_file) {
            await entry._checkReady();
            return this.manager._resolveReturn(
                {
                    kind: 'file',
                    entry: entry
                },
                this.current_path,
                name
            );
        }
        this.#addDirectoryStack(entry);
        const list = await entry.list();
        return this.manager._resolveReturn(
            {
                kind: 'directory',
                list: list.payload,
                can_back: this.can_back
            },
            this.current_path
        );
    }

    /**
     * 返回上一级目录
     * @returns {Promise} Promise
     */
    async back() {
        if (!this.can_back) {
            return this.manager._rejectReturnReason('ACCESS__ROOT_DIRECTORY_RETURN');
        }

        this.#removeDirectoryStack();

        const list = await this.current_directory_entry.list();
        return this.manager._resolveReturn(
            {
                kind: 'directory',
                list: list.payload,
                can_back: this.can_back
            },
            this.current_path
        );
    }

    /**
     * 列出当前目录中的文件
     * @returns {Promise} Promise
     */
    async list() {
        return this.current_directory_entry.list();
    }

    /**
     * 在当前目录中创建文件
     * @param {string} name 文件名
     * @param {string} content 文件内容
     * @returns {Promise} Promise
     */
    async createFile(name, content = '') {
        return this.current_directory_entry.createFile(name, content);
    }

    /**
     * 在当前目录中创建目录
     * @param {string} name 目录名
     * @returns {Promise} Promise
     */
    async createDirectory(name) {
        return this.current_directory_entry.createDirectory(name);
    }

    /**
     * 销毁实例
     */
    destroy() {
        if (this.#destroyed) return;
        this.#destroyed = true;
        this.directory_stack.forEach(e => {
            e.destroy();
        });
        this.directory_stack = [];
        this.root_entry = null;
        this.manager = null;
    }
}

window.FHFileView = FHFileView;