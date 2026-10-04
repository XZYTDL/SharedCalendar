export function drawings(title, year, rows, urls) {
    const photos = rows.map((r, i) => `
        <figure class="photo" data-i="${i}">
            <img src="${urls[r.path] || ''}" alt="">
            <figcaption><span>${r.nickname || r.author.split('@')[0]}</span></figcaption>
        </figure>`).join('');

    return `
        <div class="sheet-head"><h2>${title}<small>${year}</small></h2><button class="close" aria-label="Close"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x preview-icon"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button></div>
        <div class="photos">${photos}</div>
        <label class="dropzone"${rows.length >= 4 ? ' aria-disabled="true"' : ''}>
            <strong>Drag photos here</strong>
            <span>${rows.length} out of 4 · Or click to choose</span>
            <input type="file" accept="image/*" multiple>
        </label>`;
}