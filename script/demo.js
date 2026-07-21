const fileManager = new FHFileManager('test');

let userView = null;

function renderFileList(list) {
    const fileListSel = $('#file-list');
    fileListSel.text('');

    let dom = '';

    list.forEach(e => {
        dom += `<li><button class="file-item" data-file-name="${ e.name }">${ e.name }</button></li>`;
    });

    fileListSel.html(`<ul>${ dom }</ul>`);
}

$(document).on('click', '#pick-directory', async function() {
    const r = await fileManager.pickDirectory();
    if (!r.success) return;
    $('#view-back').removeAttr('disabled');

    const viewReturn = await fileManager.cerateView('user_view');
    if (!viewReturn.success) return;

    userView = viewReturn.payload;
    
    const listReturn = await userView.list();
    const list = listReturn.payload;
    renderFileList(list);
})

$(document).on('click', '#view-back', async function() {
    const r = await userView.back(name);
    if (!r.success) return;
    renderFileList(r.payload.list);
})

$(document).on('click', '.file-item', async function() {
    const name = String($(this).data('file-name'));

    const r = await userView.access(name);
    if (!r.success) return;

    if (r.payload.kind === 'file') return;

    renderFileList(r.payload.list);
})