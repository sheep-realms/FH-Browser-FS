class FHFileSystemEntry {
    constructor(manager, handle = null, path = '/', options = {}) {
        this.path = path;
        this.handle = handle;
        this.manager = manager;
        this.is_root = options.root_directory && handle.kind === 'directory';
    }

    get kind() {
        return this.handle.kind;
    }

    get is_directory() {
        return this.kind === 'directory';
    }

    get is_file() {
        return this.kind === 'file';
    }

    get name() {
        return this.handle.name;
    }

    get absolute_path() {
        if (this.is_root) return '/';
        return this._resolvePath(this.path, this.name);
    }

    /**
     * 拼接并规范化路径
     * @param {...(string|Object)} args ...路径, 选项
     * @param {Boolean} args.trailingSlash 保留末尾斜杠
     * @returns {string} 路径
     * @throws {Error}
     */
    _resolvePath(...args) {
        return this.manager._resolvePath(this.path, ...args);
    }

    /**
     * 接受返回值
     * @param {Object} payload 载荷
     * @param {string} path 路径
     * @param {string} name 文件名
     * @returns {Promise} Promise
     */
    _resolveReturn(payload = {}, path = this.path, name = this.name) {
        return this.manager._resolveReturn(payload, path, name);
    }

    /**
     * 拒绝返回值
     * @param {Object} payload 载荷
     * @param {string} path 路径
     * @param {string} name 文件名
     * @returns {Promise} Promise
     */
    _rejectReturn(payload = {}, path = this.path, name = this.name) {
        return this.manager._resolveReturn(payload, path, name);
    }

    /**
     * 拒绝返回理由
     * @param {Object} reason 理由
     * @param {string} path 路径
     * @param {string} name 文件名
     * @returns {Promise} Promise
     */
    _rejectReturnReason(reason, path = this.path, name = this.name) {
        return this.manager._rejectReturnReason(reason, path, name);
    }
}

window.FHFileSystemEntry = FHFileSystemEntry;