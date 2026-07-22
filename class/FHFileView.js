class FHFileView {
    constructor(manager) {
        this.manager = manager;
        this.root_entry = manager.root_entry;
        this.directory_stack = [];
    }

    get can_back() {
        return this.directory_stack.length > 0;
    }
    
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

    get current_directory_entry() {
        if (this.directory_stack.length === 0) return this.root_entry;
        return this.directory_stack[this.directory_stack.length - 1];
    }

    #addDirectoryStack(entry) {
        this.directory_stack.push(entry);
    }

    #removeDirectoryStack(entry) {
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
            return this.manager._rejectReturnReason('PARAMETER__TYPE_ERROR');
        }

        name = name.trim();
        if (name === '') {
            return this.manager._rejectReturnReason('PARAMETER__VALUE_INVALID');
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
     * 返回上一级文件夹
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

    async list() {
        return this.current_directory_entry.list();
    }
}

window.FHFileView = FHFileView;