import { el } from './dom.js';

// Images attached to a question. `question.iamge` is an id, or a list of ids, from the
// set's `images` list. Each image's `show` is "prompt" (default: visible while
// answering) or "answer" (revealed after).
export function imagesFor(set, question) {
  return [question.image ?? []]
    .flat()
    .map((id) => {
      const image = set.images?.find((entry) => entry.id === id);
      if (!image) console.warn(`Question ${question.id}: no image with id "${id}"`);
      return image && { show: 'prompt', ...image };
    })
    .filter(Boolean);
}
// Figures for the images shown at `show` ("prompt" or "answer"), or all of them
export function platesFor(set, question, show) {
  const plates = imagesFor(set, question)
    .filter((image) => !show || image.show === show)
    .map(plate);
  return plates.length ? plates : null;
}

function plate(image) {
  const img = el('img', { src: image.file, alt: image.alt ?? '', loading: 'lazy' });
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
  const zoomed = el('img', { src: image.file, alt: image.alt ?? '' });

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
