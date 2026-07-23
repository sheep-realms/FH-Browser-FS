class FHDirectoryEntry extends FHFileSystemEntry {
    #destroyed;

    constructor(manager, handle = null, path = '/', options = {}) {
        super(manager, handle, path, options);
        this.is_root = (options.root_directory ?? false) && handle.kind === 'directory';
        this.#destroyed = false;
    }

    /**
     * 列出目录中的文件
     * @returns {Promise} Promise
     */
    async list() {
        const entries = [];
        for await (const [name, handle] of this.handle.entries()) {
            const entry = this.manager.createEntry(handle, this.absolute_path);
            if (entry.is_file) await entry._checkReady();
            entries.push(entry);
        }
        entries.sort((a, b) => {
            if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1;
            return a.name.localeCompare(b.name);
        });

        return this._resolveReturn(entries)
    }

    /**
     * 获取目录中指定的文件
     * @param {string} name 文件名
     * @returns {Promise} Promise
     */
    async get(name) {
        const r = await this.list();
        const entry = r.payload.find(e => e.name === name);

        if (entry === undefined) {
            return this._rejectReturnReason(
                'ACCESS__FILE_NOT_FOUND',
                this.absolute_path,
                name
            )
        }
        
        return this._resolveReturn(entry, entry.path, entry.name)
    }

    /**
     * 创建文件
     * @param {string} name 文件名
     * @param {string} content 文件内容
     * @returns {Promise} Promise
     */
    async createFile(name, content = '') {
        if (!this._checkFileName(name)) {
            return this._rejectReturn({
                reason: 'WRITE__FILE_NAME_UNACCEPTABLE',
                name,
            });
        }

        try {
            const newFileHandle = await this.handle.getFileHandle(name, { create: true });
            const writable = await newFileHandle.createWritable();
            await writable.write(content);
            await writable.close();
            const entry = this.manager.createEntry(newFileHandle, this.absolute_path);
            return this._resolveReturn(entry, this.absolute_path, name);
        } catch (error) {
            const ERROR_REASON = {
                NotAllowedError:    'SYSTEM__READ_ONLY',
                TypeMismatchError:  'WRITE__DIRECTORY_NAME_OCCUPIED',
                TypeError:          'PARAMETER__TYPE_ERROR'
            }
            if (ERROR_REASON[error.name] === undefined) {
                return this._rejectReturn({
                    reason: 'WRITE__UNKNOW_ERROR',
                    error
                });
            }
            return this._rejectReturn({
                reason: ERROR_REASON[error.name],
                error
            });
        }
    }

    /**
     * 创建目录
     * @param {string} name 目录名
     * @returns {Promise} Promise
     */
    async createDirectory(name) {
        if (!this._checkFileName(name)) {
            return this._rejectReturn({
                reason: 'WRITE__FILE_NAME_UNACCEPTABLE',
                name,
            });
        }

        try {
            const newDirectoryHandle = await this.handle.getDirectoryHandle(name, { create: true });
            const entry = this.manager.createEntry(newDirectoryHandle, this.absolute_path);
            return this._resolveReturn(entry, this.absolute_path, name);
        } catch (error) {
            const ERROR_REASON = {
                NotAllowedError:    'SYSTEM__READ_ONLY',
                TypeMismatchError:  'WRITE__DIRECTORY_NAME_OCCUPIED',
                TypeError:          'PARAMETER__TYPE_ERROR'
            }
            if (ERROR_REASON[error.name] === undefined) {
                return this._rejectReturn({
                    reason: 'WRITE__UNKNOW_ERROR',
                    error
                });
            }
            return this._rejectReturn({
                reason: ERROR_REASON[error.name],
                error
            });
        }
    }

    /**
     * 删除文件
     * @param {string} name 文件名
     * @param {Object} options 选项
     * @param {boolean} options.recursive 是否递归删除
     * @returns {Promise} Promise
     */
    async deleteFile(name, options = {}) {
        const { recursive = false } = options;

        if (!this._checkFileName(name)) {
            return this._rejectReturn({
                reason: 'WRITE__FILE_NAME_UNACCEPTABLE',
                name,
            });
        }

        try {
            await this.handle.removeEntry(name, { recursive });
            return this._resolveReturn(undefined, this.absolute_path, name);
        } catch (error) {
            const ERROR_REASON = {
                InvalidModificationError:   'DELETE__HAS_CHILDREN',
                NotAllowedError:            'SYSTEM__READ_ONLY',
                NotFoundError:              'ACCESS__FILE_NOT_FOUND',
                TypeError:                  'PARAMETER__TYPE_ERROR'
            }
            if (ERROR_REASON[error.name] === undefined) {
                return this._rejectReturn({
                    reason: 'WRITE__UNKNOW_ERROR',
                    error
                });
            }
            return this._rejectReturn({
                reason: ERROR_REASON[error.name],
                error
            });
        }
    }

    /**
     * 删除目录
     * @param {string} name 目录名
     * @returns {Promise} Promise
     */
    async deleteDirectory(name) {
        return this.deleteFile(name, { recursive: true });
    }

    /**
     * 销毁实例
     * @param {Object} options 选项
     * @param {boolean} options.allow_destroy_root 允许销毁根目录
     */
    destroy(options = {}) {
        const { allow_destroy_root = false } = options;
        if (this.is_root && !allow_destroy_root) {
            throw new Error('[FHDirectoryEntry] The root directory cannot be destroyed. If you believe this is not an error, please set allow_destroy_root = true');
        }
        if (this.#destroyed) return;
        this.#destroyed = true;
        this.handle = null;
        this.manager = null;
    }
}

window.FHDirectoryEntry = FHDirectoryEntry;