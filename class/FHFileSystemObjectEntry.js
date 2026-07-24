class FHFileSystemObjectEntry {
    constructor(master, handle = null, path = '/', options = {}) {
        this.path = path;
        this.handle = handle;
        this.master = master;
    }

    // 文件或目录
    get kind() {
        return this.handle.kind;
    }

    // 是否为目录
    get is_directory() {
        return this.kind === 'directory';
    }

    // 是否为文件
    get is_file() {
        return this.kind === 'file';
    }

    // 文件名
    get name() {
        return this.handle.name;
    }

    // 包含文件名的完整路径
    get absolute_path() {
        if (this.is_root) return '/';
        return this._resolvePath(this.path, this.name);
    }

    /**
     * 检查文件名是否合法
     * @param {string} name 文件名
     * @returns {boolean} 是否合法
     */
    _checkFileName(name) {
        if (typeof name !== 'string') return false;
        return this.master.config.security.file_name_prevent_rule.test(name);
    }

    /**
     * 拼接并规范化路径
     * @param {...(string|Object)} args ...路径, 选项
     * @param {Boolean} args.trailingSlash 保留末尾斜杠
     * @returns {string} 路径
     * @throws {Error}
     */
    _resolvePath(...args) {
        return this.master._resolvePath(this.path, ...args);
    }

    /**
     * 接受返回值
     * @param {Object} payload 载荷
     * @param {string} path 路径
     * @param {string} name 文件名
     * @returns {Promise} Promise
     */
    _resolveReturn(payload = {}, path = this.path, name = this.name) {
        return this.master._resolveReturn(payload, path, name);
    }

    /**
     * 拒绝返回值
     * @param {Object} payload 载荷
     * @param {string} path 路径
     * @param {string} name 文件名
     * @returns {Promise} Promise
     */
    _rejectReturn(payload = {}, path = this.path, name = this.name) {
        return this.master._rejectReturn(payload, path, name);
    }

    /**
     * 拒绝返回理由
     * @param {Object} reason 理由
     * @param {string} path 路径
     * @param {string} name 文件名
     * @returns {Promise} Promise
     */
    _rejectReturnReason(reason, path = this.path, name = this.name) {
        return this.master._rejectReturnReason(reason, path, name);
    }
}

window.FHFileSystemObjectEntry = FHFileSystemObjectEntry;