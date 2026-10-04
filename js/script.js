import { months } from './parts/months.js';
import { drawings } from './parts/drawings.js';
import { key } from './parts/days.js';
import { loadYear, loadMonth, getUrls, onLogin, sb, logout, login } from './supabase.js';

const $ = id => document.getElementById(id);
const app = $('app'), sheet = $('sheet');

const S = { y: new Date().getFullYear(), m: null };
let counts = {};
let monthRows = [];
let urls = {};

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

    const title = new Date(S.y, S.m, d).toLocaleDateString('en-EN', { weekday: 'long', day: 'numeric', month: 'long' });
    sheet.innerHTML = drawings(title, S.y, monthRows.filter(r => r.day === day), urls);
    sheet.show();
    setView();
    // TODO upload: sul <input type="file"> del pannello chiama uploadPhoto(day, file), poi go(() => {}) e riapri il giorno
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

sheet.addEventListener('close', setView);


/* ======
# LOGIN #
====== */

$('login-btn').onclick = () => login();
$('logout').onclick = () => logout();
 
onLogin(async user => {
    $('login').hidden = !!user;
    app.hidden = !user;
    document.querySelector('.nav').hidden = !user;
    if (!user) return;

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
    $('nick').textContent = name;
    $('email').textContent = user.email;
 
    try { await load(); render(); } catch (err) { alert(err.message); }
});