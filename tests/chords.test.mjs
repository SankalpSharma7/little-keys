import test from 'node:test';
import assert from 'node:assert/strict';
import { chordPattern, defaultPlayground, validatePlayground, chords } from '../chords.js';
import { buildEvents, midi } from '../audio.js';
import { freshState, validateState, completeStep, isDone } from '../state.js';
import { lessons, getLesson } from '../curriculum.js';

test('all three playing styles retain four beats per bar and the chosen chord order', () => {
  const sequence = ['Am', 'Am', 'G', 'C'];
  for (const style of ['hold', 'pulse', 'ripple']) {
    const pattern = chordPattern(sequence, style);
    assert.equal(buildEvents(pattern, 60).duration, 16);
    assert.equal(buildEvents(pattern, 40).duration, 24);
    sequence.forEach((id, bar) => {
      const events = pattern.filter(event => event.bar === bar);
      assert.equal(events.reduce((n, e) => n + e.beats, 0), 4);
      assert.ok(events.every(e => e.chord === id));
    });
  }
  assert.deepEqual(chordPattern(['C'], 'ripple').map(e => e.notes), [['C4'], ['E4'], ['G4'], ['E4']]);
  assert.deepEqual(chordPattern(['Am'], 'hold')[0].notes, ['A3', 'C4', 'E4']);
  for (const chord of chords) for (const note of chord.notes) assert.ok(midi(note) >= 48 && midi(note) <= 83);
});

test('older progress upgrades without losing saved lessons or the resume point', () => {
  const oldSave = { version: 1, completed: { welcome: [0, 1], 'broken-chords': [0, 1, 2, 3] }, last: { lessonId: 'welcome', step: 2 }, tempos: { welcome: 45 } };
  const upgraded = validateState(oldSave);
  assert.deepEqual(upgraded.completed, oldSave.completed);
  assert.deepEqual(upgraded.last, oldSave.last);
  assert.equal(upgraded.tempos.welcome, 45);
  assert.deepEqual(upgraded.playground, defaultPlayground());
});

test('playground settings round-trip in backups and invalid choices use safe defaults', () => {
  const state = freshState();
  state.playground = { selected: 'F', sequence: ['F', 'Am', 'G', 'C'], style: 'ripple', bpm: 45, loop: false };
  assert.deepEqual(validateState(JSON.parse(JSON.stringify(state))).playground, state.playground);
  const bad = validatePlayground({ selected: '<script>', sequence: ['C', 'H', 'Am', 'F'], style: 'invalid', bpm: Infinity, loop: 'false' });
  assert.deepEqual(bad, defaultPlayground());
  assert.throws(() => chordPattern(['H']));
  assert.throws(() => chordPattern(['C'], 'invalid'));
});

test('new creative chord lesson has four saved checkpoints and existing IDs remain valid', () => {
  assert.equal(lessons.filter(l => l.chapter === 'chords').length, 5);
  assert.equal(getLesson('chord-play').steps.length, 4);
  const state = freshState();
  completeStep(state, 'chord-play', 0);
  assert.deepEqual(validateState(state).last, { lessonId: 'chord-play', step: 1 });
  for (const step of [1, 2, 3]) completeStep(state, 'chord-play', step);
  assert.equal(isDone(state, 'chord-play'), true);
  assert.ok(getLesson('left-hand'));
});
