import { cal } from '../_calendar.js';
import { days, startCol } from './days.js';

const WD = ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(l => `<span>${l}</span>`).join('');

export function months(S, counts, photos) {
    const now = new Date();

    return `<section class="months">` + cal.map((c, m) => {
        const open = S.m === m;
        const current = S.y === now.getFullYear() && m === now.getMonth();
        const prefix = `${S.y}-${String(m + 1).padStart(2, '0')}-`;
        const tot = Object.entries(counts).reduce((a, [k, v]) => k.startsWith(prefix) ? a + v : a, 0);

        return `<article class="month${open ? ' open' : ''}${current ? ' current' : ''}" data-item="month" data-month="${m + 1}" style="--vt:m${m + 1}">
            <h3>${c.name}<small>${tot} foto</small></h3>
            <div class="weekdays">${WD}</div>
            <div class="days-container" style="--start:${startCol(S.y, m)}">${days(S.y, m, counts, open ? photos : null)}</div>
        </article>`;
    }).join('') + `</section>`;
}