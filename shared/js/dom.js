export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key.includes('-')) node.setAttribute(key, value);
    else node[key] = value;
  }
  add(node, ...children);
  return node;
}

export function clear(node) {
  node.replaceChildren();
  return node;
}

// Like node.append, but drops nullish children instead of stringifying them.
export function add(node, ...children) {
  node.append(...children.flat().filter((child) => child != null));
  return node;
}

export function toolbar(bar, { title, onBack, backHref, backLabel = 'Menu', right }) {
  clear(bar);
  const label = `\u2190 ${backLabel}`;
  add(
    bar,
    backHref
      ? el('a', { className: 'ghost btn back', href: backHref }, label)
      : onBack
        ? el('button', { type: 'button', className: 'ghost back', onclick: onBack }, label)
        : el('span'),
    title ? el('h1', { className: 'bar-title' }, title) : el('span'),
    el('span', { className: 'bar-right' }, right ?? ''),
  );
}
