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
