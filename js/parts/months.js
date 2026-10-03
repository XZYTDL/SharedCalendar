import { cal } from '../_calendar.js';
import { days } from './days.js';

export function months() {
    const currentMonth = new Date().getMonth();

    return cal.map((m, i) => `
        <div class="month${i === currentMonth ? ' current' : ''}" data-item="month" data-month="${i}">
            <h3>${m.name}</h3>
            <div class="days-container">${days(i)}</div>
        </div>`).join('');
}