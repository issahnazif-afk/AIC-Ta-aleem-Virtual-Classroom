/**
 * Al-Huda Islamic Weekend School · Ta'aleem Virtual Classroom — class log.
 * (The Sheikh and recitation checking come from the Qa-af Wal Quran-ul-Majeed app.)
 *
 * The classroom website (GitHub Pages) sends every finished session here. This script:
 *   • checks the student's class code and class password against the "Classes" tab,
 *   • keeps ONE folder per class inside your shared Drive folder, named after the class
 *     (e.g. "Level 1"), holding that class's Google Sheet ("Level 1 · session log")
 *     and a "Snapshots" folder with the login photos (all created on first use),
 *   • adds one row per session to that class's sheet.
 *
 * Set up once (full steps in apps-script/README.md):
 *   1. Create a Google Sheet called "Ta'aleem classroom admin". Extensions → Apps Script. Paste this file.
 *   2. Put your shared folder's ID in FOLDER_ID below, then run setup() once and allow access.
 *   3. Deploy → New deployment → Web app. Execute as: Me. Who has access: Anyone.
 *   4. Copy the Web app URL into the website settings (CLASS_LOG_URL).
 */

// The ID of the shared Google Drive folder (the part after /folders/ in its address).
const FOLDER_ID = 'PASTE_YOUR_FOLDER_ID_HERE';

const CLASSES_TAB = 'Classes';
const CLASS_HEADERS = ['Class code', 'Class name', 'Class password', 'Teacher', 'Log sheet'];
const LOG_HEADERS = [
  'Session ID', 'Student name', 'Class code', 'Login time', 'End time', 'Minutes spent',
  'Session type', 'Level', 'Surahs recited', 'Ayahs', 'Questions', 'Words recited',
  'Right first time (%)', 'Grade', 'Total mistakes', 'Most observed mistakes',
  'Wrong words', 'Forgotten (Sheikh prompted)', 'Hints used', 'Unclear', 'Went back over words',
  'Looked away', 'Snapshot', 'Review',
];

// ── set up ──────────────────────────────────────────────────────
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(CLASSES_TAB);
  if (!sh) sh = ss.insertSheet(CLASSES_TAB, 0);
  if (sh.getLastRow() === 0) {
    sh.appendRow(CLASS_HEADERS);
    // the four levels, each with its own starting password (change them as you like)
    for (let n = 1; n <= 4; n++) sh.appendRow(['LEVEL-' + n, 'Level ' + n, newPassword(), '', '']);
  }
  sh.getRange(1, 1, 1, CLASS_HEADERS.length).setFontWeight('bold');
  sh.setFrozenRows(1);
  sh.autoResizeColumns(1, CLASS_HEADERS.length);
  DriveApp.getFolderById(FOLDER_ID).getName();   // asks for Drive access and checks the folder ID
  SpreadsheetApp.getUi().alert('Ready. The Classes tab lists Level 1 to Level 4 with their passwords. Change them if you like, then deploy as a web app.');
}

function newPassword() {
  const words = ['noor', 'huda', 'iqra', 'sabr', 'ilm', 'amal', 'salam', 'barakah'];
  return words[Math.floor(Math.random() * words.length)] + (1000 + Math.floor(Math.random() * 9000));
}

// ── web app ─────────────────────────────────────────────────────
function doGet() {
  return json({ ok: true, service: 'qaaf-classroom-log' });
}

function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json({ ok: false, error: 'bad-request' }); }
  try {
    if (body.action === 'login') return json(login(body));
    if (body.action === 'log') return json(logSession(body));
    return json({ ok: false, error: 'unknown-action' });
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: 'server', message: String(err && err.message || err) });
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ── classes ─────────────────────────────────────────────────────
function findClass(code) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CLASSES_TAB);
  if (!sh) throw new Error('Run setup() first');
  const rows = sh.getDataRange().getValues();
  // "Level 1", "level-1", "LEVEL1" all find the class LEVEL-1
  const key = (x) => String(x || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const want = key(code);
  for (let r = 1; r < rows.length; r++) {
    if (want && (key(rows[r][0]) === want || key(rows[r][1]) === want)) {
      return { row: r + 1, code: String(rows[r][0]).trim(), name: String(rows[r][1] || rows[r][0]), password: String(rows[r][2]), logUrl: String(rows[r][4] || ''), sheet: sh };
    }
  }
  return null;
}

function checkClass(body) {
  const c = findClass(body.classCode);
  if (!c) return { error: 'unknown-class' };
  if (!c.password || String(body.password || '') !== c.password) return { error: 'wrong-password' };
  return { cls: c };
}

function login(body) {
  if (!String(body.name || '').trim()) return { ok: false, error: 'no-name' };
  const r = checkClass(body);
  if (r.error) return { ok: false, error: r.error };
  return { ok: true, className: r.cls.name, classCode: r.cls.code };
}

// Each class has its own folder in the shared folder, named after the class ("Level 1").
function classFolder(cls) {
  const root = DriveApp.getFolderById(FOLDER_ID);
  const it = root.getFoldersByName(cls.name);
  return it.hasNext() ? it.next() : root.createFolder(cls.name);
}

// One Google Sheet per class, inside the class's folder, created the first time it is needed.
function classLog(cls) {
  if (cls.logUrl) {
    try { return SpreadsheetApp.openByUrl(cls.logUrl); } catch (err) { /* deleted: make a new one */ }
  }
  const ss = SpreadsheetApp.create(cls.name + ' · session log');
  DriveApp.getFileById(ss.getId()).moveTo(classFolder(cls));
  const sh = ss.getSheets()[0];
  sh.setName('Sessions');
  sh.appendRow(LOG_HEADERS);
  sh.getRange(1, 1, 1, LOG_HEADERS.length).setFontWeight('bold').setBackground('#E6F2EC');
  sh.setFrozenRows(1);
  sh.getRange('D:E').setNumberFormat('yyyy-mm-dd hh:mm');
  cls.sheet.getRange(cls.row, 5).setValue(ss.getUrl());
  return ss;
}

function snapshotFolder(cls) {
  const parent = classFolder(cls);
  const it = parent.getFoldersByName('Snapshots');
  return it.hasNext() ? it.next() : parent.createFolder('Snapshots');
}

// ── one finished session ────────────────────────────────────────
function logSession(body) {
  const r = checkClass(body);
  if (r.error) return { ok: false, error: r.error };
  const s = body.session || {};
  if (!s.id) return { ok: false, error: 'no-session' };

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);   // two students finishing at once are written one after the other
  try {
    const ss = classLog(r.cls);
    const sh = ss.getSheetByName('Sessions') || ss.getSheets()[0];
    // the website retries when the connection drops; never write the same session twice
    if (sh.getLastRow() > 1 && sh.getRange(2, 1, sh.getLastRow() - 1, 1).createTextFinder(s.id).matchEntireCell(true).findNext()) {
      return { ok: true, duplicate: true, sheetUrl: ss.getUrl() };
    }
    let snap = '';
    if (body.snapshot && /^data:image\/jpeg;base64,/.test(body.snapshot)) {
      const bytes = Utilities.base64Decode(body.snapshot.split(',')[1]);
      const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HHmm');
      const file = snapshotFolder(r.cls).createFile(Utilities.newBlob(bytes, 'image/jpeg', stamp + ' ' + String(s.studentName || 'student') + '.jpg'));
      snap = '=HYPERLINK("' + file.getUrl() + '","View photo")';
    }
    const n = (v) => (typeof v === 'number' && isFinite(v) ? v : '');
    sh.appendRow([
      s.id, String(s.studentName || body.name || ''), r.cls.code,
      s.loginTime ? new Date(s.loginTime) : '', s.endTime ? new Date(s.endTime) : '', n(s.minutes),
      s.mode === 'hifz' ? 'Hifz test' : 'Mujawwadah (reading)', String(s.level || ''),
      String(s.surahs || ''), String(s.ayahs || ''), n(s.questions), n(s.words),
      n(s.rightFirstPct), String(s.grade || ''), n(s.mistakesTotal), String(s.topMistakes || ''),
      n(s.wrong), n(s.prompts), n(s.hints), n(s.unclear), n(s.wentBack), n(s.lookAways),
      snap, String(s.review || ''),
    ]);
    return { ok: true, sheetUrl: ss.getUrl() };
  } finally {
    lock.releaseLock();
  }
}
