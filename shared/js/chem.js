import { el } from './dom.js';

// Question text marks chemistry with _subscript and ^superscript, braced when
// longer than one character: "Na_2CO_3", "CO_3^{2-}", "6.022 × 10^{23}".
// *italic* and **bold** wrap a span of text, which may itself hold markup:
// "*m_l*", "which is **not** allowed", "**[Kr] 5*s*^1 4*d*^5**".
const MARKUP = /\*\*(.+?)\*\*|\*(.+?)\*|([_^])(?:\{([^}]*)\}|(.))/g;

export function chem(text) {
  const nodes = [];
  let end = 0;
  for (const match of text.matchAll(MARKUP)) {
    const [, bold, italic, script, braced, single] = match;
    if (match.index > end) nodes.push(text.slice(end, match.index));
    if (bold != null) nodes.push(el('strong', {}, chem(bold)));
    else if (italic != null) nodes.push(el('em', {}, chem(italic)));
    else nodes.push(el(script === '_' ? 'sub' : 'sup', {}, braced ?? single));
    end = match.index + match[0].length;
  }
  if (end < text.length) nodes.push(text.slice(end));
  return nodes;
}

// Same text with the markers removed, for screen-reader announcements.
export function plain(text) {
  return text.replace(MARKUP, (_, bold, italic, __, braced, single) =>
    bold != null ? plain(bold) : italic != null ? plain(italic) : braced ?? single,
  );
}
