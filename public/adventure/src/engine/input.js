// Keyboard, touch swipes, on-screen buttons and a virtual joystick, as one input state the modes read.
// Runner: actions (left, right, jump, slide). Explore and arena: a move vector, an action and a dash.
export const input = {
  move: { x: 0, y: 0 },      // -1..1 (x right, y forward)
  look: 0,                   // camera turn (explore), set by dragging
  actions: [],               // queued one-shot actions: 'left' 'right' 'jump' 'slide' 'act' 'dash' 'pause'
  held: new Set(),
};
const keyMove = { x: 0, y: 0 };
const KEYS = {
  ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right',
  ArrowUp: 'jump', w: 'jump', W: 'jump', ' ': 'hop', ArrowDown: 'slide', s: 'slide', S: 'slide',
  e: 'act', E: 'act', Enter: 'act', Shift: 'dash', q: 'dash', Q: 'dash', Escape: 'pause', p: 'pause', P: 'pause',
};
function syncKeys() {
  const h = input.held;
  keyMove.x = (h.has('right') ? 1 : 0) - (h.has('left') ? 1 : 0);
  keyMove.y = (h.has('jump') ? 1 : 0) - (h.has('slide') ? 1 : 0);
  if (!stick.active) { input.move.x = keyMove.x; input.move.y = keyMove.y; }
}
addEventListener('keydown', (e) => {
  const a = KEYS[e.key]; if (!a) return;
  if (e.target.closest?.('input, textarea, select')) return;
  if (a === 'jump' || a.startsWith('Arrow')) e.preventDefault();
  if (e.key === ' ' || e.key.startsWith('Arrow')) e.preventDefault();
  if (!e.repeat) input.actions.push(a);
  input.held.add(a); syncKeys();
});
addEventListener('keyup', (e) => { const a = KEYS[e.key]; if (!a) return; input.held.delete(a); syncKeys(); });
addEventListener('blur', () => { input.held.clear(); syncKeys(); });

export const take = (a) => { const i = input.actions.indexOf(a); if (i < 0) return false; input.actions.splice(i, 1); return true; };
export const clearActions = () => { input.actions.length = 0; };

// swipes on the game area (runner)
export function attachSwipe(el) {
  let sx = 0, sy = 0, id = null;
  el.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') return; id = e.pointerId; sx = e.clientX; sy = e.clientY; });
  el.addEventListener('pointerup', (e) => {
    if (e.pointerId !== id) return; id = null;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) { input.actions.push('tap'); return; }
    input.actions.push(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy < 0 ? 'jump' : 'slide'));
  });
}

// drag to turn the camera (explore, desktop and the right side of a phone screen)
export function attachLook(el) {
  let id = null, lx = 0;
  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' && e.clientX < innerWidth * 0.45) return;   // left side of a phone belongs to the stick
    id = e.pointerId; lx = e.clientX;
  });
  addEventListener('pointermove', (e) => { if (e.pointerId !== id) return; input.look += (e.clientX - lx) * 0.006; lx = e.clientX; });
  addEventListener('pointerup', (e) => { if (e.pointerId === id) id = null; });
}

// the virtual joystick (explore, arena)
const stick = { active: false };
export function attachStick(base, knob) {
  let id = null, cx = 0, cy = 0;
  const R = 46;
  base.addEventListener('pointerdown', (e) => {
    e.preventDefault(); id = e.pointerId; base.setPointerCapture(id);
    const r = base.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; stick.active = true; moveTo(e);
  });
  const moveTo = (e) => {
    let dx = e.clientX - cx, dy = e.clientY - cy; const d = Math.hypot(dx, dy);
    if (d > R) { dx *= R / d; dy *= R / d; }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    input.move.x = dx / R; input.move.y = -dy / R;
  };
  base.addEventListener('pointermove', (e) => { if (e.pointerId === id) moveTo(e); });
  const end = (e) => { if (e.pointerId !== id) return; id = null; stick.active = false; knob.style.transform = ''; input.move.x = keyMove.x; input.move.y = keyMove.y; };
  base.addEventListener('pointerup', end); base.addEventListener('pointercancel', end);
}

// on-screen buttons: <button data-act="jump">
export function attachButtons(root) {
  root.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('pointerdown', (e) => { e.preventDefault(); input.actions.push(b.dataset.act); }));
}
