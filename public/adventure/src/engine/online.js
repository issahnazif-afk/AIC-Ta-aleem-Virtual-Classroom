// The class online: classmates at the same level (a class is a level in the Ta'aleem Classroom), their ghost runs,
// and the weekly team goal. It works when the game is opened from the Classroom, which hands over the student's
// sign-in for this browser tab (sessionStorage 'adv-me'). Played on its own, the game is single-player.
// Classmates are shown as "First L." with their explorer's look and the stage they are on. There is no chat.
import { save } from './save.js';

let me = null;
try { me = JSON.parse(sessionStorage.getItem('adv-me') || 'null'); } catch {}
export const online = { on: !!(me?.token && me?.url), name: me?.name ?? '', level: me?.level ?? null, players: [], team: null, className: '', error: null };

async function post(body) {
  if (!online.on) return null;
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 15000);
  try {
    const r = await fetch(me.url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ ...body, token: me.token }), signal: ctl.signal, redirect: 'follow' });
    const j = await r.json();
    if (!j.ok) { online.error = j.error; if (j.error === 'signed-out') online.on = false; return null; }
    online.error = null;
    return j;
  } catch { online.error = 'offline'; return null; } finally { clearTimeout(t); }
}

// say hello now and every 25 seconds: where I am, who else is playing
let where = { stage: '', doing: 'map' }, timer = null;
const listeners = new Set();
export const onClass = (fn) => { listeners.add(fn); fn(online); return () => listeners.delete(fn); };
async function hello(leaving = false) {
  const j = await post({ action: 'adv-hello', stage: where.stage, doing: where.doing, look: save.look, leaving });
  if (j) { online.players = j.players; online.team = j.team; online.className = j.className; }
  listeners.forEach((fn) => fn(online));
}
export function here(stage, doing) {
  where = { stage: stage ?? '', doing: doing ?? '' };
  if (!online.on) return;
  hello();
  clearInterval(timer); timer = setInterval(() => { if (document.visibilityState === 'visible') hello(); }, 25000);
}
addEventListener('pagehide', () => { if (online.on) navigator.sendBeacon?.(me.url, new Blob([JSON.stringify({ action: 'adv-hello', token: me.token, leaving: true })], { type: 'text/plain' })); });

// a finished stage: its motes join the class team goal; a run's path becomes a ghost for classmates
export async function sendRun(run) {
  const j = await post({ action: 'adv-run', run, look: save.look });
  if (j?.team) { online.team = j.team; listeners.forEach((fn) => fn(online)); }
  return j;
}
// classmates' best runs on a stage (up to 3)
export async function ghostsFor(stage) {
  const j = await post({ action: 'adv-ghosts', stage });
  return j?.ghosts ?? [];
}
