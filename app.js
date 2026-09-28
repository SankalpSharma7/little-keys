import { chapters, lessons, getLesson, totalCheckpoints } from './curriculum.js';
import { loadState, saveState, validateState, countDone, isDone, completedLessons, progressPercent, firstUnfinishedStep, completeStep, nextLesson, localDay } from './state.js';
import { scientistOverview } from './song-view.js';
import { midi } from './audio.js';
import { PianoAudio } from './audio.js';
import { chords, getChord, styles as chordStyles, chordPattern } from './chords.js';
import { playgroundPage, fingerGuide } from './playground.js';
import { renderLesson } from './lesson-view.js';
import { stepGuidance, hideEarAnswer } from './lesson-guidance.js';

const icons = {
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
  path: '<circle cx="6" cy="5" r="2"/><circle cx="18" cy="19" r="2"/><path d="M8 5h7a4 4 0 0 1 0 8H9a3 3 0 0 0 0 6h7"/>',
  music: '<path d="M9 18V5l11-2v13M9 8l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2"/><ellipse cx="17" cy="16" rx="3" ry="2"/>',
  chart: '<path d="M4 20h17M7 16v-5M12 16V4M17 16V8"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  back: '<path d="M20 12H5m6-6-6 6 6 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  play: '<path d="m8 4 12 8-12 8Z"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  spark: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4m-2-2h4"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/>',
  keys: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16m6-16v16M7 4v8h4V4m2 0v8h4V4"/>',
  pulse: '<path d="M2 12h5l3-8 4 16 3-8h5"/>',
  hands: '<path d="M7 12V6a2 2 0 0 1 4 0v6m0-5a2 2 0 0 1 4 0v6m0-4a2 2 0 0 1 4 0v6c0 4-3 6-6 6h-1c-3 0-4-2-6-5l-3-4a2 2 0 0 1 3-2l3 4"/>',
  loop: '<path d="m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4m14-1v2a3 3 0 0 1-3 3H3"/>',
  volume: '<path d="M11 4 6 8H3v8h3l5 4Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4.3 1.7c-1 .8-1.8 1-1.8 2.8M12 17h.01"/>',
  leaf: '<path d="M19 3C4 2 2 12 7 17s15 3 12-14ZM5 21 15 9"/>',
  save: '<path d="M5 3h12l4 4v14H3V3Zm2 0v6h10V3M7 21v-8h10v8"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  upload: '<path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  flag: '<path d="M5 22V3c5-4 9 4 14 0v10c-5 4-9-4-14 0"/>',
};
const icon = (name, cls = '') => `<svg class="icon ${cls}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.music}</svg>`;
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let storage;
try { storage = window.localStorage; } catch { storage = { getItem() { throw Error(); }, setItem() { throw Error(); } }; }
const loaded = loadState(storage);
let state = loaded.state;
let storageWarning = loaded.error;
let protectUnreadableSave = Boolean(loaded.error);
let view = 'today';
let currentLesson = null;
let currentStep = 0;
let earRevealed = false;
let earHintShown = false;
let studySelection = { hand: 'both', from: 0, to: 0, countIn: true };
let playing = false;
let ticking = false;
let looping = false;
let chordPlaybackMode = null;
let chordTimeline = [];
let pendingBackup = null;
let toastTimer;
let practiceTick = Date.now();
const app = document.querySelector('#app');
const modal = document.querySelector('#modal');

const audio = new PianoAudio((notes, index, metronome) => {
  if (view === 'chords') {
    const event = chordPlaybackMode && index >= 0 ? chordTimeline[index] : null;
    setChordGuide(event?.chord || state.playground.selected);
    document.querySelectorAll('.sequence-slot').forEach(slot => slot.classList.toggle('playing', chordPlaybackMode === 'sequence' && event?.bar === Number(slot.dataset.bar)));
    const status = document.querySelector('#chord-playing');
    if (status) status.textContent = event ? `${chordPlaybackMode === 'sequence' ? `Bar ${event.bar + 1} of 4 · ` : ''}${getChord(event.chord).name} · ${chordStyles.find(s => s.id === state.playground.style).hint}` : 'Ready when you are. Listen once, then try on your Casio.';
  }
  const answerHidden = view === 'lesson' && hideEarAnswer(currentLesson?.steps[currentStep], earRevealed);
  document.querySelectorAll('.piano-key').forEach(key => key.classList.toggle('sounding', !answerHidden && notes.some(note => midi(note) === midi(key.dataset.note))));
  const studyStatus = document.querySelector('#study-status');
  if (studyStatus) {
    studyStatus.textContent = metronome && index < 0 ? `Count in: ${index + 5} of 4` : !metronome && index >= 0 && notes.length ? `${currentLesson?.steps[currentStep]?.tracks?.sections?.find(s => Math.floor(index / 4) >= s.from && Math.floor(index / 4) <= s.to)?.name || 'Practice'} · bar ${Math.floor(index / 4) + 1} · beat ${index % 4 + 1}` : ticking ? 'Metronome running' : 'Ready when you are. Start after the count-in.';
    document.querySelectorAll('[data-bar].study-bar, [data-bar].compact-bar').forEach(bar => bar.classList.toggle('active', !metronome && notes.length > 0 && Number(bar.dataset.bar) === Math.floor(index / 4)));
  }
  document.querySelectorAll('.note-chip').forEach(chip => chip.classList.toggle('active', !metronome && Number(chip.dataset.index) === index));
  document.querySelectorAll('.beat-dot').forEach((dot, i) => dot.classList.toggle('active', metronome && i === index % 4));
  const active = document.querySelector('.note-chip.active');
  if (active) {
    const strip = active.parentElement;
    if (active.offsetLeft < strip.scrollLeft || active.offsetLeft + active.offsetWidth > strip.scrollLeft + strip.clientWidth) strip.scrollTo({ left: active.offsetLeft - strip.clientWidth / 2, behavior: 'smooth' });
  }
}, () => { playing = false; ticking = false; chordPlaybackMode = null; updateTransport(); });

function toast(message) {
  const el = document.querySelector('#toast'); el.textContent = message; el.classList.add('visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 4200);
}
function persist() {
  if (protectUnreadableSave) return;
  if (!saveState(storage, state)) {
    storageWarning = 'This browser could not save your progress. Export a backup before closing the app.';
    document.querySelector('#storage-banner')?.remove();
    app.insertAdjacentHTML('afterbegin', `<div id="storage-banner" role="alert">${esc(storageWarning)} <button data-action="export">Export progress</button></div>`);
  }
}
function stopAudio() { chordPlaybackMode = null; audio.stop(); playing = false; ticking = false; updateTransport(); }
function navigate(destination) { stopAudio(); modal.close(); if (location.hash === '#' + destination) route(); else location.hash = destination; }
function goLesson(id, index = null) {
  const l = getLesson(id); if (!l) return;
  const step = index === null ? firstUnfinishedStep(state, id) : index;
  navigate(`lesson/${id}/${step}`);
}
function route() {
  stopAudio();
  earRevealed = false; earHintShown = false;
  const bits = location.hash.slice(1).split('/');
  if (bits[0] === 'lesson' && getLesson(bits[1])) {
    view = 'lesson'; currentLesson = getLesson(bits[1]);
    const candidate = Number(bits[2]);
    currentStep = Number.isInteger(candidate) && candidate >= 0 && candidate < currentLesson.steps.length ? candidate : firstUnfinishedStep(state, currentLesson.id);
    const tracks = currentLesson.steps[currentStep].tracks;
    if (tracks?.sections) looping = false;
    studySelection = { hand: tracks?.events.some(e => e.hand === 'right') ? (tracks.events.some(e => e.hand === 'left') ? 'both' : 'right') : 'left', from: 0, to: tracks ? tracks.bars.length - 1 : 0, countIn: true };
    state.last = { lessonId: currentLesson.id, step: currentStep }; persist();
  } else { view = ['today', 'path', 'songs', 'chords', 'progress', 'scientist'].includes(bits[0]) ? bits[0] : 'today'; currentLesson = null; }
  practiceTick = Date.now(); render(); window.scrollTo({ top: 0 });
  document.querySelector('#main-heading')?.focus({ preventScroll: true });
}
function shell(content) {
  const completed = completedLessons(state);
  return `${storageWarning ? `<div id="storage-banner" role="alert">${esc(storageWarning)} <button data-action="export">Export progress</button>${protectUnreadableSave ? '<button data-action="enable-saving">Start fresh & enable saving</button>' : ''}</div>` : ''}
    <aside class="sidebar">
      <a class="brand" href="#today" aria-label="Little Keys home"><span class="brand-mark"><i></i><i></i><i></i></span><span>little keys<span class="brand-dot">.</span></span></a>
      <div class="sidebar-label">A LITTLE EVERY DAY</div>
      <nav aria-label="Main navigation">${[['today','home','Today’s practice'],['path','path','Your learning path'],['songs','music','Song collection'],['chords','keys','Chord playground'],['progress','chart','Your progress']].map(([id, ico, label]) => `<a href="#${id}" aria-label="${label}" class="nav-item ${(view === id || (view === 'lesson' && id === 'path') || (view === 'scientist' && id === 'songs')) ? 'selected' : ''}" ${view === id ? 'aria-current="page"' : ''}>${icon(ico)}<span>${label}</span>${id === 'path' ? `<span class="nav-count">${lessons.length}</span>` : ''}</a>`).join('')}</nav>
      <div class="sidebar-bottom"><div class="journey-mini"><span class="mini-title">Your little journey ${icon('leaf')}</span><div class="progress-track"><i style="width:${progressPercent(state)}%"></i></div><p>${completed} of ${lessons.length} lessons explored</p></div><button class="keyboard-profile" data-action="setup"><span class="profile-icon">${icon('keys')}</span><span><strong>Casio CT-X870IN</strong><small>No cables. Just you & the keys.</small></span>${icon('help')}</button></div>
    </aside>
    <div class="workspace"><header class="topbar"><div class="breadcrumb">Your keyboard companion <span>/</span> <strong>${({ today: 'Today’s practice', path: 'Learning path', songs: 'Song collection', chords: 'Chord playground', progress: 'Your progress', lesson: 'Practice room', scientist: 'The Scientist' })[view]}</strong></div><div class="topbar-right"><span class="saved-status">${icon(storageWarning ? 'help' : 'save')} ${storageWarning ? 'Backup recommended' : 'Progress saved on this laptop'}</span><span class="avatar" aria-label="Your practice space">S</span></div></header><main id="main-content">${content}</main><footer class="footer"><span>A little practice. A little progress.</span><span>Made for your first notes ${icon('music')}</span></footer></div>`;
}
function title(eyebrow, heading, description, extra = '') {
  return `<div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1 id="main-heading" tabindex="-1">${heading}</h1><p>${description}</p></div>${extra}</div>`;
}
function pianoIllustration() {
  return `<div class="hero-art" aria-hidden="true"><span class="art-orbit orbit-one"></span><span class="art-orbit orbit-two"></span><span class="floating-note note-one">♪</span><span class="floating-note note-two">♫</span><span class="art-star star-one">✧</span><span class="art-star star-two">✦</span><div class="art-caption">one note at a time</div><div class="illustration-piano"><div class="piano-top"><span></span><i></i><b>little keys</b></div><div class="illustration-keys">${Array.from({ length: 14 }, (_, i) => `<i class="illustration-white ${i === 4 ? 'pressed' : ''}">${i === 4 ? '<span>♪</span>' : ''}${[0,1,3,4,5].includes(i % 7) ? '<b></b>' : ''}</i>`).join('')}</div></div><div class="art-pill">${icon('check')} A good day to begin.</div></div>`;
}
function lessonRow(l, index, compact = false) {
  const done = isDone(state, l.id); const checkpoints = state.completed[l.id]?.length || 0; const current = state.last.lessonId === l.id && !done;
  return `<button class="lesson-row ${done ? 'done' : ''} ${current ? 'current' : ''}" data-action="lesson" data-id="${l.id}"><span class="lesson-number">${done ? icon('check') : String(index + 1).padStart(2, '0')}</span><span class="lesson-row-copy"><strong>${esc(l.title)}</strong><small>${compact ? `${l.duration} min · 4 checkpoints` : esc(l.description)}</small></span><span class="lesson-row-meta">${state.review[l.id] ? icon('flag') : ''}${done ? '<span class="done-label">Completed</span>' : current ? '<span class="current-label">Your next step</span>' : `<span>${l.duration} min</span>`}${checkpoints > 0 && !done ? `<small>${checkpoints}/4</small>` : ''}${icon('arrow')}</span></button>`;
}
function goalCard(type, compact = false) {
  const adele = type === 'adele'; const goalLessons = lessons.filter(l => type === 'scientist' ? l.chapter === 'scientist' : l.goal === type);
  const done = goalLessons.filter(l => isDone(state, l.id)).length;
  return `<button class="goal-card ${adele ? 'adele' : 'coldplay'} ${compact ? 'compact' : ''}" data-action="goal" data-id="${type}"><span class="goal-art">${adele ? '<span class="orbit-disc"></span>' : '<span class="sky-moon"></span><span class="sky-stars">·　 ✧<br> ✦　 ·</span>'}</span><span class="goal-copy"><small>${adele ? 'ADELE' : 'COLDPLAY'}</small><strong>${adele ? 'Someone Like You' : 'The Scientist'}</strong><span>${done === goalLessons.length ? (adele ? 'Preparation complete' : 'Song path complete') : adele ? 'Your something-to-look-forward-to' : 'Chords → complete accompaniment'}</span></span>${icon('arrow')}</button>`;
}
function dashboard() {
  const resume = getLesson(state.last.lessonId); const started = countDone(state) > 0; const allDone = countDone(state) === totalCheckpoints;
  const chapter = chapters.find(c => c.id === resume.chapter);
  const activeLessons = lessons.filter(l => l.chapter === chapter.id);
  return `${title('LET’S MAKE A LITTLE MUSIC', started ? 'Welcome back to your keys.' : 'Every pianist starts somewhere.', 'Your keyboard, a few quiet minutes, and something new to discover.', `<span class="session-badge">${icon('clock')} 10–15 minutes, just for you</span>`)}
    <section class="hero"><div class="hero-copy"><span class="pill">${icon('spark')} ${allDone ? 'LOOK HOW FAR YOU’VE COME' : started ? 'KEEP YOUR LITTLE RHYTHM GOING' : 'YOUR FIRST CHAPTER STARTS HERE'}</span><h2>Small steps.<br><em>Beautiful music.</em></h2><p>${allDone ? 'Your foundations are in place. Revisit a favourite or give a tricky phrase a little more love.' : 'From finding your first C to playing something you love. Let’s take it one note at a time.'}</p><button class="button primary" data-action="resume">${icon('play')} ${allDone ? 'Revisit your practice' : started ? 'Continue learning' : 'Let’s play our first notes'} ${icon('arrow')}</button><div class="hero-next">${icon('flag')} <span>${esc(resume.title)} <span>· Checkpoint ${state.last.step + 1} of 4</span></span></div>${started ? '<button class="text-button recap-link" data-action="recap">Need a quick recap?</button>' : ''}</div>${pianoIllustration()}</section>
    <section class="stats-strip" aria-label="Your progress overview"><div>${icon('path')}<span><strong>${completedLessons(state)} <small>/ ${lessons.length}</small></strong><span>Lessons completed</span></span></div><div>${icon('flag')}<span><strong>${countDone(state)} <small>little wins</small></strong><span>Checkpoints saved</span></span></div><div>${icon('leaf')}<span><strong>${state.days.length} <small>${state.days.length === 1 ? 'day' : 'days'} at the keys</small></strong><span>Your own pace. Always.</span></span></div></section>
    <div class="dashboard-columns"><section class="path-preview"><div class="section-heading"><h2>Your next little steps</h2><a href="#path">See the full path ${icon('arrow')}</a></div><div class="chapter-kicker"><span class="chapter-icon ${chapter.color}">${icon(chapter.icon)}</span><div><small>CHAPTER ${chapters.indexOf(chapter) + 1}</small><h3>${chapter.name}</h3></div><span class="chapter-count">${activeLessons.filter(l => isDone(state, l.id)).length}/${activeLessons.length}</span></div><div class="lesson-list">${activeLessons.map(l => lessonRow(l, lessons.indexOf(l), true)).join('')}</div><div class="gentle-note">${icon('leaf')} No rush, no streaks to lose. Your progress will be right here.</div></section><aside class="dreams-panel"><div class="section-heading"><h2>A little further down the road</h2></div><p class="muted small">The songs you’re working toward.</p>${goalCard('scientist', true)}${goalCard('adele', true)}<div class="tip-card">${icon('spark')}<div><strong>A note before your first note</strong><p>You don’t need to read music yet. We’ll start with C, D, E and a few friendly guides.</p></div></div></aside></div>`;
}
function learningPath() {
  return `${title('ONE NOTE LEADS TO ANOTHER', 'Your learning path.', `${lessons.length} short lessons. ${totalCheckpoints} small wins. A foundation you can come back to.`, `<button class="button primary" data-action="resume">Continue learning ${icon('arrow')}</button>`)}<div class="path-intro">${icon('leaf')} Start at the beginning, or revisit any lesson. Every checkpoint saves separately.</div><div class="chapter-grid">${chapters.map((c, i) => {
    const items = lessons.filter(l => l.chapter === c.id); const done = items.filter(l => isDone(state, l.id)).length;
    return `<section class="chapter-card"><div class="chapter-card-heading"><span class="chapter-icon ${c.color}">${icon(c.icon)}</span><span class="eyebrow">CHAPTER ${String(i + 1).padStart(2, '0')}</span><span class="chapter-count">${done}/${items.length} ${done === items.length ? icon('check') : ''}</span></div><h2>${c.name}</h2><p>${c.subtitle}</p><div class="lesson-list">${items.map(l => lessonRow(l, lessons.indexOf(l), true)).join('')}</div></section>`;
  }).join('')}</div>`;
}
function songsPage() {
  const songLessons = lessons.filter(l => l.song);
  return `${title('SOMETHING YOU CAN HUM', 'Your song collection.', 'Start with a familiar little melody. Grow toward the songs you love.')}<div class="section-heading"><h2>Your first melodies</h2><span class="muted small">Listen, learn a phrase, make it yours.</span></div><div class="song-grid">${songLessons.map((l, i) => `<button class="song-tile song-${i}" data-action="lesson" data-id="${l.id}"><span class="song-tile-art">${icon(i === 1 ? 'leaf' : i === 2 ? 'music' : i === 3 ? 'star' : 'spark')}<span class="song-staff"></span><b>${['♪','♫','♩','✦'][i]}</b></span><span class="song-tile-body"><small>${i === 2 ? 'BEETHOVEN · SIMPLIFIED OPENING' : 'TRADITIONAL · BEGINNER MELODY'}</small><strong>${esc(l.song)}</strong><span>${isDone(state, l.id) ? '✓ Lesson completed' : `${l.duration} minutes · Right hand`}${icon('arrow')}</span></span></button>`).join('')}</div><div class="section-heading goal-heading"><h2>Your longer-term goals</h2><span class="tag">Built around your favourites</span></div><div class="goals-large">${goalCard('scientist')}${goalCard('adele')}</div><div class="song-explainer">${icon('music')}<p>The Scientist has ten in-app accompaniment lessons: chords, verse, chorus, transitions and a complete beginner performance for singing or humming. The vocal melody is not included in playback. Earlier score-based melody lessons remain optional. Adele currently has preparation exercises only.</p></div>`;
}
function progressPage() {
  const reviews = lessons.filter(l => state.review[l.id]);
  const milestones = [
    ['First little win', 'Complete your first checkpoint', countDone(state) > 0, 'spark'],
    ['A tune to call your own', 'Finish your first melody lesson', isDone(state, 'first-tune'), 'music'],
    ['A little Beethoven', 'Complete the Ode to Joy opening', isDone(state, 'ode'), 'star'],
    ['Both hands together', 'Finish your first two-hand lesson', isDone(state, 'together'), 'hands'],
    ['Foundations in place', 'Explore the original 26 foundation lessons', lessons.filter(l => !['scientist', 'scientist-reference'].includes(l.chapter)).every(l => isDone(state, l.id)), 'leaf'],
    ['Your first Coldplay accompaniment', 'Play a complete introduction', isDone(state, 'scientist-play-intro'), 'music'],
    ['A verse and chorus', 'Keep both sections moving', isDone(state, 'scientist-play-verse') && isDone(state, 'scientist-play-chorus'), 'hands'],
    ['A complete accompaniment', 'Play the whole beginner performance route', isDone(state, 'scientist-play-performance'), 'star'],
    ['Your first Coldplay melody', 'Optional score route: opening song section', isDone(state, 'scientist-phrases'), 'music'],
    ['Coldplay with both hands', 'Optional score route: melody with bass', isDone(state, 'scientist-support'), 'hands'],
    ['A whole simplified song', 'Optional score route: complete performance', isDone(state, 'scientist-performance'), 'star'],
  ];
  return `${title('LOOK AT YOUR LITTLE WINS', 'This is what progress looks like.', 'Every comfortable note counts. There’s no deadline here.')}<section class="progress-overview"><div class="progress-ring" style="--progress:${progressPercent(state)}%"><span><strong>${progressPercent(state)}<small>%</small></strong><span>of your learning path</span></span></div><div><h2>${completedLessons(state) === lessons.length ? 'A beautiful beginning.' : countDone(state) ? 'You’re making music happen.' : 'Your first little win is waiting.'}</h2><p>${countDone(state)} of ${totalCheckpoints} checkpoints · ${completedLessons(state)} of ${lessons.length} lessons complete</p><p class="muted">${state.days.length} practice days · ${Math.floor(state.practiceSeconds / 60)} minutes in the practice room</p><button class="button primary" data-action="resume">Back to the keys ${icon('arrow')}</button><small class="time-note">Time counts while the practice page is visible, not verified playing time.</small></div></section><div class="section-heading"><h2>Milestones, not deadlines</h2></div><div class="milestone-grid">${milestones.map(([name, desc, earned, ico]) => `<div class="milestone ${earned ? 'earned' : ''}"><span>${icon(ico)}</span><strong>${name}</strong><p>${desc}</p><small>${earned ? '✓ Reached' : 'Something to look forward to'}</small></div>`).join('')}</div><div class="dashboard-columns progress-bottom"><section><div class="section-heading"><h2>A little more practice</h2><span class="tag">${reviews.length} saved</span></div>${reviews.length ? `<div class="review-list">${reviews.map(l => `<div>${lessonRow(l, lessons.indexOf(l), true)}<button class="text-button" data-action="unflag" data-id="${l.id}" aria-label="Remove ${esc(l.title)} from practice list">${icon('check')} Feeling comfortable now</button></div>`).join('')}</div>` : `<div class="empty-state">${icon('flag')}<h3>Your practice-again list</h3><p>Mark any lesson “Practise again” and we’ll keep it here for you.</p></div>`}</section><section class="backup-card"><span class="chapter-icon purple">${icon('save')}</span><h2>A safe place for your progress</h2><p>Your checkpoints and practice speeds are saved in this browser on this laptop. Export a backup before clearing browser data, changing browsers, or moving computers.</p><div class="backup-actions"><button class="button secondary" data-action="export">${icon('download')} Export backup</button><button class="button quiet" data-action="import">${icon('upload')} Import backup</button></div><small>${state.updatedAt ? `Last saved: ${new Date(state.updatedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}` : 'Your progress saves as you go.'}</small></section></div>`;
}
function keyboard() {
  const whites = [];
  for (let octave = 3; octave <= 5; octave++) for (const letter of ['C','D','E','F','G','A','B']) whites.push(`${letter}${octave}`);
  return `<div class="piano" aria-label="Preview keyboard, C3 to B5. Play exercises on your Casio.">${whites.map((note, i) => `<button class="piano-key white-key ${note === 'C4' ? 'middle-c' : ''}" data-note="${note}" data-action="note" aria-label="Preview ${note === 'C4' ? 'middle C, C4' : note}"><span>${note[0]}${note[0] === 'C' ? `<sub>${note[1]}</sub>` : ''}</span>${note === 'C4' ? '<i></i>' : ''}</button>${['C','D','F','G','A'].includes(note[0]) ? `<button class="piano-key black-key" style="left:calc(${(i + 1) / whites.length * 100}% - 1.45%)" data-note="${note[0]}#${note[1]}" data-action="note" aria-label="Preview ${note[0]} sharp ${note[1]}${note[0] === 'A' ? ', B flat ' + note[1] : ''}"><span>${note[0] === 'A' ? 'B♭' : note[0] + '♯'}</span></button>` : ''}`).join('')}</div>`;
}
function lessonPage() {
  const l = currentLesson;
  return renderLesson({
    lesson: l, stepIndex: currentStep, chapter: chapters.find(c => c.id === l.chapter),
    lessonNumber: lessons.indexOf(l) + 1, lessonCount: lessons.length,
    done: state.completed[l.id] || [], bpm: state.tempos[l.id] || l.bpm,
    looping, review: state.review[l.id], revealed: earRevealed, hintShown: earHintShown,
    icon, keyboard, title, selection: studySelection,
  });
}

function render() { app.innerHTML = shell(view === 'scientist' ? scientistOverview({state, isDone, lessonRow, lessons, icon, title}) : view === 'lesson' ? lessonPage() : view === 'path' ? learningPath() : view === 'songs' ? songsPage() : view === 'progress' ? progressPage() : view === 'chords' ? playgroundPage({ title, icon, keyboard, config: state.playground, returnToLesson: state.last }) : dashboard()); if (view === 'chords') setChordGuide(state.playground.selected); }
function updateTransport() {
  const sequence = document.querySelector('#chord-play');
  if (sequence) { sequence.innerHTML = `${icon(chordPlaybackMode === 'sequence' ? 'stop' : 'play')} ${chordPlaybackMode === 'sequence' ? 'Stop sequence' : 'Play my sequence'}`; sequence.setAttribute('aria-pressed', String(chordPlaybackMode === 'sequence')); }
  const hear = document.querySelector('#chord-hear');
  if (hear) { hear.innerHTML = `${icon(chordPlaybackMode === 'single' ? 'stop' : 'volume')} ${chordPlaybackMode === 'single' ? 'Stop chord' : 'Hear this chord'}`; hear.setAttribute('aria-pressed', String(chordPlaybackMode === 'single')); }
  const playButtons = document.querySelectorAll('#play-demo, #play-notes');
  if (playButtons.length && currentLesson) {
    const s = currentLesson.steps[currentStep];
    const active = s.mode === 'rhythm' ? ticking : playing;
    const label = active ? (s.mode === 'rhythm' ? 'Stop metronome' : 'Stop example') : stepGuidance(s).button;
    playButtons.forEach(play => {
      play.innerHTML = `${icon(active ? 'stop' : s.mode === 'rhythm' ? 'pulse' : 'play')} ${esc(label)}`;
      play.setAttribute('aria-pressed', String(active));
    });
  }
  const metro = document.querySelector('#metronome');
  if (metro) {
    metro.classList.toggle('active', ticking); metro.setAttribute('aria-pressed', String(ticking));
    if (currentLesson?.steps[currentStep].mode === 'rhythm') metro.innerHTML = `${icon('pulse')} <span>${ticking ? 'Stop metronome' : 'Start the metronome'}</span>`;
  }
  const loop = document.querySelector('#loop-button');
  if (loop) { loop.classList.toggle('active', looping); loop.setAttribute('aria-pressed', String(looping)); }
}
function setChordGuide(id) {
  const chord = getChord(id);
  const name = document.querySelector('#chord-name');
  if (!name || !chord) return;
  name.textContent = chord.name;
  document.querySelector('#chord-description').textContent = chord.description;
  document.querySelector('#finger-guide').innerHTML = fingerGuide(chord);
  document.querySelectorAll('.piano-key').forEach(key => key.classList.toggle('chord-target', chord.notes.some(note => midi(note) === midi(key.dataset.note))));
}
async function playChords(mode) {
  if (chordPlaybackMode === mode) { stopAudio(); return; }
  stopAudio();
  chordPlaybackMode = mode;
  const config = state.playground;
  chordTimeline = chordPattern(mode === 'single' ? [config.selected] : config.sequence, config.style);
  updateTransport();
  try { await audio.play(chordTimeline, config.bpm, { loop: mode === 'sequence' && config.loop }); }
  catch (error) { stopAudio(); toast(error.message); }
}
async function playDemo() {
  if (!currentLesson) return;
  stopAudio(); playing = true; updateTransport();
  const s = currentLesson.steps[currentStep];
  try {
    if (s.mode === 'reference') { stopAudio(); return; }
    if (s.tracks) await audio.playStudy(s.tracks, state.tempos[currentLesson.id] || currentLesson.bpm, { loop: looping, ...studySelection });
    else await audio.play(s.pattern, state.tempos[currentLesson.id] || currentLesson.bpm, { loop: looping, bass: s.bass });
  }
  catch (error) { stopAudio(); toast(error.message); }
}
function showModal(content) { stopAudio(); document.querySelector('#modal-content').innerHTML = `<button class="modal-close" data-action="close" aria-label="Close dialog">${icon('close')}</button>${content}`; const heading = modal.querySelector("h2"); if (heading) { heading.id = "modal-title"; modal.setAttribute("aria-labelledby", "modal-title"); } if (!modal.open) modal.showModal(); }
function showRecap() {
  const l = currentLesson || getLesson(state.last.lessonId); const stepIndex = currentLesson ? currentStep : state.last.step;
  showModal(`<span class="modal-symbol">${icon('leaf')}</span><div class="eyebrow">A SOFT LANDING</div><h2>A quick little recap.</h2><p>You’re in <strong>${esc(l.title)}</strong>, at checkpoint ${stepIndex + 1} of 4.</p><div class="modal-callout">${esc(l.tip)}</div>${stepIndex > 0 ? `<p>Earlier in this lesson:</p><ul class="recap-list">${l.steps.slice(0, stepIndex).map(s => `<li><strong>${esc(s.title)}</strong><span>${esc(s.cue)}</span></li>`).join('')}</ul>` : '<p>Take a moment to find middle C and relax your hands before starting.</p>'}<button class="button primary" data-action="resume">Back to the keys ${icon('arrow')}</button>`);
}
function showGoal(id) {
  if (id === 'scientist') { navigate('scientist'); return; }
  const items = lessons.filter(l => l.goal === id);
  showModal(`<span class="modal-symbol">${icon('music')}</span><div class="eyebrow">YOUR SONG GOAL</div><h2>${id === 'adele' ? 'Someone Like You' : 'The Scientist'}</h2><p>${id === 'adele' ? 'We’ll build even broken chords, a relaxed hand position, and a simple held bass.' : 'We’ll build a steady pulse, comfortable chord changes, and bass-plus-chord coordination.'}</p><div class="modal-callout">Start with the foundations if chords are new. These are original preparation drills; the full song arrangement isn’t included.</div><div class="goal-lessons">${items.map(l => `<button class="goal-lesson" data-action="lesson" data-id="${l.id}"><span><small>LESSON ${lessons.indexOf(l) + 1}</small><strong>${esc(l.title)}</strong></span>${icon(isDone(state, l.id) ? 'check' : 'arrow')}</button>`).join('')}</div><button class="text-button" data-action="path">Explore the foundations first ${icon('arrow')}</button>`);
}
function exportBackup() {
  const blob = new Blob([JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `little-keys-progress-${localDay()}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast('Progress backup exported. Keep it somewhere safe.');
}
function completedCheckpoint() {
  stopAudio(); const l = currentLesson; const wasDone = isDone(state, l.id);
  const finished = completeStep(state, l.id, currentStep);
  if (!state.days.includes(localDay())) state.days.push(localDay()); persist();
  if (finished) {
    const next = nextLesson(state, l.id); render();
    showModal(`<span class="modal-symbol celebration">${icon('star')}</span><div class="eyebrow">${wasDone ? 'A LITTLE PRACTICE GOES A LONG WAY' : 'A LITTLE WIN WORTH CELEBRATING'}</div><h2>${next ? 'Look at you, making music.' : 'Your foundations are in place.'}</h2><p>You’ve ${wasDone ? 'revisited' : 'completed'} <strong>${esc(l.title.replace(/\.$/, ""))}</strong>. ${storageWarning ? 'Export a backup to keep this progress safe.' : 'All four checkpoints are saved.'}</p><div class="completion-stat"><strong>${completedLessons(state)}</strong><span>of ${lessons.length} lessons complete</span>${icon('leaf')}</div><p>You can stop here and come back whenever you like.</p><div class="modal-actions">${next ? `<button class="button primary" data-action="lesson" data-id="${next.id}">Next lesson ${icon('arrow')}</button>` : '<button class="button primary" data-action="progress">See your progress</button>'}<button class="button secondary" data-action="home">Done for today</button></div>`);
  } else { goLesson(l.id, state.last.step); toast(storageWarning ? 'Checkpoint complete. Export a backup to keep it safe.' : 'Little win saved. One step further.'); }
}

document.addEventListener('click', async event => {
  const button = event.target.closest('[data-action]'); if (!button || button.disabled) return;
  const { action, id } = button.dataset;
  if (action === 'source') { stopAudio(); return; }
  if (action === 'study-section') {
    const tracks = currentLesson?.steps[currentStep]?.tracks;
    if (!tracks?.sections) return;
    const section = tracks.sections.find(s => s.id === button.dataset.section);
    stopAudio();
    studySelection.from = section ? section.from : 0;
    studySelection.to = section ? section.to : tracks.bars.length - 1;
    render(); return;
  }
  if (action === 'ear-reveal' && currentLesson?.steps[currentStep].mode === 'ear') {
    stopAudio(); earRevealed = !earRevealed; render();
    document.querySelector('[data-action="ear-reveal"]')?.focus({ preventScroll: true });
  } else if (action === 'ear-hint' && currentLesson?.steps[currentStep].mode === 'ear') {
    stopAudio(); earHintShown = !earHintShown; render();
    document.querySelector('[data-action="ear-hint"]')?.focus({ preventScroll: true });
  } else if (action === 'ear-reference' && currentLesson?.steps[currentStep].mode === 'ear') {
    stopAudio();
    try { await audio.preview(currentLesson.steps[currentStep].reference); } catch (error) { toast(error.message); }
  } else if (action === 'choose-chord' && getChord(id)) {
    stopAudio(); state.playground.selected = id; persist();
    document.querySelectorAll('.chord-choice').forEach(choice => { const selected = choice.dataset.id === id; choice.classList.toggle('selected', selected); choice.setAttribute('aria-pressed', String(selected)); });
    setChordGuide(id);
  } else if (action === 'chord-style' && chordStyles.some(style => style.id === id)) {
    stopAudio(); state.playground.style = id; persist();
    document.querySelectorAll('.chord-style').forEach(choice => { const selected = choice.dataset.id === id; choice.classList.toggle('selected', selected); choice.setAttribute('aria-pressed', String(selected)); });
  } else if (action === 'hear-chord') await playChords('single');
  else if (action === 'play-chords') await playChords('sequence');
  else if (action === 'chord-loop') {
    stopAudio(); state.playground.loop = !state.playground.loop; persist();
    button.setAttribute('aria-pressed', String(state.playground.loop)); button.innerHTML = `${icon('loop')} Loop ${state.playground.loop ? 'on' : 'off'}`;
  } else if (action === 'lesson') goLesson(id);
  else if (action === 'resume') goLesson(state.last.lessonId, state.last.step);
  else if (action === 'step') goLesson(currentLesson.id, Number(button.dataset.step));
  else if (action === 'previous' && currentStep > 0) goLesson(currentLesson.id, currentStep - 1);
  else if (action === 'home') navigate('today');
  else if (action === 'path') navigate('path');
  else if (action === 'progress') navigate('progress');
  else if (action === 'close') modal.close();
  else if (action === 'recap') showRecap();
  else if (action === 'goal') showGoal(id);
  else if (action === 'complete') completedCheckpoint();
  else if (action === 'play') { if (playing) stopAudio(); else await playDemo(); }
  else if (action === 'loop') { looping = !looping; updateTransport(); if (playing) await playDemo(); }
  else if (action === 'metronome') {
    if (ticking) stopAudio();
    else { stopAudio(); ticking = true; updateTransport(); try { await audio.play(Array.from({ length: 4 }, () => ({ notes: [], beats: 1 })), state.tempos[currentLesson.id] || currentLesson.bpm, { loop: true, metronome: true }); } catch (e) { stopAudio(); toast(e.message); } }
  } else if (action === 'note') {
    try { await audio.preview(button.dataset.note); button.classList.add('sounding'); setTimeout(() => button.classList.remove('sounding'), 450); } catch (e) { toast(e.message); }
  } else if (action === 'flag' || action === 'repeat') {
    state.review[currentLesson.id] = action === 'repeat' ? true : !state.review[currentLesson.id]; persist();
    if (action === 'repeat') { stopAudio(); toast('No rush. This lesson is saved to your practice-again list.'); }
    else toast(state.review[currentLesson.id] ? 'Saved for a little more practice.' : 'Removed from your practice-again list.');
    const flag = document.querySelector('.flag-button'); flag.classList.toggle('flagged', state.review[currentLesson.id]); flag.innerHTML = `${icon('flag')} ${state.review[currentLesson.id] ? 'Saved for more practice' : 'Save for more practice'}`;
  } else if (action === 'unflag') { delete state.review[id]; persist(); render(); toast('A little more comfortable. Nicely done.'); }
  else if (action === 'easier') {
    const s = currentLesson.steps[currentStep];
    if (s.mode === 'reference') {
      showModal(`<h2>Make the song phrase smaller.</h2><p>Keep the score open at the location shown. Take just two or three notes with your right hand. Find the keys without a beat first, then tap their rhythm, then play. Leave out the bass until the melody is comfortable.</p><p>Use the note map under the source links. Return to “A small map for the melody” if notation is new.</p><button class="button primary" data-action="close">Back to my phrase</button>`);
      return;
    }
    if (s.mode === 'listen') {
      showModal(`<span class="modal-symbol">${icon('volume')}</span><h2>Just listen for now.</h2><p>Press “Play the example” and hear it once. You do not need to touch your keyboard, name any notes, or work them out by ear.</p><p>Then choose “I’ve listened — continue”. The next checkpoint supplies the keys and finger positions.</p><button class="button primary" data-action="close">Back to listening</button>`);
      return;
    }
    if (s.mode === 'ear') {
      stopAudio(); earHintShown = true; render();
      document.querySelector('[data-action="ear-hint"]')?.focus({ preventScroll: true });
      return;
    }
    state.tempos[currentLesson.id] = Math.max(40, (state.tempos[currentLesson.id] || currentLesson.bpm) - 10); persist();
    document.querySelector('#tempo').value = state.tempos[currentLesson.id]; document.querySelector('#tempo-value').textContent = `${state.tempos[currentLesson.id]} BPM`;
    const advice = s.mode === 'rhythm' ? '<li>Listen to four clicks without tapping.</li><li>Join in for only four taps, one per click.</li><li>Pause, then try another group of four.</li>' : '<li>Read the supplied notes. You do not need to guess them by ear.</li><li>Try just the first two notes or one chord.</li><li>Practise one hand at a time.</li><li>Pause between notes and look for the next key.</li>';
    showModal(`<span class="modal-symbol">${icon('leaf')}</span><h2>Let’s make a little room.</h2><p>The practice speed is now <strong>${state.tempos[currentLesson.id]} BPM</strong>.</p><ol class="easier-list">${advice}</ol><p>There’s no need to keep up with the example yet.</p><button class="button primary" data-action="close">Try a smaller step ${icon('arrow')}</button>`);
  } else if (action === 'setup') showModal(`<span class="modal-symbol">${icon('keys')}</span><div class="eyebrow">YOUR CASIO CT-X870IN</div><h2>Ready in a few little steps.</h2><ol class="easier-list"><li>Switch on the keyboard and choose a comfortable volume.</li><li>Select a piano tone using PIANO/ORGAN and check the keyboard display.</li><li>Sit comfortably with relaxed shoulders and supported feet.</li><li>Place your laptop where you can glance at it without twisting.</li><li>Follow the checkpoint label: “Listen only” means just hear the example; “Follow the shown notes” means use the supplied keys on your Casio. Only the later ear-training lesson asks you to find notes from sound.</li></ol><div class="modal-callout">No cable or microphone is needed. You mark your own checkpoints; the app cannot check your notes or fingering.</div><p class="small">Guide notes use octave numbers: C4 is middle C. Keep your keyboard at its standard pitch without octave shift or transposition.</p><a class="text-button" href="https://www.casio.com/in/electronic-musical-instruments/support.CT-X870IN/" target="_blank" rel="noopener noreferrer">Casio manual & support ${icon('arrow')}</a>`);
  else if (action === 'export') exportBackup();
  else if (action === 'import') document.querySelector('#backup-input').click();
  else if (action === 'confirm-import' && pendingBackup) {
    state = pendingBackup; pendingBackup = null; protectUnreadableSave = false; storageWarning = null; persist(); navigate('progress'); toast('Backup imported. Your learning path is ready.');
  } else if (action === 'enable-saving') showModal(`<h2>Start a fresh saved journey?</h2><p>The unreadable saved data will be replaced with this session’s progress. Export a backup first if you want to keep a copy of this session.</p><div class="modal-actions"><button class="button secondary" data-action="export">Export this session</button><button class="button primary" data-action="confirm-fresh">Start fresh</button></div>`);
  else if (action === 'confirm-fresh') { protectUnreadableSave = false; storageWarning = null; persist(); modal.close(); render(); toast('Saving is enabled for this session.'); }
});
document.addEventListener('input', event => {
  if (event.target.id === 'chord-tempo') {
    stopAudio(); state.playground.bpm = Number(event.target.value); persist(); document.querySelector('#chord-tempo-value').textContent = `${state.playground.bpm} BPM`; return;
  }
  if (event.target.id !== 'tempo' || !currentLesson) return;
  stopAudio(); state.tempos[currentLesson.id] = Number(event.target.value); document.querySelector('#tempo-value').textContent = `${event.target.value} BPM`; persist();
});
document.addEventListener('change', event => {
  if (event.target.id.startsWith('study-') && currentLesson?.steps[currentStep].tracks) {
    stopAudio();
    if (event.target.id === 'study-hand') studySelection.hand = event.target.value;
    if (event.target.id === 'study-from') { studySelection.from = Number(event.target.value); studySelection.to = Math.max(studySelection.to, studySelection.from); }
    if (event.target.id === 'study-to') { studySelection.to = Number(event.target.value); studySelection.from = Math.min(studySelection.from, studySelection.to); }
    if (event.target.id === 'study-count-in') studySelection.countIn = event.target.checked;
    const focusId = event.target.id; render(); document.getElementById(focusId)?.focus({preventScroll: true});
    return;
  }
  if (!event.target.matches('[data-chord-bar]') || !getChord(event.target.value)) return;
  stopAudio(); state.playground.sequence[Number(event.target.dataset.chordBar)] = event.target.value; persist();
});
document.querySelector('#backup-input').addEventListener('change', async event => {
  const file = event.target.files[0]; event.target.value = ''; if (!file) return;
  try {
    if (file.size > 1000000) throw new Error('That file is too large to be a progress backup.');
    pendingBackup = validateState(JSON.parse(await file.text()));
    showModal(`<span class="modal-symbol">${icon('upload')}</span><h2>Bring your progress back.</h2><p>This backup contains <strong>${countDone(pendingBackup)} completed checkpoints</strong> across ${completedLessons(pendingBackup)} finished lessons.</p><div class="modal-callout">Importing replaces the progress currently on this browser (${countDone(state)} checkpoints). Export your current progress first if you want to keep both versions.</div><div class="modal-actions"><button class="button secondary" data-action="export">Export current progress</button><button class="button primary" data-action="confirm-import">Import this backup</button></div>`);
  } catch (error) { pendingBackup = null; toast(error instanceof SyntaxError ? 'That file is not valid JSON. Choose a Little Keys backup.' : error.message); }
});
modal.addEventListener('click', event => { if (event.target === modal && (event.clientX < modal.getBoundingClientRect().left || event.clientX > modal.getBoundingClientRect().right || event.clientY < modal.getBoundingClientRect().top || event.clientY > modal.getBoundingClientRect().bottom)) modal.close(); });
window.addEventListener('hashchange', route);
window.addEventListener('pagehide', () => { stopAudio(); persist(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) stopAudio(); practiceTick = Date.now(); });
setInterval(() => {
  const now = Date.now(); const elapsed = Math.min(10, (now - practiceTick) / 1000); practiceTick = now;
  if (!['lesson', 'chords'].includes(view) || document.hidden || modal.open) return;
  state.practiceSeconds += elapsed;
  if (!state.days.includes(localDay())) state.days.push(localDay());
  persist();
}, 10000);
route();
