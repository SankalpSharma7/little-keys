import { chords, getChord, styles } from './chords.js';

export function playgroundPage({ title, icon, keyboard, config, returnToLesson }) {
  const chord = getChord(config.selected);
  return `${title('FOUR CHORDS. SO MANY POSSIBILITIES.', 'Your chord playground.', 'Hear a shape, find it on your Casio, and make a little music of your own.')}
    <div class="playground-intro"><span>${icon('leaf')} Start with one hand. Take as much time as you need.</span><a class="text-button" href="#lesson/${returnToLesson.lessonId}/${returnToLesson.step}">Return to your lesson ${icon('arrow')}</a></div>
    <div class="playground-layout"><section class="chord-explorer">
      <div class="section-heading"><h2>Meet your four chords</h2><span class="tag">Right hand</span></div>
      <div class="chord-choices">${chords.map(c => `<button class="chord-choice ${c.id === config.selected ? 'selected' : ''}" data-action="choose-chord" data-id="${c.id}" aria-pressed="${c.id === config.selected}"><strong>${c.id}</strong><span>${c.name}</span></button>`).join('')}</div>
      <div class="chord-guide"><div class="eyebrow">FIND THESE THREE NOTES</div><h2 id="chord-name">${chord.name}</h2><p id="chord-description">${chord.description}</p><div id="finger-guide" class="finger-guide">${fingerGuide(chord)}</div><p class="finger-hint">1 = thumb · 3 = middle finger · 5 = little finger</p><button class="button secondary" id="chord-hear" data-action="hear-chord">${icon('volume')} Hear this chord</button></div>
      <div class="playground-piano">${keyboard()}<div class="keyboard-caption"><span>Purple keys = chord notes · C4 = middle C</span><span>Click any key to hear it</span></div></div>
      <p class="playground-footnote">These are three-note chords in their simplest order, called root position. Notes shown match the chord lessons. The guide cannot hear your playing.</p>
    </section><section class="sequence-builder">
      <div class="section-heading"><h2>Make it your own</h2><span class="tag">4 bars</span></div><p class="builder-description">Choose one chord per bar. Each bar lasts four beats. Repeat a chord or change the order—this is your space to explore.</p>
      <div class="sequence-slots">${config.sequence.map((id, i) => `<div class="sequence-slot" data-bar="${i}"><label for="chord-bar-${i}">BAR ${i + 1}</label><select id="chord-bar-${i}" data-chord-bar="${i}" aria-label="Chord for bar ${i + 1}">${chords.map(c => `<option value="${c.id}" ${id === c.id ? 'selected' : ''}>${c.id}</option>`).join('')}</select><span>1 · 2 · 3 · 4</span></div>`).join('')}</div>
      <div class="style-heading">Try a playing style</div><div class="chord-styles">${styles.map(s => `<button data-action="chord-style" data-id="${s.id}" aria-pressed="${config.style === s.id}" class="chord-style ${config.style === s.id ? 'selected' : ''}"><span class="style-dot"></span><span><strong>${s.name}</strong><small>${s.hint}</small></span></button>`).join('')}</div>
      <div class="playground-tempo"><label for="chord-tempo">Take it slowly <strong id="chord-tempo-value">${config.bpm} BPM</strong></label><input id="chord-tempo" type="range" min="40" max="100" step="5" value="${config.bpm}" aria-label="Chord playground speed in beats per minute"></div>
      <div class="sequence-controls"><button id="chord-play" class="button primary" data-action="play-chords">${icon('play')} Play my sequence</button><button id="chord-loop" class="button secondary" data-action="chord-loop" aria-pressed="${config.loop}">${icon('loop')} Loop ${config.loop ? 'on' : 'off'}</button></div><div id="chord-playing" class="sequence-status" role="status">Ready when you are. Listen once, then try on your Casio.</div>
      <div class="playground-saved">${icon('save')} Your chord order, style, and speed save automatically.</div>
    </section></div>
    <section class="chord-challenges"><div class="section-heading"><h2>A little invitation to experiment</h2><a class="text-button" href="#lesson/chord-play/0">Open the guided lesson ${icon('arrow')}</a></div><div class="challenge-grid"><article><span>01</span><h3>Change the ending</h3><p>Keep your first three bars. Change just the last chord. Which ending feels most settled to you?</p></article><article><span>02</span><h3>Same notes, a new feel</h3><p>Keep your chord order. Compare held chords with the ripple pattern. Try both slowly on your keyboard.</p></article><article><span>03</span><h3>Make it a tiny performance</h3><p>Play your sequence twice. Start softly, grow a little, and let the last chord ring. Hum along if you like.</p></article></div></section>`;
}

export function fingerGuide(chord) {
  return chord.notes.map((note, i) => `<div><span>${[1, 3, 5][i]}</span><strong>${note[0]}<small>${note.slice(1)}</small></strong><small>${['Thumb', 'Middle', 'Little finger'][i]}</small></div>`).join('');
}
