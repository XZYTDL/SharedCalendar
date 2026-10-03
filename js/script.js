import { loadMonth, getUrls, login, onLogin, logout } from './supabase.js';
import { days, months, drawings } from './parts/_parts.js';
import { cal } from './_calendar.js';

const app = document.getElementById('app');
const loginDiv = document.getElementById('login');
const loginBtn = document.getElementById('login-btn');

const YEAR = new Date().getFullYear();
const pad = n => String(n).padStart(2, '0');

let loggedIn = false;

async function navigate(m, d) {
    if (!loggedIn) return;

    
    if (!m) { app.innerHTML = months(); return; } 
    if (!d) { app.innerHTML = days(m); return; }
    
    app.innerHTML = 'Loading...';

    const day = `${YEAR}-${pad(m)}-${pad(d)}`;
    try {
        const rows = ( await loadMonth(YEAR, m - 1)).filter(r => r.day === day);
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
    const target = e.target?.closest?.('[data-item]');
    if (!target) return;

    const m = target.getAttribute('data-month');
    const d = target.getAttribute('data-day');

    navigate(m, d);
});