class FHFileEntry extends FHFileSystemEntry {
    #check_ready_callback;

    constructor(manager, handle = null, path = '/', options = {}) {
        super(manager, handle, path, options);
        this.file = null;
        this.is_ready = false;
        this.#check_ready_callback = () => {};

        this._getFile();
    }

    get extension_name() {
        return this.name.split('.').pop().toLowerCase();
    }

    get name_without_extension() {
        let a = this.name.split('.');
        a.pop();
        return a.join('.');
    }

    get size() {
        return this.file.size;
    }

    get format_size() {
        const bytes = this.size;
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KiB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MiB';
        if (bytes < 1024 * 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GiB';
        return (bytes / (1024 * 1024 * 1024 * 1024)).toFixed(1) + ' TiB';
    }

    get type() {
        return this.file.type;
    }

    get last_modified() {
        return this.file.lastModified;
    }

    get last_modified_date() {
        return this.file.lastModifiedDate;
    }

    get last_modified_format_date() {
        return this.last_modified_date.toLocaleString();
    }

    async _checkReady() {
        if (this.is_ready) return new Promise(resolve => resolve());

        let rsl = () => {};
        const p = new Promise(resolve => rsl = resolve);
        this.#check_ready_callback = () => {
            rsl();
        }
        return p;
    }

    async _getFile() {
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

    getFile() {
        if (!this.is_ready) return;
        return this.file;
    }

    async readText() {
        if (!this.is_ready) await this._getFile();

        const text = await this.file.text();

        return this._resolveReturn(text);
    }

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