import { cal } from '../_calendar.js';

export function days(month) {
    const now = new Date();
    const total = cal[month]?.days ?? 0;

    return Array.from({ length: total }, (_, k) => {
        const d = k + 1;
        const isToday = month === now.getMonth() && d === now.getDate();

        return `<div data-item="day" data-month="${month}" data-day="${d}"${isToday ? ' class="current"' : ''}>`
            + (isToday ? `<span>${d}</span>` : d)
            + `</div>`;
    }).join('');
}