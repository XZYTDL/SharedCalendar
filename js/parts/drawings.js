export function drawings(title, year, rows, urls) {
    const photos = rows.map(r => `
        <figure class="photo">
            <img src="${urls[r.path] || ''}" alt="">
            <figcaption><span>${r.nickname || r.author.split('@')[0]}</span></figcaption>
        </figure>`).join('');

    return `
        <div class="sheet-head"><h2>${title}<small>${year}</small></h2><button class="close" aria-label="Chiudi">×</button></div>
        <div class="photos">${photos}</div>
        <label class="dropzone"${rows.length >= 4 ? ' aria-disabled="true"' : ''}>
            <strong>Drag photos here</strong>
            <span>${rows.length} out of 4 · Or click to choose</span>
            <input type="file" accept="image/*" multiple>
        </label>`;
}