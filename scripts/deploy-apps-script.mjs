// npm run deploy:script [-- "what changed"]
// Uploads apps-script/Code.gs (and appsscript.json) to the "Ta'aleem classroom admin" Apps Script project and moves the
// website's web app deployment to the new version, so its address (CLASS_LOG_URL) stays the same. Then it checks that
// the live web app answers. Needs clasp (npm i -g @google/clasp) signed in once on this computer (clasp login), and
// apps-script/.clasp.json (not in git: the project's scriptId and the deploymentId of the website's web app).
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('../apps-script/', import.meta.url));
const conf = JSON.parse(readFileSync(dir + '.clasp.json', 'utf8'));
if (!conf.deploymentId) { console.error('apps-script/.clasp.json has no deploymentId (the website\'s web app).'); process.exit(1); }
const run = (cmd) => execSync(cmd, { cwd: dir, stdio: 'pipe', encoding: 'utf8' });
const git = (cmd) => { try { return execSync('git ' + cmd, { cwd: dir, encoding: 'utf8' }).trim(); } catch { return ''; } };

const dirty = git('status --porcelain -- Code.gs appsscript.json');
if (dirty) console.warn('Note: Code.gs has changes that are not committed yet; they are deployed as they are.');
const desc = (process.argv[2] || git('log -1 --format=%s -- Code.gs') || 'Update').slice(0, 90);

console.log('1. Uploading Code.gs …');
console.log(run('clasp push --force').trim());
console.log(`2. Moving the website's web app to a new version: "${desc}" …`);
console.log(run(`clasp update-deployment ${conf.deploymentId} --description ${JSON.stringify(desc)}`).trim());
console.log('3. Checking the live web app …');
const url = `https://script.google.com/macros/s/${conf.deploymentId}/exec`;
const ask = async (action) => (await (await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action, token: 'x' }), redirect: 'follow' })).json());
const [known, unknown] = await Promise.all([ask('board'), ask('no-such-action')]);
const ok = known.error === 'signed-out' && unknown.error === 'unknown-action';
console.log(ok ? 'Live: the web app answers, and knows the leaderboard.' : `Check the web app: ${JSON.stringify({ known, unknown })}`);
process.exit(ok ? 0 : 1);
