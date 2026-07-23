const fileManager = new FHFileManager('test');

let userView = null;

let demo_print = [];

function getFileIcon(entry) {
    const typeMap = {
        text: 'file-document',
        image: 'file-image'
    };
    const extMap = {
        'appref-ms': 'application',
        db: 'database',
        accdb: 'database',
        csv: 'file-table',
        doc: 'file-word',
        docm: 'file-word',
        docx: 'file-word',
        exe: 'application',
        md: 'language-markdown',
        ppt: 'file-powerpoint',
        pptm: 'file-powerpoint',
        pptx: 'file-powerpoint',
        pub: 'file-document',
        sql: 'database',
        xls: 'file-excel',
        xlsm: 'file-excel',
        xlsx: 'file-excel',
        zip: 'zip-box'
    };

    if (entry.is_directory) return ICON.folder;

    const [ type, typeEx ] = entry.type.split('/');
    if (extMap[entry.extension_name] !== undefined) return ICON[extMap[entry.extension_name]];
    if (typeMap[type] !== undefined) return ICON[typeMap[type]];
    return ICON.file;
}

function renderFileList(list) {
    const fileListSel = $('#file-list');
    fileListSel.text('');

    let dom = '';
    list.forEach(e => {
        dom += `<li class="file-item">
            <span class="file-icon">${ getFileIcon(e) }</span>
            <span class="file-name"><a class="file-item-link" href="javascript:;" data-file-name="${ e.name }">${ e.name }</a></span>
            <span class="file-type" title="${ e.is_file ? e.type : '' }">${ e.is_file ? e.type : '' }</span>
            <span class="file-size">${ e.is_file ? e.format_size : '' }</span>
            <span class="file-last-modified">${ e.is_file ? e.last_modified_format_date : '' }</span>
        </li>`;
    });

    fileListSel.html(`<ul class="file-list-content">${ dom }</ul>`);
}

function checkActionEnable() {
    $('.btn-view-action').removeAttr('disabled');
    if (userView.can_back) {
        $('#view-back').removeAttr('disabled');
    } else {
        $('#view-back').attr('disabled', '');
    }
}

$(document).on('click', '#pick-directory', async function() {
    const r = await fileManager.pickDirectory();
    if (!r.success) return;

    const viewReturn = await fileManager.cerateView('user_view');
    if (!viewReturn.success) return;

    userView = viewReturn.payload;
    checkActionEnable();

    const listReturn = await userView.list();
    const list = listReturn.payload;
    renderFileList(list);
    $('#view-path').text('/');
})

$(document).on('click', '#view-back', async function() {
    const r = await userView.back(name);
    if (!r.success) return;
    checkActionEnable();
    $('#view-path').text(r.path);
    renderFileList(r.payload.list);
})

$(document).on('click', '#view-refresh', async function() {
    const r = await userView.list();
    if (!r.success) return;
    renderFileList(r.payload);
})

$(document).on('click', '#view-create-file', async function() {
    const name = prompt('File Name:', 'New File');
    const r = await userView.createFile(name);
    if (!r.success) return;
    const r2 = await userView.list();
    if (!r2.success) return;
    renderFileList(r2.payload);
})

$(document).on('click', '#view-create-directory', async function() {
    const name = prompt('Folder Name:', 'New Folder');
    const r = await userView.createDirectory(name);
    if (!r.success) return;
    const r2 = await userView.list();
    if (!r2.success) return;
    renderFileList(r2.payload);
})

$(document).on('click', '#view-demo-print-directory', function() {
    demo_print = userView.current_directory_entry;
})

$(document).on('click', '#view-demo-print-list', async function() {
    const r = await userView.list();
    if (!r.success) return;
    demo_print = r.payload;
})

$(document).on('click', '.file-item-link', async function() {
    const name = String($(this).data('file-name'));

    const r = await userView.access(name);
    if (!r.success) return;
    checkActionEnable();

    if (r.payload.kind === 'file') return;

    $('#view-path').text(r.path);
    renderFileList(r.payload.list);
})