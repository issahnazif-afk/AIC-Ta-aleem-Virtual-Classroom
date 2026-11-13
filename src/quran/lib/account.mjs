// Adults' accounts for the Quran Library (taaleem.ca/quran/): register and sign in with a username and password,
// kept by the class server (apps-script/Code.gs, the "Adults" tab), apart from the children's accounts.
// What an adult keeps on the device (bookmarks, where they stopped reading, their Hifz test and Recite set-ups,
// reciter, translation and reading settings) is saved to their account too, so it follows them to another
// computer or phone. Finished Hifz tests are added to the "Adult sessions" tab.
//
// With no class server address (a local build), accounts are kept on this device only.

const ACCOUNT = 'ql-account';
// the device's ql-* settings that belong to the person (saved to their account, cleared on signing out)
const MINE = ['bookmarks', 'last-read', 'hifz', 'practice3', 'translation', 'reciter', 'wbw', 'riwayah', 'script', 'reveal', 'spread', 'focus', 'engine', 'paper', 'bold', 'arabic-size', 'theme', 'warsh', 'warsh-reciter'];

const serverUrl = () => document.body?.dataset.logUrl || '';
export const isDemo = () => !serverUrl();

export function me() {
  try { const a = JSON.parse(localStorage.getItem(ACCOUNT) || 'null'); return a && a.username && a.token ? a : null; }
  catch { return null; }
}
const keep = (a) => { try { localStorage.setItem(ACCOUNT, JSON.stringify(a)); } catch {} };

async function post(body, { timeout = 20000, keepalive = false } = {}) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeout);
  try {
    // text/plain: a simple request with no preflight, which Apps Script web apps accept from any website
    const r = await fetch(serverUrl(), { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body), signal: ctl.signal, redirect: 'follow', keepalive });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}

const MESSAGES = {
  'no-name': 'Enter your full name.',
  'bad-username': 'Usernames are 3 to 24 letters or numbers, and may use . _ or - (no spaces).',
  'short-password': 'Choose a password of at least 8 characters.',
  'username-taken': 'That username is already taken. Try another one.',
  'bad-login': 'The username or password is not right.',
  'bad-gender': 'Choose Brother or Sister.',
  'too-many': 'Too many tries. Wait 15 minutes, then try again.',
  'busy': 'Many people are joining right now. Please try again in a little while.',
  'unknown-action': 'Adult accounts are not switched on yet. Please try again later.',
  'signed-out': 'Your sign-in has expired. Please sign in again.',
};
const OFFLINE = 'The server could not be reached. Check your internet connection and try again.';

function snapshot() {
  const out = {};
  for (const k of MINE) { try { const v = localStorage.getItem('ql-' + k); if (v !== null) out[k] = v; } catch {} }
  return out;
}
function apply(progress) {
  for (const k of MINE) {
    try {
      if (progress && typeof progress[k] === 'string') localStorage.setItem('ql-' + k, progress[k]);
      else localStorage.removeItem('ql-' + k);
    } catch {}
  }
}
const SENT = 'ql-account-sent';
const lastSent = () => { try { return sessionStorage.getItem(SENT) || ''; } catch { return ''; } };
const markSent = (s) => { try { sessionStorage.setItem(SENT, s); } catch {} };

async function signedIn(r) {
  const a = { username: r.username, name: r.name, gender: r.gender, token: r.token, demo: !!r.demo };
  // the account's own bookmarks and settings replace whatever another person left on this device
  if (!a.demo) {
    try {
      const p = await post({ action: 'adult-progress', token: a.token });
      if (p.ok) { const has = p.progress && Object.keys(p.progress).length; if (has) apply(p.progress); else if (me()?.username !== a.username) apply({}); }
    } catch {}
  } else if (me()?.username !== a.username) apply({});
  keep(a);
  markSent(JSON.stringify(snapshot()));
  return { ok: true, account: a };
}

async function account(body) {
  if (isDemo()) return signedIn({ username: String(body.username || '').trim().toLowerCase(), name: body.name || body.username, gender: body.gender || 'm', token: 'demo', demo: true });
  try {
    const r = await post(body);
    if (r.ok) return signedIn(r);
    return { ok: false, error: r.error, message: MESSAGES[r.error] ?? 'That did not work. Please try again.' };
  } catch {
    return { ok: false, message: OFFLINE };
  }
}
export const register = (b) => account({ action: 'adult-register', ...b });
export const login = (b) => account({ action: 'adult-login', ...b });

// Saves the person's bookmarks and settings to their account when they have changed.
export async function save({ leaving = false } = {}) {
  const a = me();
  if (!a || a.demo) return;
  const now = JSON.stringify(snapshot());
  if (now === lastSent()) return;
  try {
    const r = await post({ action: 'adult-save-progress', token: a.token, progress: JSON.parse(now) }, { keepalive: leaving, timeout: leaving ? 5000 : 20000 });
    if (r.ok) markSent(now);
    else if (r.error === 'signed-out') expired();
  } catch {}
}

function expired() {
  try { localStorage.removeItem(ACCOUNT); } catch {}
  location.replace(signinUrl());
}
export const signinUrl = () => {
  const base = (document.body?.dataset.signin || '/quran/signin/');
  return base + '?next=' + encodeURIComponent(location.pathname + location.search + location.hash);
};

export async function signOut() {
  await save();
  apply({});
  try { localStorage.removeItem(ACCOUNT); sessionStorage.removeItem(SENT); } catch {}
}

// One finished Hifz test, for the "Adult sessions" tab.
export async function logTest(test) {
  const a = me();
  if (!a || a.demo) return;
  try { await post({ action: 'adult-log', token: a.token, test }, { timeout: 30000 }); } catch {}
}
