// Talks to the class log (the Google Apps Script web app in apps-script/Code.gs).
// Requests are sent as text/plain so the browser makes a simple request with no preflight,
// which Apps Script web apps accept from any website.
//
// With no web app address set, the classroom runs in demo mode: any class code works and
// sessions are not saved anywhere.
import { store } from './client.mjs';

let URL_ = '';
export const configure = (url) => { URL_ = url || ''; };
export const isDemo = () => !URL_;

async function post(body, { timeout = 20000 } = {}) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeout);
  try {
    const r = await fetch(URL_, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body), signal: ctl.signal, redirect: 'follow' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}

const MESSAGES = {
  'unknown-class': 'That class code was not found. Check it with your teacher.',
  'wrong-password': 'That password is not right for this class.',
  'no-name': 'Enter your full name.',
};

export async function login({ name, classCode, password }) {
  if (isDemo()) return { ok: true, className: classCode, classCode, demo: true };
  try {
    const r = await post({ action: 'login', name, classCode, password });
    if (r.ok) return r;
    return { ok: false, message: MESSAGES[r.error] ?? 'Sign in did not work. Try again.' };
  } catch {
    return { ok: false, message: 'The class log could not be reached. Check your internet connection and try again.' };
  }
}

// Sessions that could not be sent yet wait here and are retried.
const OUTBOX = 'outbox';
const outbox = () => store.get(OUTBOX, []);

export async function sendSession(entry) {
  if (isDemo()) { console.info('[classroom] demo mode, session not saved:', entry.session); return { ok: true, demo: true }; }
  try {
    const r = await post({ action: 'log', ...entry }, { timeout: 45000 });
    if (r.ok) return r;
    if (r.error === 'wrong-password' || r.error === 'unknown-class') return { ok: false, final: true, message: MESSAGES[r.error] };
    throw new Error(r.error || 'failed');
  } catch {
    const list = outbox().filter((x) => x.session.id !== entry.session.id);
    list.push(entry);
    store.set(OUTBOX, list.slice(-20));
    return { ok: false, queued: true };
  }
}

export async function flushOutbox() {
  if (isDemo()) return 0;
  const list = outbox();
  if (!list.length) return 0;
  const left = [];
  for (const entry of list) {
    try { const r = await post({ action: 'log', ...entry }, { timeout: 45000 }); if (!r.ok && !['wrong-password', 'unknown-class'].includes(r.error)) left.push(entry); }
    catch { left.push(entry); }
  }
  store.set(OUTBOX, left);
  return list.length - left.length;
}
export const pendingCount = () => outbox().length;
