import test from 'node:test';
import { readFileSync } from 'node:fs';
const published = JSON.parse(readFileSync(new URL('./fixtures/published-checkpoints-v1.json', import.meta.url)));
import assert from 'node:assert/strict';
import { chapters, lessons, getLesson, totalCheckpoints } from '../curriculum.js';
import { stepGuidance, visiblePattern, hideEarAnswer } from '../lesson-guidance.js';
import { renderLesson } from '../lesson-view.js';
import { completeStep, validateState, nextLesson } from '../state.js';

function screen(id, stepIndex, options = {}) {
  const lesson = getLesson(id);
  return renderLesson({
    lesson, stepIndex, chapter: chapters.find(c => c.id === lesson.chapter),
    lessonNumber: lessons.indexOf(lesson) + 1, lessonCount: lessons.length,
    done: [], bpm: lesson.bpm, looping: false, review: false,
    revealed: false, hintShown: false,
    icon: () => '', keyboard: () => '<div data-test="keyboard"></div>',
    title: (eyebrow, heading, description) => `<h1>${heading}</h1><p>${description}</p>`,
    ...options,
  });
}

test('listening checkpoints clearly separate hearing from playing and guessing', () => {
  for (const id of ['first-tune', 'mary', 'ode', 'twinkle', 'scientist-prep', 'adele-prep']) {
    const lesson = getLesson(id); const step = lesson.steps[0];
    assert.equal(step.mode, 'listen');
    assert.equal(lesson.steps[1].mode, 'guided');
    const html = screen(id, 0);
    assert.ok(html.includes('No playing, naming notes, or guessing keys'));
    assert.ok(html.includes('I’ve listened — continue'));
    assert.ok(html.indexOf('id="play-demo"') < html.indexOf('data-test="keyboard"'));
    assert.ok(!html.includes('Your hand position'));
  }
});

test('guided steps show the supplied notes, hand position, and completion goal', () => {
  for (const lesson of lessons) for (let index = 0; index < lesson.steps.length; index++) {
    const step = lesson.steps[index];
    assert.ok(['guided', 'listen', 'explore', 'rhythm', 'ear', 'reference'].includes(step.mode));
    if (step.mode !== 'guided') continue;
    const html = screen(lesson.id, index);
    assert.ok(html.includes('You do not need to work out notes by ear.'), lesson.id);
    assert.ok(html.includes('Your hand position'), lesson.id);
    assert.ok(html.includes(step.tracks ? 'Read each bar' : 'How to read this:'), lesson.id);
    assert.ok(html.includes('I practised this — continue'), lesson.id);
    assert.equal(visiblePattern(step).length, step.pattern.length);
  }
  const firstPhrase = screen('first-tune', 1);
  assert.ok(firstPhrase.includes('middle finger'));
  assert.ok(firstPhrase.includes('index'));
  assert.ok(firstPhrase.includes('thumb'));
  assert.ok(firstPhrase.includes('do not press it twice'));
});

test('rhythm-only checkpoint starts a real metronome instead of a silent example', () => {
  const html = screen('steady-beat', 0);
  assert.ok(html.includes('id="play-demo" class="button primary" data-action="metronome"'));
  assert.ok(html.includes('You do not need to play any keys'));
  assert.ok(!html.includes('class="note-chip"'));
  assert.equal(stepGuidance(getLesson('steady-beat').steps[0]).completion, 'I tapped along — continue');
});

test('ear training is last, with no answer sequence or hint rendered until requested', () => {
  const lesson = getLesson('playing-by-ear');
  assert.equal(lessons.at(-1), lesson);
  assert.equal(lesson.steps.length, 4);
  assert.ok(totalCheckpoints >= 104);
  for (let index = 0; index < 4; index++) {
    const step = lesson.steps[index];
    const hidden = screen(lesson.id, index);
    assert.equal(step.mode, 'ear');
    assert.equal(hideEarAnswer(step), true);
    assert.deepEqual(visiblePattern(step), []);
    assert.ok(!hidden.includes('class="note-chip"'));
    assert.ok(!hidden.includes(step.answer));
    assert.ok(!hidden.includes(step.hint));
    assert.ok(hidden.includes('Reveal the answer'));
    assert.ok(hidden.includes('Hear reference'));
    const hinted = screen(lesson.id, index, { hintShown: true });
    assert.ok(hinted.includes(step.hint));
    assert.ok(!hinted.includes('class="note-chip"'));
    const revealed = screen(lesson.id, index, { revealed: true });
    assert.ok(revealed.includes('class="note-chip"'));
    assert.ok(revealed.includes(step.answer));
    assert.equal(hideEarAnswer(step, true), false);
    assert.deepEqual(visiblePattern(step, true), step.pattern);
  }
});

test('existing course completion and resume data survive the added lesson', () => {
  const completed = Object.fromEntries(published.filter(l => l.id !== 'playing-by-ear').map(l => [l.id, [0, 1, 2, 3]]));
  const original = { version: 1, completed, last: { lessonId: 'first-tune', step: 1 }, tempos: { 'first-tune': 45 } };
  const upgraded = validateState(original);
  assert.deepEqual(upgraded.completed, original.completed);
  assert.deepEqual(upgraded.last, original.last);
  assert.equal(upgraded.tempos['first-tune'], 45);
  assert.equal(nextLesson(upgraded).id, 'scientist-keys');
  completeStep(upgraded, 'playing-by-ear', 0);
  const restored = validateState(JSON.parse(JSON.stringify(upgraded)));
  assert.deepEqual(restored.last, { lessonId: 'playing-by-ear', step: 1 });
  assert.deepEqual(restored.completed['playing-by-ear'], [0]);
});
