const modes = {
  reference: {
    label: 'Practise with the song reference',
    instruction: 'Use the linked score for the actual song melody. Follow the location and task below, then practise on your Casio. The song melody is in the reference, not in an in-app note demo.',
    button: 'Open the song score', completion: 'I met this checkpoint — continue',
    doneWhen: 'Use the specific checkpoint goal below. You decide when you have met it; opening the reference alone does not complete a playing task.',
    next: 'Open the reference → find the marked section → practise → save your checkpoint',
  },
  guided: {
    label: 'Follow the shown notes',
    instruction: 'The keys are provided. Hear the example if helpful, then read the note names and play slowly on your Casio. You do not need to work out notes by ear.',
    button: 'Play the example', completion: 'I practised this — continue',
    doneWhen: 'Continue when you have tried the shown notes comfortably, even with pauses. You do not have to match the recording’s speed.',
    next: 'Hear the example → read the notes → try on your keyboard',
  },
  listen: {
    label: 'Listen only',
    instruction: 'Just hear the example once. No playing, naming notes, or guessing keys is required at this checkpoint.',
    button: 'Play the example', completion: 'I’ve listened — continue',
    doneWhen: 'After listening once, you can continue. The next checkpoint gives you the keys and fingers to practise.',
    next: 'Listen now → practise with the shown notes in the next checkpoint',
  },
  explore: {
    label: 'Explore your keyboard',
    instruction: 'Follow the task on your Casio. The sound example is optional; you are not being asked to identify notes by ear.',
    button: 'Hear an optional example', completion: 'I tried this — continue',
    doneWhen: 'Continue after you have tried the setup or key-finding task described above.',
    next: 'Read the task → try it on your Casio → continue when ready',
  },
  rhythm: {
    label: 'Tap a steady beat',
    instruction: 'Start the metronome here, listen for a few clicks, then tap along. You do not need to play any keys in this checkpoint.',
    button: 'Start the metronome', completion: 'I tapped along — continue',
    doneWhen: 'Try four groups of four taps at a comfortable speed. Stop the metronome, then continue when ready.',
    next: 'Hear the clicks → tap 1–2–3–4 → repeat',
  },
  ear: {
    label: 'Try by ear · a later skill',
    instruction: 'Here, finding notes from sound is the task. The answers start hidden. Listen, try a small guess, then use a hint or reveal the answer whenever you like.',
    button: 'Play the mystery', completion: 'I explored and checked — continue',
    doneWhen: 'Make an attempt, then compare with the answer. Using hints or revealing it is part of learning; you do not need a perfect match to continue.',
    next: 'Listen → try a small guess → reveal and compare',
  },
};

export function stepGuidance(step) { return modes[step.mode] || modes.guided; }
export function hideEarAnswer(step, revealed = false) { return step?.mode === 'ear' && !revealed; }
export function visiblePattern(step, revealed = false) { return hideEarAnswer(step, revealed) ? [] : step.pattern; }
