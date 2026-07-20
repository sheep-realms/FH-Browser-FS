class FHFileEntry extends FHFileSystemEntry {
    constructor(manager, handle = null, path = '/', options = {}) {
        super(manager, handle, path, options);
    }

    get extension_name() {
        return this.name.split('.').pop();
    }

    get name_without_extension() {
        let a = this.name.split('.');
        a.pop();
        return a.join('.');
    }
}

window.FHFileEntry = FHFileEntry;