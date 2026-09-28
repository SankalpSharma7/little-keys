import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { lessons, getLesson, chapters } from '../curriculum.js';
import { scientistAccompanimentPath, accompanimentSections, accompanimentChords, performanceStudy } from '../scientist-accompaniment.js';
import { freshState, loadState, saveState, completeStep, nextLesson, STORAGE_KEY } from '../state.js';
import { renderLesson } from '../lesson-view.js';
import { buildSongTimeline } from '../song-audio.js';
const published = JSON.parse(readFileSync(new URL('./fixtures/published-checkpoints-v2.json', import.meta.url)));

test('all 35 published lessons retain every existing checkpoint, including the earlier Scientist path', () => {
  assert.equal(published.length, 35);
  for (const l of published) assert.deepEqual(getLesson(l.id).steps, l.steps, l.id);
});

test('every previously published resume point round-trips with completions and preferences intact', () => {
  let checked = 0;
  for (const l of published) for (let step = 0; step < l.steps.length; step++) {
    const original = { ...freshState(), completed: Object.fromEntries(published.map(p => [p.id, p.id === l.id ? Array.from({ length: step }, (_, i) => i) : [0,1,2,3]])), last: { lessonId: l.id, step }, tempos: { [l.id]: 47 }, review: { [l.id]: true }, practiceSeconds: 512, days: ['2026-09-28'] };
    const data = new Map([[STORAGE_KEY, JSON.stringify(original)]]);
    const storage = { getItem: k => data.get(k), setItem: (k,v) => data.set(k,v) };
    const loaded = loadState(storage);
    assert.equal(loaded.error, null);
    assert.deepEqual(loaded.state, original);
    assert.ok(saveState(storage, loaded.state));
    assert.deepEqual(loadState(storage).state, loaded.state);
    checked++;
  }
  assert.equal(checked, 140);
});

test('the main accompaniment path is self-contained and each checkpoint has playable notes and a goal', () => {
  assert.equal(scientistAccompanimentPath.length, 10);
  for (const item of scientistAccompanimentPath) {
    const lesson = getLesson(item.id);
    for (let stepIndex = 0; stepIndex < lesson.steps.length; stepIndex++) {
      const step = lesson.steps[stepIndex];
      assert.notEqual(step.mode, 'reference');
      assert.ok(step.pattern.length || step.tracks?.events.length);
      const html = renderLesson({ lesson, stepIndex, chapter: chapters.find(c => c.id === lesson.chapter), lessonNumber: 1, lessonCount: lessons.length, done: [], bpm: 50, looping: false, icon: () => '', keyboard: () => '', title: () => '' });
      assert.ok(html.includes('id="play-demo"'));
      assert.ok(html.includes('id="play-notes"'));
      assert.ok(!html.includes('https://'));
      if (step.accompaniment) { assert.ok(step.task); assert.ok(html.includes('Your chord finder')); }
    }
  }
});

test('a learner who jumps into the song path advances within it and resumes the correct new checkpoint', () => {
  const state = freshState();
  for (let i = 0; i < 4; i++) completeStep(state, 'scientist-pulse', i);
  assert.equal(state.last.lessonId, 'scientist-play-intro');
  assert.equal(nextLesson(state, 'scientist-pulse').id, state.last.lessonId);
  completeStep(state, 'scientist-play-intro', 0);
  assert.deepEqual(state.last, { lessonId: 'scientist-play-intro', step: 1 });
  assert.equal(state.completed.welcome, undefined);
});

test('full performance contains every section, correct chord pitches, and a held final release', () => {
  const study = performanceStudy();
  assert.equal(study.bars.length, 91);
  assert.deepEqual(study.sections.map(s => s.name), accompanimentSections.map(s => s.name));
  let cursor = 0;
  for (const section of study.sections) {
    assert.equal(section.from, cursor);
    assert.equal(section.to - section.from + 1, section.bars.length);
    assert.deepEqual(study.bars.slice(section.from, section.to + 1), section.bars);
    cursor = section.to + 1;
    const segment = buildSongTimeline(study, { from: section.from, to: section.to });
    assert.equal(segment.beats, section.bars.length * 4);
  }
  for (let bar = 0; bar < study.bars.length; bar++) {
    const events = study.events.filter(e => e.beat >= bar * 4 && e.beat < (bar + 1) * 4);
    const chord = accompanimentChords[study.bars[bar]];
    assert.deepEqual(events.filter(e => e.hand === 'left').map(e => [e.note, e.duration]), [[chord.bass, 4]]);
    assert.deepEqual([...new Set(events.filter(e => e.hand === 'right').map(e => e.note))], chord.right);
    assert.equal(events.length, bar < study.bars.length - 3 ? 13 : 4);
    for (const e of events) assert.ok(e.beat + e.duration <= (bar + 1) * 4);
  }
  assert.equal(study.bars.at(-1), 'F');
  assert.equal(buildSongTimeline(study).points.at(-1).notes.length, 0);
});
