const FONTS = [
    { name: 'Geist', css: null, gf: null },
    { name: 'Sistema', css: "system-ui, -apple-system, 'Segoe UI', sans-serif", gf: null },
    { name: 'Times New Roman', css: "'Times New Roman', Times, serif", gf: null },
    { name: 'Bricolage Grotesque', css: "'Bricolage Grotesque', system-ui, sans-serif", gf: 'Bricolage+Grotesque:wght@300;400;500' },
    { name: 'Instrument Serif', css: "'Instrument Serif', Georgia, serif", gf: 'Instrument+Serif' },
    { name: 'Caveat', css: "'Caveat', cursive", gf: 'Caveat:wght@400;500' },
    { name: 'UnifrakturMaguntia', css: "'UnifrakturMaguntia', cursive", gf: 'UnifrakturMaguntia' },
    { name: 'Quicksand', css: "'Quicksand', sans-serif", gf: 'Quicksand:wght@300..700' },
];

const PRESETS = ['#c8ff2e', '#2b2bff', '#ff5a36', '#ff4fa3', '#19d3ff', '#8b5cf6', '#ffb000'];

const root = document.documentElement;
const dlg = document.getElementById('settings');
let ctx = {};

const load = () => { try { return JSON.parse(localStorage.getItem('prefs')) || {}; } catch { return {}; } };
const save = p => localStorage.setItem('prefs', JSON.stringify(p));

function contrast(hex) {
    const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
    return (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? '#08080a' : '#fff';
}

function loadFont(f) {
    if (!f.gf || document.getElementById('gf-' + f.name)) return;
    const l = document.createElement('link');
    l.id = 'gf-' + f.name; l.rel = 'stylesheet';
    l.href = `https://fonts.googleapis.com/css2?family=${f.gf}&display=swap`;
    document.head.append(l);
}

export function applyPrefs() {
    const { font, accent } = load();
    const f = FONTS.find(x => x.name === font);
    if (f?.css) { loadFont(f); root.style.setProperty('--sans', f.css); } else root.style.removeProperty('--sans');
    if (accent) { root.style.setProperty('--accent', accent); root.style.setProperty('--on-accent', contrast(accent)); }
    else { root.style.removeProperty('--accent'); root.style.removeProperty('--on-accent'); }
}
applyPrefs();

function mark() {
    const p = load();
    dlg.querySelectorAll('[data-font]').forEach(b => b.setAttribute('aria-pressed', b.dataset.font === (p.font || 'Geist')));
    dlg.querySelectorAll('[data-color]').forEach(b => b.setAttribute('aria-pressed', b.dataset.color === p.accent));
}
function setPref(patch) {
    const p = { ...load(), ...patch };
    Object.keys(p).forEach(k => p[k] == null && delete p[k]);
    save(p); applyPrefs(); mark();
}

async function saveNick(nick) {
    const msg = dlg.querySelector('#set-msg');
    if (!nick) { msg.textContent = 'Il nickname non può essere vuoto.'; return; }
    msg.textContent = 'Salvo…';
    const a = await sb.from('members').update({ nickname: nick }).eq('email', ctx.email).select('nickname');
    if (a.error || !a.data.length) { msg.textContent = 'Errore: ' + (a.error?.message || 'non salvato (hai eseguito settings.sql?)'); return; }
    const b = await sb.from('entries').update({ nickname: nick }).eq('author', ctx.email);
    msg.textContent = b.error ? 'Salvato, ma le foto vecchie no: ' + b.error.message : 'Salvato ✓';
    ctx.onSaved(nick);
}

dlg.addEventListener('click', e => {
    if (e.target === dlg || e.target.closest('[data-close]')) return dlg.close();
    const font = e.target.closest('[data-font]');
    if (font) return setPref({ font: font.dataset.font });
    const color = e.target.closest('[data-color]');
    if (color) return setPref({ accent: color.dataset.color });
    if (e.target.closest('[data-reset]')) setPref({ font: null, accent: null });
});
dlg.addEventListener('input', e => { if (e.target.id === 'set-color') setPref({ accent: e.target.value }); });
dlg.addEventListener('change', e => { if (e.target.id === 'set-nick') saveNick(e.target.value.trim()); });

export function openSettings(context) {
    ctx = context;
    const p = load();
    dlg.innerHTML = `
        <div class="sheet-head"><h2>Settings</h2><button class="close" data-close aria-label="Chiudi"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x preview-icon"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button></div>
        <section class="set">
            <h3>Nickname</h3>
            <input id="set-nick" maxlength="24" autocomplete="off">
            <small id="set-msg">It's shown under the photos you upload</small>
        </section>
        <section class="set">
            <h3>Font</h3>
            <div class="opts">${FONTS.map(f => `<button data-font="${f.name}" aria-pressed="false" style="font-family:${f.css || 'var(--sans)'}">Aa<span>${f.name}</span></button>`).join('')}</div>
        </section>
        <section class="set">
            <h3>Color</h3>
            <div class="opts">
                ${PRESETS.map(c => `<button class="swatch" data-color="${c}" style="--c:${c}" aria-label="Color ${c}" aria-pressed="false"></button>`).join('')}
                <label class="swatch custom" title="Choose a color"><input type="color" id="set-color" value="${p.accent || '#c8ff2e'}"></label>
                <button data-reset>Reset</button>
            </div>
        </section>`;
    dlg.querySelector('#set-nick').value = ctx.nickname;
    mark();
    dlg.showModal();
}