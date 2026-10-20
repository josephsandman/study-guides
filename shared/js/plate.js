import { el } from './dom.js';

// Images attached to a question. `question.image` is an id from the set's `images`
// list, an inline image object, or an array of either. An object with an `id` and no
// `file` reuses that library entry and overrides the fields it sets (e.g. `show`).
// `show` is "prompt" (default: visible while answering) or "answer" (revealed after).
export function imagesFor(set, question) {
  const refs = [question.image ?? []].flat();
  return refs
    .map((ref) => {
      const id = typeof ref === 'string' ? ref : ref.file ? null : ref.id;
      const base = id ? set.images?.find((image) => image.id === id) : null;
      if (id && !base) {
        console.warn(`Question ${question.id}: no image with id "${id}"`);
        return null;
      }
      return { show: 'prompt', ...base, ...(typeof ref === 'string' ? {} : ref) };
    })
    .filter(Boolean);
}

// Figures for the images shown at `show` ("prompt" or "answer"), or all of them.
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
