const pad = n => String(n).padStart(2, '0');

export const daysIn = (y, m) => new Date(y, m + 1, 0).getDate();

export const startCol = (y, m) => (new Date(y, m, 1).getDay() + 6) % 7 + 1;

export const key = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

export function days(y, m, counts, photos) {
    const now = new Date();

    return Array.from({ length: daysIn(y, m) }, (_, i) => {
        const d = i + 1, k = key(y, m, d);
        const n = Math.min(counts[k] || 0, 4);
        const isToday = y === now.getFullYear() && m === now.getMonth() && d === now.getDate();
        const mosaic = photos?.[k]
            ? `<div class="mosaic">${photos[k].map(u => `<img src="${u}" alt="" loading="lazy">`).join('')}</div>`
            : '';

        return `<div data-item="day" data-month="${m + 1}" data-day="${d}" style="--n:${n}"${isToday ? ' class="current"' : ''}>${d}${mosaic}</div>`;
    }).join('');
}