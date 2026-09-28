import test from 'node:test';
import assert from 'node:assert/strict';
import { lessons, totalCheckpoints } from '../curriculum.js';
import { freshState, completeStep, countDone, completedLessons, nextLesson, isDone, progressPercent, validateState, loadState, saveState, STORAGE_KEY } from '../state.js';
import { buildEvents, midi, frequency } from '../audio.js';

const fakeStorage = () => {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
};

test('progress survives export/import and a browser reload at a partial lesson', () => {
  const state = freshState(); const storage = fakeStorage();
  completeStep(state, 'welcome', 0);
  completeStep(state, 'welcome', 1);
  state.tempos.welcome = 45;
  state.review.welcome = true;
  assert.equal(saveState(storage, state), true);
  const loaded = loadState(storage);
  assert.equal(loaded.error, null);
  assert.deepEqual(loaded.state.last, { lessonId: 'welcome', step: 2 });
  assert.deepEqual(loaded.state.completed.welcome, [0, 1]);
  assert.equal(loaded.state.tempos.welcome, 45);
  assert.equal(loaded.state.review.welcome, true);
  assert.deepEqual(validateState(JSON.parse(JSON.stringify(loaded.state))), loaded.state);
});

test('revisiting checkpoints does not inflate completion, and completing a lesson moves on', () => {
  const state = freshState();
  completeStep(state, 'welcome', 0);
  completeStep(state, 'welcome', 0);
  assert.equal(countDone(state), 1);
  for (const i of [1, 2, 3]) completeStep(state, 'welcome', i);
  assert.equal(isDone(state, 'welcome'), true);
  assert.equal(completedLessons(state), 1);
  assert.deepEqual(state.last, { lessonId: 'cde', step: 0 });
});

test('skipping ahead does not silently complete missed checkpoints', () => {
  const state = freshState();
  completeStep(state, 'welcome', 3);
  assert.equal(isDone(state, 'welcome'), false);
  assert.equal(countDone(state), 1);
  assert.deepEqual(state.last, { lessonId: 'welcome', step: 0 });
});

test('finishing every checkpoint leaves a valid resumable endpoint', () => {
  const state = freshState();
  for (const lesson of lessons) lesson.steps.forEach((_, index) => completeStep(state, lesson.id, index));
  assert.equal(totalCheckpoints, lessons.reduce((sum, lesson) => sum + lesson.steps.length, 0));
  assert.equal(countDone(state), totalCheckpoints);
  assert.equal(completedLessons(state), lessons.length);
  assert.equal(progressPercent(state), 100);
  assert.equal(nextLesson(state), undefined);
  assert.deepEqual(validateState(state).last, state.last);
});

test('corrupt saves are reported and are not overwritten during loading', () => {
  const storage = fakeStorage(); storage.setItem(STORAGE_KEY, '{bad json');
  const result = loadState(storage);
  assert.ok(result.error);
  assert.equal(countDone(result.state), 0);
  assert.equal(storage.getItem(STORAGE_KEY), '{bad json');
  const blocked = { setItem() { throw new Error('quota'); } };
  assert.equal(saveState(blocked, freshState()), false);
});

test('import rejects unsupported versions, unknown lessons, and invalid checkpoints', () => {
  assert.throws(() => validateState({ version: 2, completed: {} }));
  assert.throws(() => validateState({ version: 1, completed: { unknown: [0] } }));
  assert.throws(() => validateState({ version: 1, completed: { welcome: [4] } }));
  assert.throws(() => validateState({ version: 1, completed: { welcome: [-1] } }));
  assert.throws(() => validateState({ version: 1, completed: {}, last: { lessonId: 'welcome', step: 20 } }));
  const validated = validateState({ version: 1, completed: { welcome: [0, 0, 1] }, tempos: { welcome: -10 }, review: { welcome: 'yes' } });
  assert.deepEqual(validated.completed.welcome, [0, 1]);
  assert.equal(validated.tempos.welcome, undefined);
  assert.equal(validated.review.welcome, undefined);
});

test('all curriculum audio notes fit the displayed keyboard, with valid timing and bass', () => {
  const unique = new Set();
  for (const l of lessons) {
    assert.ok(!unique.has(l.id)); unique.add(l.id);
    assert.equal(l.steps.length, 4);
    for (const s of l.steps) {
      assert.ok(s.body.length > 50);
      assert.ok(s.mode === 'reference' || s.tracks || s.pattern.length > 0);
      if (s.tracks) for (const e of s.tracks.events) { assert.ok(midi(e.note) >= 48 && midi(e.note) <= 83); assert.ok(e.duration > 0 && e.beat >= 0); }
      for (const e of s.pattern) {
        assert.ok(e.beats > 0 && Number.isFinite(e.beats));
        for (const n of e.notes) assert.ok(midi(n) >= 48 && midi(n) <= 83, n);
      }
      if (s.bass) assert.ok(s.pattern[0].notes.includes(s.bass));
    }
  }
});

test('note timing preserves rests, fractional beats, and sustained bass duration', () => {
  const pattern = [{ notes: ['C3', 'C4'], beats: 1 }, { notes: ['E4'], beats: 1.5 }, { notes: [], beats: 0.5 }, { notes: ['G4'], beats: 1 }];
  const timeline = buildEvents(pattern, 60, 'C3');
  assert.equal(timeline.duration, 4);
  assert.deepEqual(timeline.events.map(e => e.time), [0, 1, 2.5, 3]);
  assert.equal(timeline.events[0].bassDuration, 4);
  assert.equal(timeline.events[0].bass, 'C3');
  assert.equal(timeline.events[1].bass, null);
  assert.equal(buildEvents(pattern, 40).duration, 6);
  assert.equal(frequency('A4'), 440);
  assert.equal(midi('C4'), 60);
});
