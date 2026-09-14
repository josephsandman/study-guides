export function shuffle(items) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function inSection(question, section) {
  return section === 'all' || question.section === section;
}

export function count(n, noun) {
  return `${n} ${noun}${n === 1 ? '' : 's'}`;
}
