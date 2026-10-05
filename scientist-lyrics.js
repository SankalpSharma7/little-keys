// Supplied lyrics are aligned to this beginner accompaniment by phrase.
export const vocalSections = { 'verse-one': { spans: [2,2,1,1,2,1,1,2,1,1,2], lines: [] } };
vocalSections['verse-one'].lines.push(
  'Come up to meet you, tell you I’m sorry',
  'You don’t know how lovely you are',
  'I had to find you',
  'Tell you I need you'
);
vocalSections['verse-one'].lines.push(
  'Tell you I set you apart',
  'Tell me your secrets',
  'And ask me your questions',
  'Oh, let’s go back to the start'
);
vocalSections['verse-one'].lines.push(
  'Running in circles',
  'Coming up tails',
  'Heads on a science apart'
);
vocalSections['chorus-one'] = { spans: [2,2,2,2,2], lines: [] };
vocalSections['chorus-one'].lines.push(
  'Nobody said it was easy',
  'It’s such a shame for us to part',
  'Nobody said it was easy'
);
vocalSections['chorus-one'].lines.push(
  'No one ever said it would be this hard',
  'Oh, take me back to the start'
);
vocalSections['verse-two'] = { spans: [1,1,2,1,1,2,1,1,2,1,1,2], lines: [] };
vocalSections['verse-two'].lines.push(
  'I was just guessing',
  'At numbers and figures',
  'Pulling the puzzles apart',
  'Questions of science'
);
vocalSections['verse-two'].lines.push(
  'Science and progress',
  'Do not speak as loud as my heart',
  'Tell me you love me',
  'Come back and haunt me'
);
vocalSections['verse-two'].lines.push(
  'Oh, and I rush to the start',
  'Running in circles',
  'Chasing our tails',
  'Coming back as we are'
);
vocalSections['chorus-two'] = { spans: [2,2,2,2,2], lines: [] };
vocalSections['chorus-two'].lines.push(
  'Nobody said it was easy',
  'Oh, it’s such a shame for us to part',
  'Nobody said it was easy'
);
vocalSections['chorus-two'].lines.push(
  'No one ever said it would be so hard',
  'I’m going back to the start'
);

export function lyricCues(study) {
  return (study.sections || []).flatMap(section => {
    const guide = vocalSections[section.id];
    if (!guide) return [];
    if (guide.lines.length !== guide.spans.length || guide.spans.reduce((sum, bars) => sum + bars, 0) !== section.bars.length) {
      throw new Error('The Scientist lyric phrases no longer match the accompaniment bars.');
    }
    let from = section.from;
    return guide.lines.map((text, index) => {
      const to = from + guide.spans[index] - 1;
      const cue = { text, from, to, sectionId: section.id, sectionName: section.name };
      from = to + 1;
      return cue;
    });
  });
}

export function lyricAtBar(study, bar) {
  const section = study.sections?.find(part => bar >= part.from && bar <= part.to);
  return {
    section,
    cue: lyricCues(study).find(line => bar >= line.from && bar <= line.to),
    chord: study.bars[bar],
  };
}
