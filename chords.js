export const chords = [
  { id: 'C', name: 'C major', notes: ['C4', 'E4', 'G4'], description: 'Start at middle C. Skip D and F to find E and G.' },
  { id: 'Am', name: 'A minor', notes: ['A3', 'C4', 'E4'], description: 'Find A below middle C, then middle C and the E above it. The “m” means minor.' },
  { id: 'F', name: 'F major', notes: ['F3', 'A3', 'C4'], description: 'Find F below middle C, then A and middle C. Move your hand gently to this position.' },
  { id: 'G', name: 'G major', notes: ['G3', 'B3', 'D4'], description: 'Find G below middle C, then B and the D just above middle C.' },
];
export const getChord = id => chords.find(chord => chord.id === id);
export const styles = [
  { id: 'hold', name: 'Hold the chord', hint: 'Play all three notes together. Hold for four beats.' },
  { id: 'pulse', name: 'Give it a pulse', hint: 'Play the chord on beats 1 and 3. Hold each press for two beats.' },
  { id: 'ripple', name: 'Let it ripple', hint: 'Play the lowest, middle, highest, then middle note. One note per beat.' },
];
export const defaultPlayground = () => ({ selected: 'C', sequence: ['C', 'G', 'Am', 'F'], style: 'hold', bpm: 60, loop: true });
export function validatePlayground(raw) {
  const clean = defaultPlayground();
  if (!raw || typeof raw !== 'object') return clean;
  if (getChord(raw.selected)) clean.selected = raw.selected;
  if (Array.isArray(raw.sequence) && raw.sequence.length === 4 && raw.sequence.every(getChord)) clean.sequence = [...raw.sequence];
  if (styles.some(s => s.id === raw.style)) clean.style = raw.style;
  if (Number.isFinite(raw.bpm) && raw.bpm >= 40 && raw.bpm <= 100) clean.bpm = Math.round(raw.bpm / 5) * 5;
  if (typeof raw.loop === 'boolean') clean.loop = raw.loop;
  return clean;
}
export function chordPattern(sequence, style = 'hold') {
  if (!sequence.length || sequence.some(id => !getChord(id))) throw new Error('Choose a known chord.');
  if (!styles.some(s => s.id === style)) throw new Error('Choose a playing style.');
  return sequence.flatMap((id, bar) => {
    const notes = getChord(id).notes;
    const pattern = style === 'hold' ? [{ notes: [...notes], beats: 4 }]
      : style === 'pulse' ? [0, 1].map(() => ({ notes: [...notes], beats: 2 }))
      : [0, 1, 2, 1].map(i => ({ notes: [notes[i]], beats: 1 }));
    return pattern.map(event => ({ ...event, chord: id, bar }));
  });
}
