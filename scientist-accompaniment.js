import { scientistLessons } from './scientist.js';

// Plain chord voicings and an intentionally uniform practice rhythm. No vocal melody.
export const accompanimentChords = {
  Dm7: { bass: 'D3', right: ['C4', 'F4', 'A4'], fingers: '1–3–5' },
  Dm: { bass: 'D3', right: ['D4', 'F4', 'A4'], fingers: '1–3–5' },
  'B♭': { bass: 'Bb3', right: ['D4', 'F4', 'Bb4'], fingers: '1–2–5' },
  F: { bass: 'F3', right: ['C4', 'F4', 'A4'], fingers: '1–3–5' },
  Fsus2: { bass: 'F3', right: ['C4', 'F4', 'G4'], fingers: '1–3–4' },
  C: { bass: 'C3', right: ['C4', 'E4', 'G4'], fingers: '1–3–5' },
};
const repeat = (bars, times) => Array.from({ length: times }, () => bars).flat();
const opening = ['Dm7', 'B♭', 'F', 'Fsus2'];
const later = ['Dm', 'B♭', 'F', 'Fsus2'];
const chorus = ['B♭', 'B♭', 'F', 'Fsus2', 'B♭', 'B♭', 'F', 'Fsus2', 'C', 'C'];

// Fixed repeat counts for our beginner performance, not a recording-synchronised chart.
export const accompanimentSections = [
  { id: 'intro', name: 'Introduction', bars: repeat(opening, 2), cue: 'Two loops. Quiet and even; enter verse one on the next Dm7.' },
  { id: 'verse-one', name: 'Verse one', bars: repeat(opening, 4), cue: 'Four loops. Keep the chords soft enough to sing or hum above.' },
  { id: 'chorus-one', name: 'Chorus one', bars: chorus, cue: 'B♭ lasts two bars each time. Finish with two bars of C.' },
  { id: 'link', name: 'Instrumental link', bars: [...later, ...opening], cue: 'Two loops; change from Dm to Dm7 in the second loop.' },
  { id: 'verse-two', name: 'Verse two', bars: repeat(later, 4), cue: 'Four loops using Dm. Keep the same steady pulse.' },
  { id: 'chorus-two', name: 'Chorus two', bars: chorus, cue: 'The same chord route returns. Give the last C its full two bars.' },
  { id: 'outro', name: 'Outro', bars: [...repeat(later, 2), ...repeat(['Dm', 'B♭', 'F', 'C'], 3)], cue: 'Two familiar loops, then three loops ending on C.' },
  { id: 'ending', name: 'Final release', bars: ['Dm', 'B♭', 'F'], cue: 'One held chord in each bar. Finish on F and release together.' },
];

export function accompanimentStudy(bars, { pulse = 1, bassOnly = false, rightOnly = false, sections } = {}) {
  return {
    bars: [...bars], sections,
    events: bars.flatMap((name, bar) => {
      const chord = accompanimentChords[name];
      if (!chord) throw new Error(`Unknown accompaniment chord: ${name}`);
      return [
        ...(rightOnly ? [] : [{ hand: 'left', note: chord.bass, beat: bar * 4, duration: 4 }]),
        ...(bassOnly ? [] : Array.from({ length: 4 / pulse }, (_, i) => chord.right.map(note => ({ hand: 'right', note, beat: bar * 4 + i * pulse, duration: pulse }))).flat()),
      ];
    }),
  };
}
export function performanceStudy(sections = accompanimentSections) {
  let cursor = 0;
  const ranges = sections.map(section => {
    const range = { ...section, from: cursor, to: cursor + section.bars.length - 1 };
    cursor += section.bars.length;
    return range;
  });
  const study = accompanimentStudy(sections.flatMap(s => s.bars), { sections: ranges });
  // Our own simple ending: no repeated chord attacks in the last three bars.
  const ending = ranges.find(s => s.id === 'ending');
  if (ending) {
    study.events = study.events.filter(e => e.beat < ending.from * 4);
    study.events.push(...accompanimentStudy(ending.bars, { pulse: 4 }).events.map(e => ({ ...e, beat: e.beat + ending.from * 4 })));
  }
  return study;
}
const handGuide = 'Left hand: one comfortable finger on the bass note; hold for all four counts. Right hand: press each shown group together. Use the chord finder below for finger suggestions. Release before moving; reduce a wide shape to its first two right-hand notes if needed.';
const step = (title, body, cue, bars, task, options = {}) => ({ title, body, cue, task, mode: 'guided', pattern: [], accompaniment: true, tracks: accompanimentStudy(bars, options) });
const lesson = (id, title, description, steps) => ({ id: `scientist-play-${id}`, chapter: 'scientist', goal: 'scientist', accompaniment: true, title, description, steps, duration: 15, bpm: 50, handGuide, tip: '2 minutes to warm up, 7 minutes on today’s checkpoint, 3 minutes to join it to what you know. Stop after 10–15 minutes and return here tomorrow. Mark a step after playing it yourself; the app cannot hear your keyboard.' });

export const accompanimentLessons = [
  lesson('intro', 'Play a complete introduction', 'Turn your four chord shapes into a beginning you can play confidently.', [
    step('Find the shape before the sound', 'Use the chord finder below to place both hands. Choose Right hand, listen, then stop and play each shape once on your Casio. Each bar is four counts. Allow a pause between shapes today. B♭3 is just below middle C; this comfortable bass register is our beginner choice.', 'Dm7 → B♭ → F → Fsus2. Four counts per shape.', opening, 'I found all four shapes twice without guessing the keys.', { pulse: 4 }),
    step('Keep the beat through the last change', 'Play F, Fsus2, then Dm7. Between Fsus2 and Dm7, your left hand moves from F to D while the top right note moves from G to A. Count aloud and prepare the move on count 4. Start at 40 BPM if 50 feels hurried.', 'The join back to the beginning deserves its own practice.', ['F', 'Fsus2', 'Dm7'], 'I made the return to Dm7 three times with a steady count.'),
    step('Play two rounds without stopping', 'The eight bars below form our beginner introduction: two rounds of the four-chord loop. Hold one left note per bar and press the right chord on each number. The count-in happens once before the selected range. Start with the example, then stop it and try on your own.', 'Count rounds: one, then two. Each round has four bars.', repeat(opening, 2), 'I played both rounds at one comfortable speed.'),
    step('Make an entrance', 'Play the introduction quietly, then one more Dm7 bar as your verse entrance. Do not add a pause after the second round. Imagine a singer beginning while your hands keep the same pulse. No singing is required yet; this task is about a smooth entrance.', 'Two rounds → next Dm7 → verse begins.', [...repeat(opening, 2), 'Dm7'], 'I played the introduction and entered the next bar twice.'),
  ]),
  lesson('verse', 'Keep a whole verse moving', 'Stay oriented through repeated chords and make space for a voice.', [
    step('Give each bar a number', 'Play one loop and say the bar number before counting: “bar one: 1–2–3–4”, then bar two, three and four. Only change chords when the next bar begins. The numbers on the cards refer to this exercise, not to a printed song score.', 'A beat is one count. A bar here is four beats. A loop is four bars.', opening, 'I can count four bars while keeping the right chord in each.'),
    step('Keep two loops quiet', 'Play two loops with a light left hand. Let the right-hand chords be a little clearer than the bass. Keep the same speed on both rounds. If tired, hold the right chord for four beats instead of pressing it four times; the chord changes stay the same.', 'Quiet hands, clear count. A held chord is a valid easier version.', repeat(opening, 2), 'I played two loops with comfortable volume and no extra pauses.'),
    step('Make the whole verse', 'Our verse practice uses four loops, sixteen bars. Think of each four-bar loop as one line of your plan. Count the loops on paper if useful. Practise loops three and four by selecting bars 9–16, then choose bars 1–16 and play the complete verse.', 'Four loops: 1–4, 5–8, 9–12, 13–16.', repeat(opening, 4), 'I played all four loops and knew when the verse ended.'),
    step('Enter the chorus on B-flat', 'Practise only the last F and Fsus2 of the verse, then two bars of B♭. The chorus starts on B♭ rather than restarting Dm7. Keep B♭ through two complete counts of four. Repeat this little join until the new section arrives without a pause.', 'F → Fsus2 → B♭ → stay on B♭.', ['F', 'Fsus2', 'B♭', 'B♭'], 'I entered B♭ and held the harmony for both bars three times.'),
  ]),
  lesson('chorus', 'Give the chorus its own shape', 'Learn the longer B-flat chord and the C chord that leads onward.', [
    step('Stay on B-flat for two bars', 'The chorus begins with two bars of B♭, then one bar each of F and Fsus2. The extra B♭ bar is easy to miss. Count eight beats as two groups of four, and keep the right chord gently pulsing while the left re-presses on each bar’s first beat.', 'B♭ | B♭ | F | Fsus2. Vertical lines separate bars.', chorus.slice(0, 4), 'I kept B♭ for two bars before moving to F.'),
    step('Find the C chord and wait', 'Place left C3 below middle C and right C4–E4–G4 with fingers 1–3–5. Practise Fsus2 into C, and stay on C for two bars. Release the old shape before placing the new one. Those two C bars give the section time to finish.', 'Left C. Right C–E–G. Two full bars of C.', ['Fsus2', 'C', 'C'], 'I found C comfortably and kept both bars in time.'),
    step('Join the ten-bar chorus', 'Play B♭–B♭–F–Fsus2 twice, then C–C. That makes ten bars. Learn bars 1–4 first, then bars 5–10, then join them. Keep the left hand at one held note per bar; add a little strength with the right hand without speeding up.', 'Four bars + four bars + two C bars.', chorus, 'I played the complete chorus route twice without missing a bar.'),
    step('Return through D minor', 'For Dm, play left D3 and right D4–F4–A4, fingers 1–3–5. Compared with Dm7, move your right thumb from C to D. Practise the two final C bars and the next Dm bar. First play held chords, then return to the gentle pulse when ready.', 'C | C | Dm. Dm uses D–F–A in the right hand.', ['C', 'C', 'Dm'], 'I moved from the chorus into Dm without a rushed or missed beat.', { pulse: 4 }),
  ]),
  lesson('middle', 'Connect the middle of the song', 'Build the instrumental link, second verse, and returning chorus.', [
    step('Learn the instrumental link', 'Play two four-bar loops. The first starts on Dm; the second starts on Dm7. The other three chords remain B♭, F and Fsus2. Practise the thumb change slowly and use the cards to track where you are. There is no need to add decorative notes.', 'First loop: Dm. Second loop: Dm7.', accompanimentSections[3].bars, 'I played the eight-bar link with the two different D chords.'),
    step('Prepare the second verse', 'The second verse uses Dm–B♭–F–Fsus2 in this accompaniment. Start with two loops and give your right thumb its D position each time. Keep your shoulders loose; repeated sections are a chance to settle into a comfortable movement.', 'Dm → B♭ → F → Fsus2.', repeat(later, 2), 'I played two loops using Dm, with a relaxed hand position.'),
    step('Complete the second verse', 'Play four loops of the second-verse pattern. Start softly and gradually let the last loop sound a little fuller. Keep the beat unchanged. Try bars 9–16 first if the final half is less familiar; then put the sixteen bars together.', 'Four loops again. New section, familiar counting.', repeat(later, 4), 'I played the complete second-verse accompaniment and counted all four loops.'),
    step('Return to the chorus', 'Join the last two bars of verse two to the first four bars of the chorus. After F and Fsus2, go to B♭ for two bars, then F and Fsus2. You already know the rest of the ten-bar chorus; this checkpoint practises its entrance.', 'A smooth entrance makes the familiar chorus easier.', ['F', 'Fsus2', ...chorus.slice(0, 4)], 'I entered the returning chorus smoothly twice.'),
  ]),
  lesson('voice', 'Make room to sing or hum', 'Use your voice as an optional melody while the keyboard supports it.', [
    step('Speak while holding chords', 'Hold one chord for each four-count. Say a short everyday sentence over it, such as “today I am playing my keyboard”. Your words do not have to land on the clicks. This original coordination task helps your voice move freely while your hands keep time.', 'Hands keep the count; your voice can move independently.', opening, 'I kept the chord changes steady while speaking, or counted aloud instead.', { pulse: 4 }),
    step('Hum one comfortable sound', 'Hum a comfortable sound over each held chord, or simply breathe while counting if you prefer not to sing. Do not search for the song melody here: this is an original voice-and-hands exercise. Keep your breathing easy and stop humming if it feels strained.', 'A quiet hum is enough; singing is optional.', opening, 'I kept four steady bars while humming or counting.', { pulse: 4 }),
    step('Try a familiar vocal phrase', 'If you already know the song’s vocal tune, try humming a short phrase from memory over the verse chords. Begin with held chords; return to a pulse later. The app plays only the accompaniment and does not supply or check the vocal melody. If the tune is unfamiliar, continue by counting aloud instead.', 'Keep the keyboard simple while adding your voice.', repeat(opening, 2), 'I accompanied a short hum, or kept the full count aloud, without stopping my hands.', { pulse: 4 }),
    step('Keep going after a mistake', 'Play two loops. On the second loop, deliberately leave out one right-hand press while your left hand and counting continue. Rejoin on the next number. Recovering without restarting helps you accompany yourself or another singer confidently.', 'Miss one press → keep counting → rejoin.', repeat(opening, 2), 'I recovered on the next beat and finished the loop.'),
  ]),
  lesson('ending', 'Learn how to finish', 'Shape the outro, simplify when tired, and end deliberately.', [
    step('Begin the outro with what you know', 'After the returning chorus, start with two Dm–B♭–F–Fsus2 loops. Play softly enough that your hands stay relaxed. This uses the same hand positions as verse two. Do not increase speed just because the changes are familiar.', 'Two familiar loops start our outro.', repeat(later, 2), 'I played both outro loops at the same comfortable tempo.'),
    step('Change the last chord of the loop', 'Now play Dm–B♭–F–C. C replaces Fsus2 at the end of this four-bar pattern. Practise the change from F to C and from C back to Dm separately if needed. Then play two loops while counting aloud.', 'Same first three chords, a new fourth chord.', repeat(['Dm', 'B♭', 'F', 'C'], 2), 'I played two loops ending on C and returned to Dm confidently.'),
    step('Count three rounds of the final loop', 'Our beginner outro finishes with three rounds of Dm–B♭–F–C before the final release. The twelve bars below make the round count visible. Keep the third round lighter to signal that the performance is coming to an end.', 'Three rounds, then the ending. Do not loop forever.', repeat(['Dm', 'B♭', 'F', 'C'], 3), 'I counted three rounds and stopped ready for the ending.'),
    step('Land gently on F', 'Play held Dm, held B♭, then held F, one four-count each. Hold the final F for all four counts and lift both hands together. Once comfortable, you may slow the final two changes when playing alone; the app example stays at a fixed tempo so the counts remain clear.', 'Dm → B♭ → F. Let the final sound finish.', ['Dm', 'B♭', 'F'], 'I played the ending and released the last chord deliberately twice.', { pulse: 4 }),
  ]),
  lesson('performance', 'Play from beginning to end', 'Join every section of your beginner accompaniment into one performance.', [
    { ...step('Join introduction, verse and chorus', 'Choose one comfortable tempo for all three sections, such as 50 BPM. Use the section buttons to practise a difficult part, then choose Whole exercise for the complete run. Play alongside the guide once; stop it and repeat on your Casio. A held right chord is always a valid easier version.', 'One tempo, three sections, no restart.', [], 'I joined the introduction, verse one and chorus one.'), tracks: performanceStudy(accompanimentSections.slice(0, 3)) },
    { ...step('Join the middle and returning chorus', 'Start at the instrumental link, continue through verse two, then play the returning chorus. Practise the joins rather than restarting whenever one fails. After a mistake, hold the current chord, keep counting and re-enter on the next first beat.', 'Link → verse two → chorus two.', [], 'I connected all three middle sections and recovered after any slips.'), tracks: performanceStudy(accompanimentSections.slice(3, 6)) },
    { ...step('Join the outro and final release', 'Start at the outro: two familiar loops, then three loops ending in C. Continue into the held Dm–B♭–F ending. Keep Loop switched off so the final chord can finish. Use the section map to check the route before you begin.', 'Know where to stop before you start.', [], 'I played the complete outro and finished on F.'), tracks: performanceStudy(accompanimentSections.slice(6)) },
    { ...step('Your complete accompaniment performance', 'Play the whole route below at your comfortable tempo. It includes every major section in our beginner version, with fixed repeat counts and a simple ending. These are accompaniment chords for singing or humming; they do not play the vocal melody. This version is for your own performance, not exact synchronisation with the studio recording. After one run, choose just one transition to improve next session.', 'Finish the route. A recovered mistake still counts.', [], 'I played every section from introduction to final F without restarting the performance.'), tracks: performanceStudy() },
  ]),
];

export const scientistAccompanimentPath = [...scientistLessons.slice(0, 3), ...accompanimentLessons];
