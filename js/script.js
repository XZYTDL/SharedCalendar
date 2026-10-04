import { months } from './parts/months.js';
import { drawings } from './parts/drawings.js';
import { key } from './parts/days.js';
import { loadYear, loadMonth, getUrls, onLogin, sb, logout, login, upload, remove } from './supabase.js';
import { openSettings } from './settings.js';

const $ = id => document.getElementById(id);
const app = $('app'), sheet = $('sheet'), viewer = $('viewer');

const S = { y: new Date().getFullYear(), m: null };
let counts = {};
let monthRows = [];
let urls = {};
let openKey = null;
let viewerIdx = 0;
let meEmail = '';
let nickname = '';

function setView() {
    document.body.dataset.view = sheet.open ? 'day' : S.m !== null ? 'month' : 'months';
}

async function load() {
    counts = await loadYear(S.y);
    monthRows = S.m !== null ? await loadMonth(S.y, S.m) : [];
    urls = await getUrls(monthRows);
}

function render() {
    const photos = {};
    monthRows.forEach(r => (photos[r.day] ??= []).push(urls[r.path]));
    $('yl').textContent = S.y;
    app.innerHTML = months(S, counts, photos);
    setView();
}

function go(change) {
    const run = async () => {
        try { change(); await load(); render(); } catch (err) { alert(err.message); }
    };
    return document.startViewTransition ? document.startViewTransition(run) : run();
}

function openDay(d) {
    const day = key(S.y, S.m, d);
    openKey = day;

    const title = new Date(S.y, S.m, d).toLocaleDateString('en-EN', { weekday: 'long', day: 'numeric', month: 'long' });
    sheet.innerHTML = drawings(title, S.y, monthRows.filter(r => r.day === day), urls);
    sheet.show();
    setView();
}

document.addEventListener('click', e => {
    const yr = e.target.closest('.yr');
    if (yr) return go(() => { sheet.close(); S.y += +yr.dataset.step; S.m = null; });
    if (e.target.closest('.close')) return sheet.close();
    if (e.target.closest('.back')) return sheet.open ? sheet.close() : go(() => { S.m = null; });

    const day = e.target.closest('.month.open [data-day]');
    if (day) return openDay(+day.dataset.day);

    const mo = e.target.closest('.month');
    if (mo && !mo.classList.contains('open')) go(() => { sheet.close(); S.m = +mo.dataset.month - 1; });
});


/* =======
# UPLOAD # 
======= */

async function handleFiles(fileList) {
    const room = 4 - monthRows.filter(r => r.day === openKey).length;
    const files = [...fileList].filter(f => f.type.startsWith('image/')).slice(0, room);
    if (!files.length) return;
 
    const zone = sheet.querySelector('.dropzone');
    const label = zone.querySelector('span');
    zone.setAttribute('aria-disabled', 'true');
    try {
        for (const [i, file] of files.entries()) {
            label.textContent = `Carico ${i + 1} di ${files.length}…`;
            await upload(openKey, file);                               
        }
    } catch (err) {
        console.error(err.message);
    }
    const d = +openKey.slice(8);
    await load(); render(); openDay(d);
}

sheet.addEventListener('change', e => {
    if (!e.target.matches('.dropzone input')) return;
    handleFiles(e.target.files);
    e.target.value = '';
});

for (const t of ['dragenter', 'dragover']) sheet.addEventListener(t, e => e.target.closest('.dropzone')?.classList.add('over'));
for (const t of ['dragleave', 'drop']) sheet.addEventListener(t, e => e.target.closest('.dropzone')?.classList.remove('over'));
for (const t of ['dragover', 'drop']) window.addEventListener(t, e => { if (!e.target.closest?.('.dropzone')) e.preventDefault(); });


/* ===========
# FULLSCREEN #
=========== */

const dayRows = () => monthRows.filter(r => r.day === openKey);
 
function showAt(i) {
    const rows = dayRows();
    viewerIdx = (i + rows.length) % rows.length;
    const r = rows[viewerIdx];
    const mine = r.author === meEmail;
    viewer.innerHTML = `
        <img src="${urls[r.path] || ''}" alt="">
        <button class="v-close" aria-label="Chiudi"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x preview-icon"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
        ${rows.length > 1 ? '<button class="v-nav v-prev" aria-label="Precedente"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left preview-icon"><path d="m15 18-6-6 6-6"/></svg></button><button class="v-nav v-next" aria-label="Successiva"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right preview-icon"><path d="m9 18 6-6-6-6"/></svg></button>' : ''}
        <div class="v-bar"><span>${r.nickname || r.author.split('@')[0]} · ${viewerIdx + 1}/${rows.length}</span>${mine ? '<button class="v-del"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash preview-icon"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>' : ''}</div>`;
}
 
sheet.addEventListener('click', e => {
    const fig = e.target.closest('.photo');
    if (!fig) return;
    showAt(+fig.dataset.i);
    viewer.showModal();
});
 
viewer.addEventListener('click', async e => {
    if (e.target === viewer || e.target.closest('.v-close')) return viewer.close();
    if (e.target.closest('.v-prev')) return showAt(viewerIdx - 1);
    if (e.target.closest('.v-next')) return showAt(viewerIdx + 1);
    if (!e.target.closest('.v-del')) return;
 
    if (!confirm('Delete this photo?')) return;
    const i = viewerIdx, d = +openKey.slice(8);
    try { await remove(dayRows()[i]); } catch (err) { return alert(err.message); }
    await load(); render(); openDay(d);
    dayRows().length ? showAt(Math.min(i, dayRows().length - 1)) : viewer.close();
});
 
viewer.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') showAt(viewerIdx - 1);
    if (e.key === 'ArrowRight') showAt(viewerIdx + 1);
});

let x0 = null;
viewer.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
viewer.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 50) showAt(viewerIdx + (dx < 0 ? 1 : -1));
});
 
sheet.addEventListener('close', setView);


/* ======
# LOGIN #
====== */

$('login-btn').onclick = () => login();
$('logout').onclick = () => logout();

$('settings-btn').onclick = () => {
    $('menu').hidePopover();
    openSettings({
        email: meEmail,
        nickname,
        onSaved: async n => {
            nickname = n;
            $('whoName').textContent = n;
            if (!$('avatar').querySelector('img')) $('avatar').textContent = n[0].toUpperCase();
            await load(); render();
            if (sheet.open && openKey) openDay(+openKey.slice(8));
        },
    });
};

onLogin(async user => {
    $('login').hidden = !!user;
    app.hidden = !user;
    document.querySelector('.nav').hidden = !user;
    if (!user) return;
    meEmail = user.email;

    const pic = user.user_metadata.avatar_url || user.user_metadata.picture;
    if (pic) {
        const img = new Image();
        img.referrerPolicy = 'no-referrer';
        img.alt = '';
        img.onload = () => $('avatar').replaceChildren(img);
        img.src = pic;
    }

    const { data } = await sb.from('members').select('nickname').maybeSingle();
    const name = data?.nickname || user.email.split('@')[0];
    nickname = name;
    $('nick').textContent = name;
    $('email').textContent = user.email;
 
    try { await load(); render(); } catch (err) { alert(err.message); }
});