import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { getLesson, lessons, chapters } from '../curriculum.js';
import { scientistFirstMinute, scientistAccompanimentPath } from '../scientist-accompaniment.js';
import { practiceStudy, studyDuration, buildSongTimeline } from '../song-audio.js';
import { renderLesson } from '../lesson-view.js';
import { completeStep, freshState, validateState } from '../state.js';
const published = JSON.parse(readFileSync(new URL('./fixtures/published-checkpoints-v3.json', import.meta.url)));

test('all 168 published checkpoints keep their content, completion and resume identity', () => {
  assert.equal(published.length, 42);
  let checked = 0;
  const completed = Object.fromEntries(published.map(l => [l.id, [0,1,2,3]]));
  for (const saved of published) {
    const lesson = getLesson(saved.id);
    assert.equal(createHash('sha256').update(JSON.stringify(lesson.steps)).digest('hex'), saved.sha256, saved.id);
    for (let step = 0; step < saved.checkpoints; step++) {
      const original = { ...freshState(), completed, last: { lessonId: saved.id, step }, tempos: { [saved.id]: 76 }, review: { [saved.id]: true } };
      assert.deepEqual(validateState(original), original);
      checked++;
    }
  }
  assert.equal(checked, 168);
});

test('the first-minute lesson follows the introduction without repurposing saved steps', () => {
  const state = freshState();
  for (let i = 0; i < 4; i++) completeStep(state, 'scientist-play-intro', i);
  assert.equal(state.last.lessonId, scientistFirstMinute.id);
  completeStep(state, scientistFirstMinute.id, 0);
  assert.deepEqual(validateState(state).last, { lessonId: scientistFirstMinute.id, step: 1 });
  assert.equal(scientistAccompanimentPath[4].id, scientistFirstMinute.id);
});

test('the joined passage has three intro loops and two vocal-passage loops with a continuous timeline', () => {
  const step = scientistFirstMinute.steps[3];
  assert.equal(step.tracks.bars.length, 20);
  assert.deepEqual(step.tracks.sections.map(s => [s.from,s.to]), [[0,11],[12,15],[16,19]]);
  assert.deepEqual(step.tracks.bars.slice(0,4), step.tracks.bars.slice(12,16));
  const timeline = buildSongTimeline(step.tracks);
  assert.equal(timeline.beats, 80);
  assert.ok(timeline.events.some(e => e.beat === 48 && e.hand === 'left'));
  assert.equal(studyDuration(step.tracks, 76), 'Selected passage: about 1:03 of playing at 76 BPM + 0:03 count-in.');
  assert.equal(studyDuration(step.tracks, 50, { countIn:false }), 'Selected passage: about 1:36 of playing at 50 BPM · no count-in.');
  assert.match(studyDuration(step.tracks, 76, { from:12,to:15,countIn:false }), /0:13 of playing/);
});

test('bass choice changes both visible and playable events without mutating checkpoint notes', () => {
  const step = scientistFirstMinute.steps[1];
  const original = JSON.stringify(step);
  const held = practiceStudy(step, 'held');
  const repeated = practiceStudy(step, 'repeated');
  assert.equal(held.events.filter(e => e.hand === 'left').length, 4);
  assert.equal(repeated.events.filter(e => e.hand === 'left').length, 32);
  assert.deepEqual(repeated.events.filter(e => e.hand === 'right'), held.events.filter(e => e.hand === 'right'));
  const bass = buildSongTimeline(repeated, { hand:'left',from:1,to:1 });
  assert.deepEqual(bass.events.map(e => [e.note,e.beat,e.duration]), Array.from({length:8}, (_, i) => ['Bb3', i*0.5, 0.5]));
  assert.equal(JSON.stringify(step), original);
  assert.equal(practiceStudy(scientistFirstMinute.steps[0], 'repeated'), scientistFirstMinute.steps[0].tracks);
  const lesson = getLesson(scientistFirstMinute.id);
  const html = renderLesson({ lesson, stepIndex:1, chapter:chapters.find(c=>c.id===lesson.chapter), lessonNumber:1,lessonCount:lessons.length,done:[],bpm:76,looping:false,icon:()=>'',keyboard:()=>'',title:()=>'',selection:{hand:'both',from:0,to:3,countIn:true,bassStyle:'repeated'} });
  assert.ok(html.includes('Left-hand pattern'));
  assert.ok(html.includes('Beat 1.5 · hold 0.5 beats'));
  assert.ok(html.includes('76 BPM · later target'));
  assert.ok(html.includes('Left presses on every number'));
});
