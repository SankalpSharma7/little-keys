import { buildSongTimeline } from './song-audio.js';

export function midi(note) {
  const match = /^([A-G])([#b]?)([0-8])$/.exec(note);
  if (!match) throw new Error(`Invalid note: ${note}`);
  return (Number(match[3]) + 1) * 12 + ({ C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[match[1]]) + (match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0);
}
export const frequency = note => 440 * 2 ** ((midi(note) - 69) / 12);
export function buildEvents(pattern, bpm, bass) {
  let time = 0;
  const beat = 60 / bpm;
  const duration = pattern.reduce((s, e) => s + e.beats * beat, 0);
  const events = pattern.map((event, index) => {
    const result = { index, time, duration: event.beats * beat, notes: event.notes, bass: index === 0 ? bass : null, bassDuration: duration };
    time += event.beats * beat;
    return result;
  });
  return { events, duration };
}
export class PianoAudio {
  constructor(onNote, onEnd) { this.onNote = onNote; this.onEnd = onEnd; this.timers = []; this.voices = new Set(); this.token = 0; this.volume = 0.65; }
  async init() {
    const Context = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!Context) throw new Error('Audio playback is not supported in this browser. Try a current Chrome, Edge, Firefox, or Safari browser.');
    this.ctx ||= new Context();
    await this.ctx.resume();
  }
  tone(note, start, duration, velocity = 1) {
    const f = frequency(note);
    const master = this.ctx.createGain();
    master.gain.setValueAtTime(0.0001, start);
    master.gain.exponentialRampToValueAtTime(0.16 * this.volume * velocity, start + 0.008);
    master.gain.exponentialRampToValueAtTime(0.06 * this.volume * velocity, start + Math.min(0.3, duration * 0.5));
    master.gain.exponentialRampToValueAtTime(0.015 * this.volume * velocity, start + duration);
    master.gain.exponentialRampToValueAtTime(0.0001, start + duration + 0.16);
    master.connect(this.ctx.destination);
    let remaining = 3;
    for (const [harmonic, gain] of [[1, 1], [2, 0.27], [3, 0.1]]) {
      const osc = this.ctx.createOscillator();
      const amp = this.ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = f * harmonic; amp.gain.value = gain;
      osc.connect(amp); amp.connect(master);
      osc.start(start); osc.stop(start + duration + 0.2);
      this.voices.add(osc);
      osc.onended = () => { this.voices.delete(osc); osc.disconnect(); amp.disconnect(); if (--remaining === 0) master.disconnect(); };
    }
  }
  timer(fn, ms) { const timer = setTimeout(() => { this.timers = this.timers.filter(t => t !== timer); fn(); }, Math.max(0, ms)); this.timers.push(timer); }
  async preview(note) { await this.init(); this.tone(note, this.ctx.currentTime, 0.6); }
  async play(pattern, bpm, { loop = false, bass, metronome = false } = {}) {
    this.stop();
    const token = this.token;
    await this.init();
    if (token !== this.token) return;
    const data = buildEvents(pattern, bpm, bass);
    const cycle = start => {
      if (token !== this.token) return;
      for (const event of data.events) {
        const when = start + event.time;
        if (metronome) this.click(when, event.index % 4 === 0);
        else for (const note of event.notes) this.tone(note, when, note === event.bass ? event.bassDuration * 0.98 : event.duration * 0.88, 1 / Math.sqrt(Math.max(1, event.notes.length)));
        this.timer(() => {
          if (token !== this.token) return;
          this.onNote(metronome ? [] : [...new Set([...event.notes, ...(bass ? [bass] : [])])], event.index, metronome);
        }, (when - this.ctx.currentTime) * 1000);
      }
      const end = start + data.duration;
      if (loop) this.timer(() => cycle(end), (end - this.ctx.currentTime - 0.12) * 1000);
      else this.timer(() => { if (token === this.token) { this.onNote([], -1, false); this.onEnd(); } }, (end - this.ctx.currentTime) * 1000);
    };
    cycle(this.ctx.currentTime + 0.05);
  }
  async playStudy(study, bpm, { loop = false, countIn = true, ...selection } = {}) {
    this.stop();
    const token = this.token;
    const timeline = buildSongTimeline(study, selection);
    if (!timeline.events.length) throw new Error('This exercise has no notes for that hand. Choose another hand.');
    await this.init();
    if (token !== this.token) return;
    const beatSeconds = 60 / bpm;
    const cycle = start => {
      if (token !== this.token) return;
      const lead = countIn ? 4 : 0;
      for (let i = 0; i < lead; i++) {
        const when = start + i * beatSeconds;
        this.click(when, i === 0);
        this.timer(() => { if (token === this.token) this.onNote([], i - 4, true); }, (when - this.ctx.currentTime) * 1000);
      }
      const musicStart = start + lead * beatSeconds;
      for (const event of timeline.events) this.tone(event.note, musicStart + event.beat * beatSeconds, event.duration * beatSeconds * 0.95, event.hand === 'left' ? 0.65 : 0.8);
      for (const point of timeline.points) this.timer(() => {
        if (token === this.token) this.onNote(point.notes, point.index, false);
      }, (musicStart + point.beat * beatSeconds - this.ctx.currentTime) * 1000);
      const end = musicStart + timeline.beats * beatSeconds;
      if (loop) this.timer(() => cycle(end), (end - this.ctx.currentTime - 0.12) * 1000);
      else this.timer(() => { if (token === this.token) { this.onNote([], -1, false); this.onEnd(); } }, (end - this.ctx.currentTime) * 1000);
    };
    cycle(this.ctx.currentTime + 0.05);
  }
  click(start, accent) {
    const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
    osc.frequency.value = accent ? 1100 : 760;
    gain.gain.setValueAtTime(0.12 * this.volume, start); gain.gain.exponentialRampToValueAtTime(0.001, start + 0.045);
    osc.connect(gain); gain.connect(this.ctx.destination); osc.start(start); osc.stop(start + 0.05);
    this.voices.add(osc); osc.onended = () => { this.voices.delete(osc); osc.disconnect(); gain.disconnect(); };
  }
  stop() {
    this.token++;
    this.timers.forEach(clearTimeout); this.timers = [];
    for (const voice of this.voices) { try { voice.stop(); voice.disconnect(); } catch {} }
    this.voices.clear();
    this.onNote([], -1, false);
  }
}
