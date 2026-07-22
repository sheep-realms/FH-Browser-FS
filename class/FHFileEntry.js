class FHFileEntry extends FHFileSystemEntry {
    #check_ready_callback;

    constructor(manager, handle = null, path = '/', options = {}) {
        super(manager, handle, path, options);
        this.file = null;
        this.is_ready = false;
        this.#check_ready_callback = () => {};

        this.#getFile();
    }

    // 扩展名
    get extension_name() {
        return this.name.split('.').pop().toLowerCase();
    }

    // 不包含扩展名的文件名
    get name_without_extension() {
        let a = this.name.split('.');
        a.pop();
        return a.join('.');
    }

    // 文件尺寸
    get size() {
        return this.file.size;
    }

    // 文件的格式化尺寸
    get format_size() {
        const bytes = this.size;
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KiB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MiB';
        if (bytes < 1024 * 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GiB';
        return (bytes / (1024 * 1024 * 1024 * 1024)).toFixed(1) + ' TiB';
    }

    // 文件 MIME 类型
    get type() {
        return this.file.type;
    }

    // 最后修改时间（时间戳）
    get last_modified() {
        return this.file.lastModified;
    }

    // 最后修改时间（Date 对象）
    get last_modified_date() {
        return this.file.lastModifiedDate;
    }

    // 最后修改时间（格式化时间）
    get last_modified_format_date() {
        return this.last_modified_date.toLocaleString();
    }

    /**
     * 等候就绪
     * @description 如果已就绪则直接解决 Promise，否则将会阻塞异步直到就绪
     * @returns {Promise} Promise
     */
    async _checkReady() {
        if (this.is_ready) return new Promise(resolve => resolve());

        let rsl = () => {};
        const p = new Promise(resolve => rsl = resolve);
        this.#check_ready_callback = () => {
            rsl();
        }
        return p;
    }

    /**
     * 载入 File 对象
     * @private
     * @returns {Promise} Promise
     */
    async #getFile() {
        let rsl;
        const p = new Promise(resolve => { rsl = resolve });

        this.handle.getFile()
            .then(file => {
                this.file = file;
                this.is_ready = true;
                this.#check_ready_callback();
                rsl();
            })
            .catch(error => {
                throw error
            });
        return p;
    }

    /**
     * 获取 File 对象
     * @returns {File} File 对象
     */
    getFile() {
        if (!this.is_ready) return;
        return this.file;
    }

    /**
     * 读取文本
     * @returns {Promise} Promise
     */
    async readText() {
        if (!this.is_ready) await this.#getFile();

        const text = await this.file.text();

        return this._resolveReturn(text);
    }

    /**
     * 写入文本
     * @param {string} content 文本
     * @returns {Promise} Promise
     */
    async writeText(content) {
        try {
            const writable = await this.handle.createWritable();
            await writable.write(content);
            await writable.close();
            return this._resolveReturn();
        } catch (error) {
            const ERROR_REASON = {
                AbortError:                 'WRITE__ABORT',
                NotAllowedError:            'SYSTEM__READ_ONLY',
                NotFoundError:              'ACCESS__FILE_NOT_FOUND',
                NoModificationAllowedError: 'WRITE__NO_MODIFICATION_ALLOWED',
                QuotaExceededError:         'WRITE__QUOTA_EXCEEDED',
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
}

window.FHFileEntry = FHFileEntry;