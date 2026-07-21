class FHDirectoryEntry extends FHFileSystemEntry {
    constructor(manager, handle = null, path = '/', options = {}) {
        super(manager, handle, path, options);
        this.is_root = (options.root_directory ?? false) && handle.kind === 'directory';
    }

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
}

window.FHDirectoryEntry = FHDirectoryEntry;