import { el } from './dom.js';

// Annotated image shown alongside an answer. `question.image` names an entry in the set.
export function plateFor(set, question) {
  const image = set.image;
  if (!question.image || !image || image.id !== question.image) return null;

  const img = el('img', { src: image.file, alt: image.alt, loading: 'lazy' });
  img.addEventListener('click', () => openPlate(image));

  const legend = el('dl', { className: 'legend' });
  for (const { marking, means } of image.legend ?? []) {
    legend.append(el('dt', {}, marking), el('dd', {}, means));
  }

  return el(
    'figure',
    { className: 'plate' },
    img,
    el(
      'button',
      { type: 'button', className: 'ghost small', onclick: () => openPlate(image) },
      'Open full screen',
    ),
    image.caption ? el('figcaption', {}, image.caption) : null,
    legend.children.length ? legend : null,
  );
}

function openPlate(image) {
  const dialog = el('dialog', { className: 'lightbox', 'aria-label': image.caption ?? 'Image' });
  const zoomed = el('img', { src: image.file, alt: image.alt });

  const toggle = el('button', { type: 'button' }, 'Zoom in');
  const setZoom = (on) => {
    dialog.classList.toggle('is-zoomed', on);
    toggle.textContent = on ? 'Zoom out' : 'Zoom in';
  };
  toggle.onclick = () => setZoom(!dialog.classList.contains('is-zoomed'));
  zoomed.addEventListener('click', () => setZoom(!dialog.classList.contains('is-zoomed')));

  dialog.append(
    el(
      'div',
      { className: 'bar' },
      toggle,
      el('button', { type: 'button', onclick: () => dialog.close() }, 'Close'),
    ),
    el('div', { className: 'stage' }, zoomed),
  );
  dialog.addEventListener('close', () => dialog.remove());
  document.body.append(dialog);
  dialog.showModal();
}
