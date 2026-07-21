const fileManager = new FHFileManager('test');

let userView = null;

function renderFileList(list) {
    const fileListSel = $('#file-list');
    fileListSel.text('');

    let dom = '';
    list.forEach(e => {
        dom += `<li><button class="file-item" data-file-name="${ e.name }">${ e.name }${ e.is_file ? ` - ${ e.format_size }` : '' }</button></li>`;
    });

    fileListSel.html(`<ul>${ dom }</ul>`);
}

function checkActionEnable() {
    $('#view-refresh').removeAttr('disabled');
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
})

$(document).on('click', '#view-back', async function() {
    const r = await userView.back(name);
    if (!r.success) return;
    checkActionEnable();
    renderFileList(r.payload.list);
})

$(document).on('click', '#view-refresh', async function() {
    const r = await userView.list();
    if (!r.success) return;
    renderFileList(r.payload);
})

$(document).on('click', '.file-item', async function() {
    const name = String($(this).data('file-name'));

    const r = await userView.access(name);
    if (!r.success) return;
    checkActionEnable();

    if (r.payload.kind === 'file') return;

    renderFileList(r.payload.list);
})