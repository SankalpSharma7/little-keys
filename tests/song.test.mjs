import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { lessons, getLesson, chapters } from '../curriculum.js';
import { loadState, saveState, STORAGE_KEY, countDone } from '../state.js';
import { midi, frequency, PianoAudio } from '../audio.js';
import { buildSongTimeline } from '../song-audio.js';
import { scientistLessons } from '../scientist.js';
import { renderLesson } from '../lesson-view.js';
const published = JSON.parse(readFileSync(new URL('./fixtures/published-checkpoints-v1.json', import.meta.url)));

test('every previously published checkpoint still identifies the same task and notes', () => {
  assert.equal(STORAGE_KEY, 'little-keys.progress.v1');
  assert.equal(published.length, 26);
  for (const saved of published) {
    const lesson = getLesson(saved.id);
    assert.ok(lesson, `Do not remove saved lesson ${saved.id}; write a migration first.`);
    assert.deepEqual(lesson.steps.map(s=>({title:s.title,mode:s.mode,pattern:s.pattern})), saved.steps, `Published checkpoints in ${saved.id} moved or changed meaning. Add a new lesson or an explicit migration.`);
  }
});

test('all 104 legacy resume points, completion lists, speeds and review flags round-trip without loss', () => {
  const completed = Object.fromEntries(published.map(l=>[l.id,l.steps.map((_,i)=>i)]));
  let cases=0;
  for (const lesson of published) for (let step=0;step<lesson.steps.length;step++) {
    const raw={version:1,completed:{...completed,[lesson.id]:Array.from({length:step},(_,i)=>i)},last:{lessonId:lesson.id,step},tempos:{[lesson.id]:45},review:{[lesson.id]:true},practiceSeconds:243,days:['2026-09-28']};
    const values = new Map([[STORAGE_KEY,JSON.stringify(raw)]]);
    const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
    const loaded=loadState(storage); assert.equal(loaded.error,null);
    assert.deepEqual(loaded.state.completed,raw.completed); assert.deepEqual(loaded.state.last,raw.last);
    assert.deepEqual(loaded.state.tempos,raw.tempos); assert.deepEqual(loaded.state.review,raw.review);
    assert.equal(loaded.state.practiceSeconds,243); assert.deepEqual(loaded.state.days,raw.days);
    assert.equal(countDone(loaded.state),100+step);
    assert.equal(saveState(storage,loaded.state),true);
    assert.deepEqual(loadState(storage).state,loaded.state); cases++;
  }
  assert.equal(cases,104);
});

test('flat spellings map to the same physical keys without changing sharp support',()=>{
  assert.equal(midi('Bb4'),midi('A#4')); assert.equal(frequency('Bb3'),frequency('A#3'));
  assert.equal(midi('C4'),60); assert.equal(midi('B3'),59);
  assert.throws(()=>midi('Bb')); assert.throws(()=>midi('H4'));
});

test('hand filtering and bar slicing preserve held bass notes and clip the selected range',()=>{
  const study={bars:['a','b'],events:[{hand:'left',note:'C3',beat:0,duration:8},{hand:'right',note:'E4',beat:0,duration:1},{hand:'right',note:'G4',beat:4,duration:1}]};
  const cut=buildSongTimeline(study,{from:1,to:1});
  assert.equal(cut.beats,4);
  assert.deepEqual(cut.events.map(e=>[e.note,e.beat,e.duration]),[['C3',0,4],['G4',0,1]]);
  assert.deepEqual(cut.points.find(p=>p.beat===1).notes,['C3']);
  assert.deepEqual(cut.points.at(-1).notes,[]);
  assert.deepEqual(buildSongTimeline(study,{hand:'right',from:1,to:1}).events.map(e=>e.note),['G4']);
  assert.throws(()=>buildSongTimeline(study,{from:1,to:0}));
  assert.throws(()=>buildSongTimeline(study,{hand:'other'}));
});

test('study playback schedules four count-in clicks, holds the bass once, and cancels callbacks on stop',async()=>{
  const calls=[],timers=[],highlight=[];
  const audio=new PianoAudio((...args)=>highlight.push(args),()=>calls.push('end'));
  audio.init=async()=>{audio.ctx={currentTime:0};};
  audio.click=(time,accent)=>calls.push(['click',time,accent]);
  audio.tone=(note,time,duration)=>calls.push(['tone',note,time,duration]);
  audio.timer=(fn,ms)=>timers.push({fn,ms});
  const study=getLesson('scientist-pulse').steps[0].tracks;
  await audio.playStudy(study,60,{countIn:true});
  assert.equal(calls.filter(c=>c[0]==='click').length,4);
  const bass=calls.filter(c=>c[0]==='tone'&&c[1]==='D3');
  assert.equal(bass.length,1); assert.equal(bass[0][2],4.05); assert.equal(bass[0][3],3.8);
  assert.equal(calls.filter(c=>c[0]==='tone'&&c[1]==='C4').length,4);
  audio.stop(); const after=highlight.length;
  timers.forEach(t=>t.fn()); assert.equal(highlight.length,after); assert.ok(!calls.includes('end'));
});

test('every song checkpoint has a playable original exercise or an explicit source task',()=>{
  assert.equal(scientistLessons.length,9);
  for (const lesson of scientistLessons) for (let i=0;i<lesson.steps.length;i++) {
    const step=lesson.steps[i];
    if (step.tracks) {
      for (const e of step.tracks.events) { assert.ok(e.beat>=0&&e.duration>0); assert.ok(e.beat+e.duration<=step.tracks.bars.length*4); assert.ok(['left','right'].includes(e.hand)); }
    }
    const html=renderLesson({lesson,stepIndex:i,chapter:chapters.find(c=>c.id===lesson.chapter),lessonNumber:lessons.indexOf(lesson)+1,lessonCount:lessons.length,done:[],bpm:50,looping:false,review:false,icon:()=>'',keyboard:()=>'<div>Keyboard</div>',title:()=>''});
    if(step.mode==='reference') {
      assert.ok(step.task); assert.ok(step.reference.location); assert.ok([1,2].includes(step.reference.page));
      assert.ok(html.includes('pianote.s3.amazonaws.com')); assert.ok(html.includes('Need help reading'));
      assert.ok(!html.includes('id="play-demo"')); assert.ok(!html.includes('id="play-notes"'));
      assert.ok(html.includes('I met this checkpoint'));
    } else assert.ok(step.tracks||step.pattern.length);
  }
  assert.match(getLesson('scientist-performance').steps[3].task,/complete simplified song/);
});
