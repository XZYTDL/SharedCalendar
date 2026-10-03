import { loadMonth, getUrls, login, onLogin, logout } from './supabase.js';
import { days, months, drawings } from './parts/_parts.js';
import { cal } from './_calendar.js';

const app = document.getElementById('app');
const loginDiv = document.getElementById('login');
const loginBtn = document.getElementById('login-btn');

const DATE = new Date();

const YEAR = DATE.getFullYear();
const pad = n => String(n).padStart(2, '0');

let loggedIn = false;


async function navigate(m, d) {
    if (!loggedIn) return;

    if (!m) { app.innerHTML = months(); return; } 
    if (!d) { app.children[Number(m)].classList.add('chosen'); return; }
    
    m = Number(m);
    
    app.innerHTML = 'Loading...';

    const day = `${YEAR}-${pad(m + 1)}-${pad(d)}`;
    console.log(day);
    try {
        const rows = ( await loadMonth(YEAR, m)).filter(r => r.day === day);
        const urls = await getUrls(rows);
        app.innerHTML = drawings(rows, urls, day);
    } catch (error) {
        console.error(error);
        app.innerHTML = 'Error: ' + error.message;
    }
}

loginBtn.addEventListener('click', () => login());

onLogin(user => {
    loggedIn = !!user;

    loginDiv.hidden = loggedIn;
    app.hidden = !loggedIn;

    if(!user) return;

    const p = new URLSearchParams(window.location.search);
    navigate(p.get('m'), p.get('d'));
});

document.addEventListener('click', (e) => {
    document.getElementsByClassName('chosen')[0]?.classList.remove('chosen');

    const target = e.target?.closest?.('[data-item]');
    if (!target) return;


    const m = target.getAttribute('data-month');
    const d = target.getAttribute('data-day');

    navigate(m, d);
});