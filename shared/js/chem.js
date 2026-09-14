import { el } from './dom.js';

// Question text marks chemistry with _subscript and ^superscript, braced when
// longer than one character: "Na_2CO_3", "CO_3^{2-}", "6.022 × 10^{23}".
const MARKUP = /([_^])(?:\{([^}]*)\}|(.))/g;

export function chem(text) {
  const nodes = [];
  let end = 0;
  for (const match of text.matchAll(MARKUP)) {
    if (match.index > end) nodes.push(text.slice(end, match.index));
    nodes.push(el(match[1] === '_' ? 'sub' : 'sup', {}, match[2] ?? match[3]));
    end = match.index + match[0].length;
  }
  if (end < text.length) nodes.push(text.slice(end));
  return nodes;
}

// Same text with the markers removed, for screen-reader announcements.
export function plain(text) {
  return text.replace(MARKUP, (_, __, braced, single) => braced ?? single);
}
