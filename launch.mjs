import { spawn } from 'node:child_process';

const url = 'http://localhost:5173';
const openApp = () => {
  const opener = spawn('open', [url], { stdio: 'ignore' });
  opener.on('error', () => console.log(`Open ${url} in your browser.`));
};

let existing = false;
try {
  const response = await fetch(url, { signal: AbortSignal.timeout(1500) });
  const body = await response.text();
  if (!body.includes('<title>Little Keys')) {
    console.error('Another app is using port 5173. Close it before starting Little Keys.');
    process.exit(1);
  }
  existing = true;
} catch {}

if (existing) {
  console.log('Little Keys is already running. Opening your practice space.');
  openApp();
} else {
  const server = spawn(process.execPath, ['server.mjs'], { cwd: new URL('.', import.meta.url), stdio: ['inherit', 'pipe', 'inherit'] });
  let opened = false;
  server.stdout.on('data', chunk => {
    process.stdout.write(chunk);
    if (!opened && chunk.toString().includes('Little Keys is ready')) {
      opened = true; openApp();
      console.log('Keep this window open while you practise. Press Control+C to stop.');
    }
  });
  server.on('error', error => { console.error(error.message); process.exitCode = 1; });
  server.on('exit', code => { process.exitCode = code || 0; });
  process.on('SIGINT', () => server.kill('SIGINT'));
  process.on('SIGTERM', () => server.kill('SIGTERM'));
}
