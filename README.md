# Little Keys

A calm, playful keyboard-learning companion for a beginner with a Casio CT-X870IN and a laptop. No cables, account, microphone, or package installation are required. Song-reference links open external teaching resources when chosen.

## Live website

Open **https://sankalp.is-a.dev/little-keys/**. GitHub Pages uses the account's existing custom domain and deploys `main` through a GitHub Actions workflow. Checkpoint-compatibility and audio tests must pass before a new version can replace the live site. The default GitHub Pages address, https://sankalpsharma7.github.io/little-keys/, redirects to this domain.

The website works without running the local server. To transfer your existing practice progress, export a backup from the local app and import it on the live website. Each browser and website origin keeps its own progress.

## Run

On this Mac, double-click **Start Little Keys.command** in Finder. It opens the app in your default browser. Keep its terminal window open while practising; close it when finished. If the app is already running, the launcher reuses it.

With Node.js 18 or later installed:

```sh
npm start
```

Open **http://localhost:5173** in your browser. Keep using the same browser and address so your saved progress stays available. The server is bound to your own computer (127.0.0.1).

## Included

- 43 lessons in 9 chapters, with 4 individually saved checkpoints per lesson (172 total). All 168 previously published checkpoints retain their identities, content and positions within their lessons.
- Clear checkpoint modes distinguish listening only, playing the supplied notes, keyboard exploration, rhythm tapping, and later ear training. Playback is beside the task; hand positions, note-reading help, and completion instructions explain what to do next.
- A final “Work out a tiny tune by ear” lesson progresses from hearing pitch direction to finding a short song phrase. Answers and playback key highlights stay hidden until revealed; reference notes and optional hints support self-checking.
- A chord playground for C, Am, F, and G, with note/finger guides, a custom four-bar sequence, held/pulsing/broken-chord playback, speed control, and looping. Chord choices and settings are included in progress backups.
- Five chord lessons, including “Make a little music of your own,” with links between the lesson checkpoints and the playground.
- Basic keyboard orientation, finger numbers, note names, rhythm, expression, melodies, chords, and both-hand coordination.
- Traditional melodies and a simplified Beethoven theme: Hot Cross Buns, Mary Had a Little Lamb, Twinkle Twinkle Little Star, and the opening of Ode to Joy.
- A self-contained eleven-lesson Scientist accompaniment path (`#scientist`): the three existing chord/coordination lessons plus eight lessons covering introduction, verses, chorus, transitions, voice coordination, outro and a complete beginner performance. Forty-four checkpoints include in-app audio and supplied keys. Earlier melody-with-score lessons remain optional and keep their saved progress. Adele retains its original preparation exercises.
- Synthesized audio guides, a highlighted preview keyboard (C3–B5), adjustable 40–100 BPM playback, looping, and a metronome.
- Self-assessed checkpoint completion, resume, a quick recap, easier-practice suggestions, and a practice-again list.
- Local progress storage and validated JSON backup export/import. A confirmation screen appears before an import replaces current progress.
- Responsive layout, keyboard-operable controls, and reduced-motion support. External resources load only when the learner opens their links.

The app does not detect playing or evaluate technique. Demonstration audio is a simple synthesized reference tone, not a recording of a piano. Practice time measures time the practice page is visible, not actual time playing.

## Progress and backups

Progress is saved in browser local storage under `little-keys.progress.v1`. Each completed checkpoint, current step, review marker, and lesson tempo is saved. Closing and reopening the app in the same browser resumes the saved checkpoint. Clearing browser data, changing browsers, or changing the app's origin can make that progress unavailable. Use **Your progress → Export backup** to preserve it, and **Import backup** to restore it.

Unreadable saved data is not automatically overwritten. If saving is unavailable or fails, the app displays a warning and offers backup export.

## Scientist path and scope

Open **Song collection → The Scientist** or `#scientist`. The main path teaches a complete beginner **accompaniment**, played with left-hand bass and right-hand chords. It does not teach or reproduce the vocal melody on the keyboard. Singing/humming from memory is optional. All eleven lessons have in-app practice examples; no external score or video is required for this route.

The focused **Intro into the first verse** lesson (`#lesson/scientist-play-first-minute/0`) supplies the repeating right-hand chord pulse, a choice of held or half-beat repeated bass, the entrance into the vocal section, and a twenty-bar joined run. That run uses three intro rounds plus two vocal-passage rounds and lasts about 63 seconds at 76 BPM (96 seconds at the default 50 BPM), excluding the count-in. Duration labels follow the selected range and speed. Presets at 50, 60 and 76 BPM support gradual practice. It is a simplified keyboard accompaniment without vocal audio, decorative fills or automatic recording synchronisation. The earlier whole-song beginner form retains its shorter introduction and all original checkpoints.

The performance contains introduction, verse one, chorus, instrumental link, verse two, returning chorus, outro and final release. It uses a 91-bar practice form, fixed repeat counts, uniform chord pulses and a held ending. This is deliberately not an exact studio transcription or a recording-synchronised backing track. Section buttons select practice ranges, the hand selector isolates either part, and a four-beat count-in helps the learner enter. New performance checkpoints start with looping off so the ending can finish. Each lesson can take multiple 10–15 minute sessions.

Source checks for chord vocabulary and broad section order:

- [Pianote / Lisa Witt tutorial](https://blog.pianote.com/coldplay-the-scientist/)
- [Pianote-hosted lead sheet](https://pianote.s3.amazonaws.com/blog/pdf/The-Scientist-Lead-Sheet.pdf)

Only chord facts and high-level form inform the new path; instructional prose and uniform exercises are written for this app. No source score, lyrics, recording or vocal melody are bundled. The earlier six score-based lessons remain accessible under an optional chapter and disclosure on the song overview. They retain their original task content and external links.

## Safe curriculum updates

Existing lesson IDs and the order/meaning of their checkpoints are a compatibility contract. Add new material under new IDs; do not repurpose a previously completed checkpoint. Storage stays on `little-keys.progress.v1` at the existing website origin. Adding lessons can reduce the percentage while leaving the completed count unchanged.

`tests/fixtures/published-checkpoints-v1.json` freezes the original 26 lessons and 104 checkpoints. `published-checkpoints-v2.json` additionally freezes the complete content of all 35 lessons published before the accompaniment extension. Tests round-trip all 140 existing resume points, completion lists, review markers and tempos; a completed checkpoint never turns into a different task. `published-checkpoints-v3.json` additionally records SHA-256 digests of all 42 previously published lesson step arrays, with preservation tests for all 168 resume positions. New material uses new IDs. Lesson numbers may shift, but saves use IDs, not lesson numbers. Do not regenerate this fixture to make a breaking edit pass. Any incompatible change needs an explicit data migration and preservation tests first.

Install the local pre-push guard once after cloning:

```sh
git config core.hooksPath .githooks
```

The hook runs tests against the exact local commits being pushed. GitHub Actions independently tests each commit before publishing. The deployment artifact contains only runtime assets, not tests, backups, or development scripts. A failed check keeps the previous website live.

## Verify

```sh
npm test
```

The dependency-free tests cover partial-lesson persistence, idempotent completion, lesson advancement, out-of-order checkpoints, the full course endpoint, invalid imports, unavailable storage, curriculum note range, and audio scheduling math.

## Files

- `curriculum.js`: lesson content and demonstration patterns.
- `scientist-accompaniment.js`: the self-contained accompaniment path, chord voicings, practice form and new lessons.
- `scientist.js`, `song-view.js`, `song.css`: preserved score-route lessons, overview, chord finder and section practice UI.
- `song-audio.js`: independently timed left/right notes, selected bar ranges, and hand filtering.
- `state.js`: progress data, validation, and persistence.
- `audio.js`: Web Audio synthesis, looping, and metronome.
- `app.js`: screens, interactions, and routing.
- `lesson-guidance.js`, `lesson-view.js`, `lesson.css`: task instructions, ear-answer visibility, and the lesson interface.
- `styles.css`: responsive interface.
- `server.mjs`: local static server.
