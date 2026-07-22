const fileManager = new FHFileManager('test');

let userView = null;

let demo_print = [];

function renderFileList(list) {
    const fileListSel = $('#file-list');
    fileListSel.text('');

    let dom = '';
    list.forEach(e => {
        dom += `<li class="file-item">
            <a class="file-item-link" href="javascript:;" data-file-name="${ e.name }">${ e.name }</a>
            <span class="file-size">${ e.is_file ? e.format_size : '' }</span>
            <span class="file-last-modified">${ e.is_file ? e.last_modified_format_date : '' }</span>
        </li>`;
    });

    fileListSel.html(`<ul class="file-list-content">${ dom }</ul>`);
}

function checkActionEnable() {
    $('#view-refresh, #view-demo-print').removeAttr('disabled');
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

$(document).on('click', '#view-demo-print', async function() {
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