// Demonstration melodies below are traditional/public-domain. Song-goal drills
// are original technique exercises, not transcriptions of commercial recordings.
export const chapters = [
  { id: 'start', name: 'Meet your keyboard', subtitle: 'Your first notes, one small step at a time.', icon: 'spark', color: 'purple' },
  { id: 'rhythm', name: 'Find your rhythm', subtitle: 'Turn notes into something musical.', icon: 'pulse', color: 'peach' },
  { id: 'melodies', name: 'Play your first tunes', subtitle: 'Little melodies. Big firsts.', icon: 'music', color: 'green' },
  { id: 'chords', name: 'Make friends with chords', subtitle: 'Discover the sounds underneath your favourite songs.', icon: 'keys', color: 'purple' },
  { id: 'hands', name: 'Bring both hands together', subtitle: 'Build coordination slowly and comfortably.', icon: 'hands', color: 'peach' },
  { id: 'songs', name: 'Toward your favourite songs', subtitle: 'Practise the building blocks of Coldplay and Adele.', icon: 'star', color: 'green' },
];

export function phrase(notes, beats = 1) {
  return notes.split(' ').map(token => {
    const [pitch, duration] = token.split(':');
    return { notes: pitch === '-' ? [] : pitch.split('+'), beats: duration ? Number(duration) : beats };
  });
}
const step = (title, body, cue, notes, extra = {}) => ({ title, body, cue, pattern: phrase(notes), ...extra });
const lesson = (id, chapter, title, description, tip, steps, extra = {}) => ({ id, chapter, title, description, tip, steps, duration: 12, bpm: 60, ...extra });

export const lessons = [
  lesson('welcome', 'start', 'Hello, piano.', 'Get comfortable, find a piano sound, and make your very first notes.', 'Start with a comfortable volume. Let your shoulders drop and keep your wrists relaxed. Short, comfortable practice beats pushing through tension.', [
    step('Make yourself at home', 'Sit roughly in front of the centre of your keyboard. Keep your feet supported and your elbows around key height. Select a piano tone on your CT-X870IN using its PIANO/ORGAN button; check the display for the piano sound. Play any key gently.', 'Your only goal: a comfortable position and a sound you like.', 'C4:2 E4:2 G4:2', { task: 'I’m comfortable and have a piano sound' }),
    step('Spot the black-key pattern', 'Look across the keyboard. Black keys repeat in groups of TWO and THREE. Find three different groups of two. You do not need to memorise any note names yet.', 'Point to a group of two, then a group of three, on your real keyboard.', 'C#4 D#4 - F#4 G#4 A#4', { task: 'I can find both black-key groups' }),
    step('Find your first C', 'Find a group of two black keys near the middle. The white key immediately to their LEFT is C. Middle C is called C4 in this app. On the standard untransposed 61-key layout, it is the third C from the left.', 'Play C gently three times. Listen to the demonstration if you like.', 'C4:2 C4:2 C4:2', { task: 'I found C on my keyboard' }),
    step('A tiny musical hello', 'Starting at C, move right to the next white key, D, then the next, E. With your right hand, try thumb on C, index on D, and middle finger on E. Play slowly, then come back down.', 'C · D · E · D · C. There is no rush.', 'C4 D4 E4 D4 C4:2', { task: 'I played my first five-note phrase' }),
  ]),
  lesson('cde', 'start', 'Three notes, endless beginnings', 'Get to know C, D, and E without needing to look them up.', 'Finger numbers: thumb 1, index 2, middle 3, ring 4, little finger 5. This numbering applies to both hands.', [
    step('Find C again', 'Find a group of two black keys. Name the white keys around it: C on the left, D between the black keys, E on the right. Find these three keys near the middle of your keyboard.', 'Say the letter names out loud as you play.', 'C4:2 D4:2 E4:2'),
    step('Give each finger a note', 'Rest your right thumb on C, index finger on D, and middle finger on E. Curve your fingers naturally. Play one note at a time and release before the next.', 'Right hand: 1 · 2 · 3 · 2 · 1.', 'C4 D4 E4 D4 C4:2'),
    step('Change the order', 'Keep the same hand position. Play E, then C, then D, then E. Pause and repeat. Notice that your fingers can find notes without your whole hand moving.', 'Right hand: 3 · 1 · 2 · 3.', 'E4 C4 D4 E4:2'),
    step('Try it with fewer hints', 'Look away from the laptop and find C–D–E on the keyboard. Play up and back down twice. If you lose your place, use the group of two black keys to start again.', 'Aim for two comfortable attempts, at your own speed.', 'C4 D4 E4 D4 C4:2'),
  ]),
  lesson('five-notes', 'start', 'A handful of notes', 'Add F and G, and let all five right-hand fingers join in.', 'Keep your wrist soft. A small natural movement is fine; you do not need to hold your hand rigidly in place.', [
    step('Meet F and G', 'From E, move to the next white key, F, then G. F sits immediately to the left of a group of three black keys. Play C, D, E, F, G slowly.', 'Five neighbouring white keys: C · D · E · F · G.', 'C4 D4 E4 F4 G4:2'),
    step('Settle your five fingers', 'Place your right hand on C–D–E–F–G: fingers 1–2–3–4–5. Press each key gently. Your ring finger may feel less independent; give it time.', 'Play 1 · 2 · 3 · 4 · 5, without forcing or stretching.', 'C4:2 D4:2 E4:2 F4:2 G4:2'),
    step('Come back home', 'Play G–F–E–D–C with fingers 5–4–3–2–1. Leave a little space between notes if that helps. Repeat from C to G and back.', 'The final C should feel like coming home.', 'C4 D4 E4 F4 G4 F4 E4 D4 C4:2'),
    step('A little skipping game', 'Play C–E–G–E–C. You skip over D and F. Keep your fingers resting near their keys; use thumb, middle finger, and little finger.', 'Right hand: 1 · 3 · 5 · 3 · 1.', 'C4 E4 G4 E4 C4:2'),
  ]),
  lesson('first-tune', 'start', 'Your first little tune', 'Play “Hot Cross Buns” using just the three notes you know.', 'You can finish a lesson slowly. Comfortable and repeatable matters more than fast.', [
    step('Listen to the tune', 'Listen once and notice the repeated opening. This traditional tune uses E, D, and C. Put your right fingers 3, 2, and 1 over those keys.', 'Listen first. Then sing or hum along if you like.', 'E4:2 D4:2 C4:4 E4:2 D4:2 C4:4 C4 C4 C4 C4 D4 D4 D4 D4 E4:2 D4:2 C4:4'),
    step('Learn the first phrase', 'Play E–D–C, letting the C last longer. Repeat the same phrase. Count “1, 2” for E and D; count four beats for C.', 'E (2 beats) · D (2) · C (4), then repeat.', 'E4:2 D4:2 C4:4 E4:2 D4:2 C4:4'),
    step('Learn the second phrase', 'Play four Cs, then four Ds, using one beat for each note. Finish with E–D–C, holding those notes as in the opening.', 'C C C C · D D D D · E— D— C——.', 'C4 C4 C4 C4 D4 D4 D4 D4 E4:2 D4:2 C4:4'),
    step('Put your tune together', 'Play the two opening phrases, then four Cs, four Ds, and the ending. Pause between sections if needed. You have learned a complete little melody.', 'Try one full run, then celebrate your first tune.', 'E4:2 D4:2 C4:4 E4:2 D4:2 C4:4 C4 C4 C4 C4 D4 D4 D4 D4 E4:2 D4:2 C4:4'),
  ], { duration: 15, song: 'Hot Cross Buns' }),
  lesson('steady-beat', 'rhythm', 'Find a steady heartbeat', 'Feel a pulse before adding more notes.', 'BPM means beats per minute. At 60 BPM, each beat lasts one second. Start slowly enough that you can stay relaxed.', [
    step('Tap the pulse', 'Turn on the metronome below. Tap your thigh with one finger on each click. Count 1–2–3–4, then begin again. Try four groups of four.', 'Listen for a few clicks before you join in.', '- - - -'),
    step('One note on each beat', 'With the metronome at 60, play middle C on each click. Lift the key between presses. Keep the tapping feeling from the previous step.', 'C · C · C · C. Four even notes.', 'C4 C4 C4 C4'),
    step('Keep the beat while moving', 'Play C–D–E–D, one note per click. Repeat the pattern. If moving fingers makes you rush, slow the tempo to 45 or 50.', 'The notes change; the pulse stays the same.', 'C4 D4 E4 D4 C4 D4 E4 D4'),
    step('Make your own steady ending', 'Play C–D–E–G, then hold C for four clicks. Try it twice. Stop the metronome when you finish.', 'A steady slow version is the goal.', 'C4 D4 E4 G4 C4:4'),
  ]),
  lesson('long-short', 'rhythm', 'Long notes, short notes', 'Learn how the same notes can sound different through timing.', 'The pulse keeps going underneath long notes. Keep counting even while your finger stays down.', [
    step('Hold for two beats', 'Play C and keep the key down while you count 1–2. Play D for 1–2, then E for 1–2. Listen to the demo to hear the length.', 'One key press lasts two beats.', 'C4:2 D4:2 E4:2'),
    step('Mix one and two', 'Play C for one beat, D for one, and E for two. Count “1, 2, 3–4”. Repeat without a long gap.', 'C · D · E— | C · D · E—.', 'C4 D4 E4:2 C4 D4 E4:2'),
    step('Hold for four', 'Play G for four beats, then E for four, then C for four. Keep your finger on the key but your arm relaxed. Do not press harder to keep a note going.', 'Count all four beats for every note.', 'G4:4 E4:4 C4:4'),
    step('Use the rhythm in a phrase', 'Play C–D–E–G with the lengths shown below, then finish on C. Tap the pulse with your foot only if it feels comfortable.', 'C (1) · D (1) · E (2) · G (2) · C (4).', 'C4 D4 E4:2 G4:2 C4:4'),
  ]),
  lesson('rests', 'rhythm', 'The music between the notes', 'Make deliberate pauses and begin to recognise rhythm symbols.', 'A rest is a planned silence. Release the key, keep counting, and come back in on the next beat.', [
    step('Leave room for silence', 'Play C for a beat, then lift your finger and stay silent for a beat. Repeat. The dash in the note strip means a rest.', 'C · rest · C · rest.', 'C4 - C4 - C4 - C4 -'),
    step('A question and an answer', 'Play C–D–E, then rest for one beat. Answer with E–D–C and another rest. Keep the silent beat as long as the played beats.', 'Three notes, one silent beat.', 'C4 D4 E4 - E4 D4 C4 -'),
    step('Meet three rhythm symbols', 'A quarter note (♩) lasts one beat in our exercises. A half note (𝅗𝅥) lasts two, and a whole note (𝅝) lasts four. The beat counts under the demonstration notes give you the same information.', 'Play C for 1 beat, D for 1, E for 2, and C for 4.', 'C4 D4 E4:2 C4:4'),
    step('Keep counting through a rest', 'Try this phrase twice. Release E before the rest, stay silent for two beats, and finish on C for four.', 'C (1) · D (1) · E (2) · rest (2) · C (4).', 'C4 D4 E4:2 -:2 C4:4'),
  ]),
  lesson('expression', 'rhythm', 'Give the notes a little feeling', 'Explore soft and louder notes, and smooth versus separated playing.', 'Your CT-X870IN has touch response: with it enabled, how quickly you press a key affects volume. Use comfortable movements, never force.', [
    step('Soft and a little louder', 'With touch response enabled, play C gently three times. Then play three times with a slightly quicker key press. Listen to your own keyboard for the change; our guide demo is only a pitch reference.', 'Compare your own soft and moderately loud sound.', 'C4:2 C4:2 C4:2'),
    step('Separate the notes', 'Play C–D–E–F–G with a little space between notes. Release each key before the next. Keep the movement light rather than sharply poking the keys.', 'Think “little footsteps”.', 'C4 D4 E4 F4 G4:2'),
    step('Connect the notes', 'Now try the same notes smoothly. Release one as you press the next, without holding both for a long time. Slow down until the transitions feel comfortable.', 'Think “one gentle line”.', 'C4:2 D4:2 E4:2 F4:2 G4:2'),
    step('Shape a musical sentence', 'Play C–D–E–G–E–D–C. Start softly, let the middle grow slightly, and finish softly. There is no volume score: use your ears.', 'Make the last C sound like the end of a sentence.', 'C4 D4 E4 G4:2 E4 D4 C4:4'),
  ]),
  lesson('mary', 'melodies', 'A melody you already know', 'Learn “Mary Had a Little Lamb” in two small pieces.', 'Humming before playing can help you remember a phrase. Use right-hand fingers 1=C, 2=D, 3=E, 5=G.', [
    step('Listen and map the notes', 'Listen for the opening E–D–C–D. The tune mostly uses three notes, with a brief visit to G. Place your right hand over C–G.', 'Listen once without trying to keep up.', 'E4 D4 C4 D4 E4 E4 E4:2 D4 D4 D4:2 E4 G4 G4:2'),
    step('The first line', 'Play E–D–C–D, then E three times. Hold the final E for two beats. Practise until your hand can stay relaxed.', 'Fingers: 3 · 2 · 1 · 2 · 3 · 3 · 3.', 'E4 D4 C4 D4 E4 E4 E4:2'),
    step('The middle and ending', 'First practise D–D–D, E–G–G. Then play the opening again and finish E–D–D–E–D–C. The demonstration here combines the middle and final line.', 'Slow down before the jump from E to G.', 'D4 D4 D4:2 E4 G4 G4:2 E4 D4 C4 D4 E4 E4 E4 E4 D4 D4 E4 D4 C4:4'),
    step('Play the complete melody', 'Join the opening, middle, and ending. If one transition trips you up, repeat just the two notes around it before another full try.', 'Take a breath before you start.', 'E4 D4 C4 D4 E4 E4 E4:2 D4 D4 D4:2 E4 G4 G4:2 E4 D4 C4 D4 E4 E4 E4 E4 D4 D4 E4 D4 C4:4'),
  ], { song: 'Mary Had a Little Lamb', duration: 15 }),
  lesson('ode', 'melodies', 'A little Beethoven', 'Play the familiar opening theme of “Ode to Joy”.', 'This is a simplified melody, not the full orchestral work. Your C–G hand position is enough for this opening theme.', [
    step('Hear the opening', 'Listen for repeated notes and the gentle rise to G. Put your right hand over C–G. Hum the first phrase if it helps.', 'E · E · F · G | G · F · E · D.', 'E4 E4 F4 G4 G4 F4 E4 D4'),
    step('Practise the first half', 'Play E–E–F–G, then G–F–E–D. Use fingers 3–3–4–5, 5–4–3–2. Keep each note the same length.', 'Two little groups of four notes.', 'E4 E4 F4 G4 G4 F4 E4 D4'),
    step('Practise the answer', 'Play C–C–D–E, then E–D–D. The first E in the ending lasts one and a half beats, the following D half a beat, and the last D two beats. Listen slowly to copy that rhythm.', 'C · C · D · E | E (1½) · D (½) · D (2).', 'C4 C4 D4 E4 E4:1.5 D4:0.5 D4:2'),
    step('Play the opening theme', 'Join both halves. A half-beat note is shorter, not necessarily louder. You can practise the pitches freely before following the exact rhythm.', 'Your first Beethoven milestone: one complete opening phrase.', 'E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4:1.5 D4:0.5 D4:2'),
  ], { song: 'Ode to Joy · opening theme', duration: 15, bpm: 55 }),
  lesson('twinkle', 'melodies', 'A little reach for the stars', 'Learn “Twinkle, Twinkle, Little Star” and meet A.', 'Avoid stretching to reach A. For the opening, try thumb on C, ring finger on G, little finger on A; let your hand move naturally.', [
    step('Meet A and hear the opening', 'A is the white key immediately to the right of G. Listen to C–C–G–G–A–A–G. This melody travels farther than your five-note position.', 'The final G lasts two beats.', 'C4 C4 G4 G4 A4 A4 G4:2'),
    step('Play the opening and answer', 'Practise the opening with fingers 1–1–4–4–5–5–4 if comfortable. Then settle back into the C–G position for F–F–E–E–D–D–C.', 'Move your hand gently instead of holding a wide stretch.', 'C4 C4 G4 G4 A4 A4 G4:2 F4 F4 E4 E4 D4 D4 C4:2'),
    step('The middle section', 'Play G–G–F–F–E–E–D, holding D for two beats. Repeat that phrase. Use the familiar C–G hand position.', 'The middle is the same phrase twice.', 'G4 G4 F4 F4 E4 E4 D4:2 G4 G4 F4 F4 E4 E4 D4:2'),
    step('Put all three sections together', 'Play the opening and answer, the middle section, then the opening and answer again. Breaks between sections are fine while learning.', 'Opening → middle → opening again.', 'C4 C4 G4 G4 A4 A4 G4:2 F4 F4 E4 E4 D4 D4 C4:2 G4 G4 F4 F4 E4 E4 D4:2 G4 G4 F4 F4 E4 E4 D4:2 C4 C4 G4 G4 A4 A4 G4:2 F4 F4 E4 E4 D4 D4 C4:2'),
  ], { song: 'Twinkle, Twinkle, Little Star', duration: 15 }),
  lesson('note-map', 'melodies', 'See the bigger picture', 'Discover the repeating note alphabet and find notes in another octave.', 'An octave takes you from one letter name to the next of the same name: C to the next C, for example. They sound related, but one is higher.', [
    step('Complete the alphabet', 'After G come A and B, then the names start again at C. Say C–D–E–F–G–A–B–C while playing with any comfortable finger. This is a note map, not a scale-fingering exercise.', 'There is no H in our note alphabet.', 'C4 D4 E4 F4 G4 A4 B4 C5:2'),
    step('Find the same name elsewhere', 'Find a C to the left of middle C, then middle C, then the C to its right. We call these C3, C4, and C5. Higher numbers mean higher pitches.', 'Hear the same note family at three heights.', 'C3:2 C4:2 C5:2'),
    step('Meet a black-key name', 'The black key immediately to the right of C is C-sharp, written C♯. It can also be called D-flat, D♭. Today just find it and compare C–C♯–D.', 'Sharp means one key higher, including black keys.', 'C4:2 C#4:2 D4:2'),
    step('Move a familiar phrase up', 'Play E–D–C near middle C, then find E–D–C one octave higher. Listen to how the tune stays recognisable.', 'Same letter pattern, a different height.', 'E4:2 D4:2 C4:4 E5:2 D5:2 C5:4'),
  ]),
  lesson('c-chord', 'chords', 'Three notes, one chord', 'Discover the full, warm sound of a C-major chord.', 'A chord is a group of notes sounded together. C major uses C, E, and G. Keep your hand relaxed; accuracy can come before perfect simultaneity.', [
    step('Find the three notes', 'Place your right thumb on C, middle finger on E, and little finger on G. Play the notes separately first.', 'C · E · G. Fingers 1 · 3 · 5.', 'C4:2 E4:2 G4:2'),
    step('Play them together', 'Press C, E, and G at the same time. Hold for four beats, then release all three. Try it three times, letting your hand relax between attempts.', 'A plus sign means “play together”: C + E + G.', 'C4+E4+G4:4 -:2 C4+E4+G4:4'),
    step('Give your chord a pulse', 'Play the C chord once every two beats. Count 1–2 between presses. Keep the notes balanced instead of striking one much harder.', 'Play, hold · play, hold.', 'C4+E4+G4:2 C4+E4+G4:2 C4+E4+G4:2 C4+E4+G4:2'),
    step('Recognise the sound', 'Compare C–E–G played separately with the same notes together. Try the separate notes first and the chord second without looking at the screen.', 'You can now play your first major chord.', 'C4 E4 G4 - C4+E4+G4:4'),
  ]),
  lesson('am-f', 'chords', 'Two new colours', 'Add A minor and F major to your chord vocabulary.', 'A minor uses A–C–E. F major uses F–A–C. Major and minor have different colours; neither needs to sound happy or sad every time.', [
    step('Build A minor', 'Find A below middle C. With your right hand, try thumb on A3, middle finger on C4, little finger on E4. Play separately, then together.', 'Am = A + C + E.', 'A3 C4 E4 - A3+C4+E4:4'),
    step('Build F major', 'Find F below middle C. Place your right fingers 1–3–5 on F3–A3–C4. Play separately, then together.', 'F = F + A + C.', 'F3 A3 C4 - F3+A3+C4:4'),
    step('Move slowly between them', 'Play Am, release, and take two silent beats to move to F. Look at the destination before moving. You can take longer than the demo.', 'Am → a comfortable move → F.', 'A3+C4+E4:4 -:2 F3+A3+C4:4 -:2'),
    step('Try a three-chord journey', 'Play C major, A minor, and F major, holding each for four beats. Pause to reposition when needed. Say each chord name as you play.', 'C → Am → F.', 'C4+E4+G4:4 A3+C4+E4:4 F3+A3+C4:4'),
  ]),
  lesson('g-changes', 'chords', 'Make the changes flow', 'Add G major and practise a useful four-chord sequence.', 'This is a general chord exercise used to build pop-piano skills. It is not a transcription of either goal song.', [
    step('Meet G major', 'With your right hand, find G3–B3–D4. Use fingers 1–3–5 if comfortable. Play the three notes separately, then together.', 'G = G + B + D.', 'G3 B3 D4 - G3+B3+D4:4'),
    step('Move from C to G', 'Play C major for four beats, then release and find G major. Practise the move without a metronome first. Repeat with a steady pulse when ready.', 'Give your eyes time to find the next shape.', 'C4+E4+G4:4 -:2 G3+B3+D4:4 -:2'),
    step('Four chords, slowly', 'Try C–G–Am–F. Hold each for four beats. Keep the pace slow enough that you can find the next shape without tensing your wrist.', 'C → G → Am → F.', 'C4+E4+G4:4 G3+B3+D4:4 A3+C4+E4:4 F3+A3+C4:4'),
    step('Repeat with a steady pulse', 'Loop the demonstration and practise the four-chord sequence. Aim for two relaxed rounds. If a change is difficult, practise only that pair.', 'A clean change at 40 BPM is progress.', 'C4+E4+G4:4 G3+B3+D4:4 A3+C4+E4:4 F3+A3+C4:4'),
  ], { bpm: 50 }),
  lesson('broken-chords', 'chords', 'Let your chords ripple', 'Play chord notes one after another: the start of a flowing accompaniment.', 'A broken chord uses the same notes as a chord, played separately. “Arpeggio” is another word you will hear for chord notes played in sequence.', [
    step('Open up a C chord', 'Play C–E–G–E with fingers 1–3–5–3. Give each note one beat. Use the same relaxed position as your C-major chord.', 'C · E · G · E.', 'C4 E4 G4 E4 C4 E4 G4 E4'),
    step('Try A minor', 'Move to A3–C4–E4. Play A–C–E–C with fingers 1–3–5–3. Keep all four notes evenly spaced.', 'A · C · E · C.', 'A3 C4 E4 C4 A3 C4 E4 C4'),
    step('Try F and G', 'Play F–A–C–A, then G–B–D–B. Release and reposition between patterns. Add a pause if that makes the transition more comfortable.', 'F · A · C · A | G · B · D · B.', 'F3 A3 C4 A3 G3 B3 D4 B3'),
    step('Make a flowing little loop', 'Join C, Am, F, and G broken chords. Loop slowly. This original exercise prepares you for flowing pop accompaniments, including the kind of coordination you will need for Adele.', 'Even notes first; speed can come later.', 'C4 E4 G4 E4 A3 C4 E4 C4 F3 A3 C4 A3 G3 B3 D4 B3'),
  ], { bpm: 50, duration: 15 }),
  lesson('chord-play', 'chords', 'Make a little music of your own', 'Play with four familiar chords and make your own short accompaniment.', 'Start with your right hand only. For these root-position chords, try fingers 1–3–5. Move your hand between shapes instead of stretching. Open the chord playground to experiment, then return here to save each checkpoint.', [
    step('Choose your chord colours', 'Open the chord playground and select C, Am, F, and G in turn. Find the highlighted notes on your Casio, then play each chord with your right thumb, middle finger, and little finger. Pick two chords whose sounds you enjoy together.', 'Try C → Am first. Hear the difference, then make your own choice.', 'C4+E4+G4:4 A3+C4+E4:4', { task: 'I explored the four chord shapes' }),
    step('Build a four-chord story', 'In the playground, choose a chord for each of the four bars. A bar here is a group of four beats. Try C–G–Am–F, then change the order. Select “Hold the chord” and play each shape for four beats. Pauses to find the next shape are fine.', 'Try the same four chords in a new order. Which ending do you prefer?', 'C4+E4+G4:4 G3+B3+D4:4 A3+C4+E4:4 F3+A3+C4:4', { task: 'I chose and played my own four-bar sequence' }),
    step('One sequence, two different feels', 'Keep your chosen chord order. Try “Give it a pulse”: press each chord on beats 1 and 3. Then try “Let it ripple”: play the lowest, middle, highest, and middle notes separately. Practise one chord at a time before joining the sequence.', 'The chord notes stay the same; the rhythm and movement change.', 'C4 E4 G4 E4 G3 B3 D4 B3 A3 C4 E4 C4 F3 A3 C4 A3', { task: 'I tried pulsing and broken chords' }),
    step('Your mini performance', 'Choose the playing style you enjoyed most. Play your four-bar sequence twice, beginning softly and finishing on a held chord. You can hum a little tune over it if you like. The demonstration is an example; your own chord order is welcome.', 'Your playground sequence and speed save automatically. Come back and make another version anytime.', 'C4+E4+G4:4 G3+B3+D4:4 A3+C4+E4:4 F3+A3+C4:4 C4+E4+G4:4', { task: 'I played a short piece of my own' }),
  ], { bpm: 50, duration: 15 }),
  lesson('left-hand', 'hands', 'Hello, left hand', 'Build confidence with simple low notes before combining hands.', 'The left thumb is still finger 1. In a left-hand C–G position, little finger 5 plays C and thumb 1 plays G.', [
    step('Find a lower C', 'Find C3, one octave below middle C. Place your left little finger on it. Play C three times, leaving your wrist relaxed.', 'Left hand, finger 5, lower C.', 'C3:2 C3:2 C3:2'),
    step('Five notes in the left hand', 'Place left fingers 5–4–3–2–1 on C3–D3–E3–F3–G3. Play up and back down slowly.', 'The finger numbers decrease as the notes rise.', 'C3 D3 E3 F3 G3 F3 E3 D3 C3:2'),
    step('Practise bass-note moves', 'Use any comfortable left-hand fingers to play C3, G3, A3, F3. Hold each for four beats. Move your whole hand when needed.', 'These are the root notes of C, G, Am, and F.', 'C3:4 G3:4 A3:4 F3:4'),
    step('Keep a slow left-hand pulse', 'Repeat the bass-note sequence twice with the metronome at 50. Press each note on beat 1 and hold through beat 4.', 'One note per four clicks.', 'C3:4 G3:4 A3:4 F3:4 C3:4 G3:4 A3:4 F3:4'),
  ], { bpm: 50 }),
  lesson('together', 'hands', 'Two hands, one small step', 'Let your hands meet with one note each.', 'Practise each hand alone before joining them. Coordination is a new skill, not a test of how musical you are.', [
    step('Prepare each hand', 'Put left little finger on C3 and right thumb on C4. Play left C, then right C, alternating slowly.', 'Low C · middle C · low C · middle C.', 'C3:2 C4:2 C3:2 C4:2'),
    step('Land together', 'Press both Cs at the same time, hold for two beats, and release together. Repeat with a short rest between attempts.', 'One key per hand. One shared start.', 'C3+C4:2 -:2 C3+C4:2 -:2'),
    step('Hold left, move right', 'Hold left C3 for four beats. While it stays down, play right C4, D4, E4, D4, one per beat. The demo retriggers the bass at the beginning only.', 'Left: hold C. Right: C · D · E · D.', 'C3+C4 D4 E4 D4', { bass: 'C3' }),
    step('Repeat your first two-hand phrase', 'Try the same four-beat pattern twice. Release both hands between rounds. If needed, return to separate hands, then try together again.', 'Aim for two comfortable rounds, however slowly.', 'C3+C4 D4 E4 D4', { bass: 'C3' }),
  ], { bpm: 50, duration: 15 }),
  lesson('bass-chords', 'hands', 'A fuller piano sound', 'Pair a left-hand bass note with a right-hand chord.', 'Move the bass note and chord separately first, then coordinate their start. Avoid holding a wide stretch between chord shapes.', [
    step('Build a full C sound', 'Play C3 with your left hand and C4–E4–G4 together with your right. Hold for four beats. Release and repeat.', 'Left: C. Right: C major.', 'C3+C4+E4+G4:4 -:2 C3+C4+E4+G4:4'),
    step('Add A minor', 'Play A3 with the left hand and A4–C5–E5 with the right. Take time to find the new position. Play both hands together for four beats.', 'Left: A. Right: A minor.', 'A3+A4+C5+E5:4 -:2 A3+A4+C5+E5:4'),
    step('Explore F and G', 'For F, use left F3 and right F4–A4–C5. For G, use left G3 and right G4–B4–D5. Try each separately before moving between them.', 'A single low note supports each full chord.', 'F3+F4+A4+C5:4 -:2 G3+G4+B4+D5:4'),
    step('Your first accompaniment', 'Play C–Am–F–G using a left root and right chord. The hands move to matching letter roots. Leave extra time between changes if needed.', 'One chord per four beats. Feel how much sound two hands can make.', 'C3+C4+E4+G4:4 A3+A4+C5+E5:4 F3+F4+A4+C5:4 G3+G4+B4+D5:4'),
  ], { bpm: 45, duration: 15 }),
  lesson('hands-flow', 'hands', 'Hold the ground, let it flow', 'Support a broken chord with a sustained bass note.', 'The left hand holds while the right moves. You can first tap the two hand roles on your knees before trying the keys.', [
    step('Practise the right-hand pattern', 'Play C4–E4–G4–E4 in the right hand. Repeat slowly until you can think about the pattern instead of searching for each key.', 'Right: 1 · 3 · 5 · 3.', 'C4 E4 G4 E4 C4 E4 G4 E4'),
    step('Add one held bass note', 'Press left C3 with the first right C4. Hold left C3 while the right hand continues E4–G4–E4. Release after four beats.', 'Left stays down; right keeps moving.', 'C3+C4 E4 G4 E4', { bass: 'C3' }),
    step('Try the same idea on F', 'Hold left F3. With the right hand, play F4–A4–C5–A4. Practise this shape alone before moving from C.', 'Same rhythm, different chord notes.', 'F3+F4 A4 C5 A4', { bass: 'F3' }),
    step('Switch after a breathing space', 'Play one C pattern, rest and find F, then play one F pattern. For this transition drill, the demo uses shorter bass notes. On your keyboard, hold each bass through its four-note pattern.', 'C pattern → pause → F pattern.', 'C3+C4 E4 G4 E4 -:2 F3+F4 A4 C5 A4'),
  ], { bpm: 45, duration: 15 }),
  lesson('scientist-prep', 'songs', 'The Scientist: build the foundation', 'Practise measured chords and steady changes for your Coldplay goal.', 'This is an original preparation exercise, not the melody or actual chord arrangement of “The Scientist”. A beginner arrangement is the next bridge to the song.', [
    step('Listen for the job of the piano', 'Play a recording of “The Scientist” from your own music service if available. Listen to how repeating piano chords support the voice. Then hear our short original chord drill below.', 'Notice the steady accompaniment. You do not need to copy it yet.', 'C4+E4+G4:2 C4+E4+G4:2 A3+C4+E4:2 A3+C4+E4:2'),
    step('Repeat a chord without rushing', 'Play a C chord on beats 1 and 3 of a four-beat count. Keep the two presses equal in volume. Repeat with Am.', 'Count 1–2–3–4. Play on 1 and 3.', 'C4+E4+G4:2 C4+E4+G4:2 A3+C4+E4:2 A3+C4+E4:2'),
    step('Change the shape on time', 'Practise C–Am–F–G, playing each chord twice. This general progression is a technique drill, not the song’s progression. Slow down at the hardest transition.', 'Two presses per chord, no hurry between shapes.', 'C4+E4+G4:2 C4+E4+G4:2 A3+C4+E4:2 A3+C4+E4:2 F3+A3+C4:2 F3+A3+C4:2 G3+B3+D4:2 G3+B3+D4:2'),
    step('Make it sound like a phrase', 'Play the drill softly once, then a little fuller. Keep the tempo the same. Your milestone is a steady accompaniment pattern you can repeat comfortably.', 'Feel the phrase, keep the pulse.', 'C4+E4+G4:2 C4+E4+G4:2 A3+C4+E4:2 A3+C4+E4:2 F3+A3+C4:2 F3+A3+C4:2 G3+B3+D4:2 G3+B3+D4:2'),
  ], { bpm: 50, goal: 'scientist', duration: 15 }),
  lesson('scientist-both', 'songs', 'Coldplay goal: add depth', 'Bring a bass note into a steady chord accompaniment.', 'Your goal is comfortable coordination. These original drills build song skills; they do not count as learning the complete Coldplay song.', [
    step('Revisit bass plus chord', 'Play left C3 with right C4–E4–G4. Hold for four beats and release. Then do the same with F3 and F4–A4–C5.', 'Start both hands together.', 'C3+C4+E4+G4:4 F3+F4+A4+C5:4'),
    step('Repeat the right-hand chord', 'For this drill, press the left root and right chord together on beats 1 and 3. Once that feels comfortable, try holding the left note through all four beats while repeating only the right chord.', 'First coordinate the starts; then experiment with a held bass.', 'C3+C4+E4+G4:2 C3+C4+E4+G4:2 F3+F4+A4+C5:2 F3+F4+A4+C5:2'),
    step('Build a four-chord accompaniment', 'Try C–Am–F–G with both hands, one press per four beats. Use the highlighted keys as a map. Work on a single change if the whole loop feels too much.', 'Keep the left hand simple and the tempo gentle.', 'C3+C4+E4+G4:4 A3+A4+C5+E5:4 F3+F4+A4+C5:4 G3+G4+B4+D5:4'),
    step('Choose your next song step', 'Try two comfortable rounds. Then use a beginner arrangement of “The Scientist” that you own or can legally access. Start with only its first two chords, checking its key and fingering rather than assuming this drill matches.', 'You have built a foundation for learning the real arrangement.', 'C3+C4+E4+G4:4 A3+A4+C5+E5:4 F3+F4+A4+C5:4 G3+G4+B4+D5:4'),
  ], { bpm: 45, goal: 'scientist', duration: 15 }),
  lesson('adele-prep', 'songs', 'Someone Like You: find the flow', 'Build even, repeating broken chords for your Adele goal.', 'This original white-key exercise develops the motion of a flowing accompaniment. It is not a transcription or the original key of “Someone Like You”.', [
    step('Hear a repeating shape', 'Listen to our C–E–G–E pattern. If you listen to “Someone Like You” separately, notice the flowing repeated accompaniment underneath the voice. Focus on the feeling of even notes.', 'Our drill: one gentle note on each beat.', 'C4 E4 G4 E4 C4 E4 G4 E4'),
    step('Keep four notes even', 'Play C–E–G–E repeatedly with fingers 1–3–5–3. Keep your thumb from landing noticeably louder. Stop and relax between rounds.', 'An even sound matters more than speed.', 'C4 E4 G4 E4 C4 E4 G4 E4'),
    step('Move the repeating pattern', 'Play C–E–G–E, then A–C–E–C below it. Practise the move without the metronome before adding a slow pulse.', 'C pattern → Am pattern.', 'C4 E4 G4 E4 A3 C4 E4 C4'),
    step('Find a comfortable flow', 'Join C, Am, F, and G broken chords. This is an original practice progression. Loop it slowly, then try without looking at the screen for the first pattern.', 'Let each four-note shape feel familiar.', 'C4 E4 G4 E4 A3 C4 E4 C4 F3 A3 C4 A3 G3 B3 D4 B3'),
  ], { bpm: 50, goal: 'adele', duration: 15 }),
  lesson('adele-both', 'songs', 'Adele goal: bring it together', 'Add a held bass note and finish with a personal practice plan.', 'Finishing this course means you have practised the foundations. It does not mean you must play an entire pop arrangement yet. Revisit any step whenever you need.', [
    step('Start with one chord and two hands', 'Hold left C3 for four beats while the right plays C4–E4–G4–E4. Try it twice, resting between rounds.', 'One held bass; four even right-hand notes.', 'C3+C4 E4 G4 E4', { bass: 'C3' }),
    step('Try an A-minor shape', 'Hold left A3. Play right A4–C5–E5–C5. Work on this shape alone first. Give yourself time to position both hands.', 'Let the left hand stay quiet while the right moves.', 'A3+A4 C5 E5 C5', { bass: 'A3' }),
    step('Make your own short performance', 'Choose either our C pattern or Am pattern. Play it four times with a steady, comfortable pulse. Start gently and finish deliberately. You can loop this C demonstration or revisit the previous step for Am.', 'One simple pattern played with care is music.', 'C3+C4 E4 G4 E4', { bass: 'C3' }),
    step('Your next chapter', 'Choose a beginner arrangement of “Someone Like You” that you own or can legally access. Begin with one small right-hand pattern, then its bass note. Use the same listen → separate hands → combine → repeat approach. Keep revisiting the drills that help.', 'Celebrate: you have explored notes, rhythm, tunes, chords, and both hands.', 'C4 E4 G4 E4 C4+E4+G4:4', { task: 'Finish the foundations course' }),
  ], { bpm: 45, goal: 'adele', duration: 15 }),
];

export const getLesson = id => lessons.find(l => l.id === id);
export const totalCheckpoints = lessons.reduce((sum, l) => sum + l.steps.length, 0);
