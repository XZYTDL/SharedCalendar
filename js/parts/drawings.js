export function drawings(rows, urls, day) {
    if (!rows.length) return `<h2>${day}</h2><p>No drawings yet.</p>`;

    return rows.map(r => `<figure><img src="${urls[r.path]}" alt=""><figcaption>${r.nickname || r.author.split('@')[0]}</figcaption></figure>`).join('');
}