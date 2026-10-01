import { days, months, drawings } from './parts/_parts.js';
import { cal } from './_calendar.js';

const app = document.getElementById('app');

function navigate(m, d) {
    app.innerHTML = '';

    console.log(m, d);

    if (!m) app.innerHTML = months();
    else if (!d) app.innerHTML = days(m);
    else app.innerHTML = drawings();
}

document.addEventListener('click', (e) => {
    const target = e.target?.closest?.('[data-item]');
    if (!target) return;

    const m = target.getAttribute('data-month');
    const d = target.getAttribute('data-day');

    navigate(m, d);
});

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const m = urlParams.get('m');
    const d = urlParams.get('d');

    navigate(m, d);
});