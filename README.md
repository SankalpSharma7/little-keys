# Little Keys

A calm, playful piano-learning companion for a beginner with a Casio CT-X870IN and a laptop. No cables, account, microphone, external assets, or package installation are required.

## Live website

Open **https://sankalp.is-a.dev/little-keys/**. GitHub Pages uses the account's existing custom domain and serves the app directly from the `main` branch; future pushes to `main` update the live website automatically. The default GitHub Pages address, https://sankalpsharma7.github.io/little-keys/, redirects to this domain.

The website works without running the local server. To transfer your existing practice progress, export a backup from the local app and import it on the live website. Each browser and website origin keeps its own progress.

## Run

On this Mac, double-click **Start Little Keys.command** in Finder. It opens the app in your default browser. Keep its terminal window open while practising; close it when finished. If the app is already running, the launcher reuses it.

With Node.js 18 or later installed:

```sh
npm start
```

Open **http://localhost:5173** in your browser. Keep using the same browser and address so your saved progress stays available. The server is bound to your own computer (127.0.0.1).

## Included

- 25 lessons in 6 chapters, with 4 individually saved checkpoints per lesson (100 total).
- A chord playground for C, Am, F, and G, with note/finger guides, a custom four-bar sequence, held/pulsing/broken-chord playback, speed control, and looping. Chord choices and settings are included in progress backups.
- Five chord lessons, including “Make a little music of your own,” with links between the lesson checkpoints and the playground.
- Basic keyboard orientation, finger numbers, note names, rhythm, expression, melodies, chords, and both-hand coordination.
- Traditional melodies and a simplified Beethoven theme: Hot Cross Buns, Mary Had a Little Lamb, Twinkle Twinkle Little Star, and the opening of Ode to Joy.
- Original preparation exercises for the skills needed to approach The Scientist and Someone Like You. Full arrangements of those two songs are not included.
- Synthesized audio guides, a highlighted preview keyboard (C3–B5), adjustable 40–100 BPM playback, looping, and a metronome.
- Self-assessed checkpoint completion, resume, a quick recap, easier-practice suggestions, and a practice-again list.
- Local progress storage and validated JSON backup export/import. A confirmation screen appears before an import replaces current progress.
- Responsive layout, keyboard-operable controls, reduced-motion support, and no third-party network requests.

The app does not detect playing or evaluate technique. Demonstration audio is a simple synthesized reference tone, not a recording of a piano. Practice time measures time the practice page is visible, not actual time playing.

## Progress and backups

Progress is saved in browser local storage under `little-keys.progress.v1`. Each completed checkpoint, current step, review marker, and lesson tempo is saved. Closing and reopening the app in the same browser resumes the saved checkpoint. Clearing browser data, changing browsers, or changing the app's origin can make that progress unavailable. Use **Your progress → Export backup** to preserve it, and **Import backup** to restore it.

Unreadable saved data is not automatically overwritten. If saving is unavailable or fails, the app displays a warning and offers backup export.

## Verify

```sh
npm test
```

The dependency-free tests cover partial-lesson persistence, idempotent completion, lesson advancement, out-of-order checkpoints, the full course endpoint, invalid imports, unavailable storage, curriculum note range, and audio scheduling math.

## Files

- `curriculum.js`: lesson content and demonstration patterns.
- `state.js`: progress data, validation, and persistence.
- `audio.js`: Web Audio synthesis, looping, and metronome.
- `app.js`: screens, interactions, and routing.
- `styles.css`: responsive interface.
- `server.mjs`: local static server.
