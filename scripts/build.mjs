import { mkdir, rm, copyFile } from 'node:fs/promises';
// Explicit allowlist prevents publishing test fixtures, backups or development files.
const files = ['index.html','.nojekyll','app.js','audio.js','chords.js','curriculum.js','state.js','playground.js','lesson-guidance.js','lesson-view.js','song-view.js','song-audio.js','scientist.js','scientist-accompaniment.js','scientist-lyrics.js','styles.css','playground.css','lesson.css','song.css'];
await rm('_site', { recursive: true, force: true });
await mkdir('_site');
await Promise.all(files.map(file=>copyFile(file, `_site/${file}`)));
console.log(`Built ${files.length} runtime files.`);
