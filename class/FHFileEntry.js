class FHFileEntry extends FHFileSystemEntry {
    #check_ready_callback;

    constructor(manager, handle = null, path = '/', options = {}) {
        super(manager, handle, path, options);
        this.file = null;
        this.is_ready = false;
        this.#check_ready_callback = () => {};

        handle.getFile()
            .then(file => {
                this.file = file;
                this.is_ready = true;
                this.#check_ready_callback();
            })
            .catch(error => { throw error });
    }

    get extension_name() {
        return this.name.split('.').pop();
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

    async _checkReady() {
        if (this.is_ready) return new Promise(resolve => resolve());

        let rsl = () => {};
        const p = new Promise(resolve => rsl = resolve);
        this.#check_ready_callback = () => {
            rsl();
        }
        return p;
    }

    getFile() {
        if (!this.is_ready) return;
        return this.file;
    }
}

window.FHFileEntry = FHFileEntry;