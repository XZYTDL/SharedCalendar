const PROJECT_URL = 'https://yyqwpgyytzgdslrfiijc.supabase.co';
const PUBLISHABLE_KEY = 'sb_publishable_2bxDezecgM1wuN1DuZkrbQ_i7tDYX1q';
const BUCKET = 'photos';

const MAX_IMAGES_PER_DAY = 4;

const sb = supabase.createClient(PROJECT_URL, PUBLISHABLE_KEY);

function login() {
    return sb.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: location.origin + location.pathname
        }
    });
}

function logout() {
    return sb.auth.signOut();
}

function onLogin(callback) {
    sb.auth.onAuthStateChange((event, session) => {
        setTimeout(() => {
            callback(session?.user);
        }, 0);
    });
}

// ------------ //

const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

async function loadMonth(year, month) {
    const { data, error } = await sb
        .from('entries')
        .select('*')
        .gte('day', iso(new Date(year, month, 1)))
        .lt('day', iso(new Date(year, month + 1, 1)))
        .order('created_at');

    if (error) throw error;
    return data;
}

async function getUrls(rows) {
    if (!rows.length) return {};

    const { data, error } = await sb.storage.from(BUCKET).createSignedUrls(
        rows.map(r => r.path),
        3600
    );

    if (error) throw error;
    return Object.fromEntries(data.map(d => [d.path, d.signedUrl]));
}

async function compress(file) {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, 1200 / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * k);
    c.height = Math.round(bmp.height * k);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    return new Promise(res => c.toBlob(res, 'image/jpeg', 0.78));
}

async function upload(day, file) {
    const blob = await compress(file);
    const path = day + '/' + crypto.randomUUID() + '.jpg';

    const up = await sb.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg' });
    if (up.error) throw up.error;

    const ins = await sb.from('entries').insert({ day, path });
    if (ins.error) {
        await sb.storage.from(BUCKET).remove([path]);
        throw ins.error;
    }
}

async function remove(row) {
    const del = await sb.from('entries').delete().eq('id', row.id);
    if (del.error) throw del.error;

    const rm = await sb.storage.from(BUCKET).remove([row.path]);
    if (rm.error) throw rm.error;
}

export { login, onLogin, logout, loadMonth, getUrls, upload, remove};