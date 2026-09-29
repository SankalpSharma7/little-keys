// Use the same selected bass part for both the visible guide and audio playback.
export function practiceStudy(step, bassStyle = 'held') {
  if (!step.bassChoice || bassStyle !== 'repeated') return step.tracks;
  return { ...step.tracks, bassPulse: 0.5, events: step.tracks.events.flatMap(e => e.hand === 'left'
    ? Array.from({ length: Math.ceil(e.duration / 0.5) }, (_, i) => ({ ...e, beat: e.beat + i * 0.5, duration: Math.min(0.5, e.duration - i * 0.5) }))
    : [e]) };
}

export function studyDuration(study, bpm, { from = 0, to = study.bars.length - 1, countIn = true } = {}) {
  const time = seconds => { const rounded = Math.round(seconds); return `${Math.floor(rounded / 60)}:${String(rounded % 60).padStart(2, '0')}`; };
  return `Selected passage: about ${time((to - from + 1) * 4 * 60 / bpm)} of playing at ${bpm} BPM${countIn ? ` + ${time(4 * 60 / bpm)} count-in` : ' · no count-in'}.`;
}

// A timeline of independent notes, so a held bass need not be retriggered by melody notes.
export function buildSongTimeline(study, { hand = 'both', from = 0, to = study.bars.length - 1 } = {}) {
  if (!['both', 'left', 'right'].includes(hand) || !Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < from || to >= study.bars.length) throw new Error('Choose a valid hand and bar range.');
  const start = from * 4, end = (to + 1) * 4;
  const events = study.events.filter(e => (hand === 'both' || e.hand === hand) && e.beat < end && e.beat + e.duration > start).map(e => ({
    ...e, beat: Math.max(e.beat, start) - start, duration: Math.min(e.beat + e.duration, end) - Math.max(e.beat, start),
  }));
  // Also send releases to the keyboard view; no stale held-note highlighting.
  const points = [...new Set([0, ...events.flatMap(e => [e.beat, e.beat + e.duration]), ...Array.from({length: end-start}, (_, i) => i)])].sort((a,b)=>a-b);
  return { events, beats: end-start, points: points.map(beat => ({ beat, index: start + Math.floor(beat), notes: [...new Set(events.filter(e => e.beat <= beat && e.beat + e.duration > beat).map(e=>e.note))] })) };
}
