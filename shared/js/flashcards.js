import { add, clear, el, toolbar } from './dom.js';
import { count, inSection } from './util.js';
import { plateFor } from './plate.js';
import { chem, plain } from './chem.js';
import { onSwipe } from './swipe.js';

export function flashcards(ctx) {
  const { set, store, root, bar, signal, opts } = ctx;
  const cards = set.questions.filter(
    (q) =>
      q.type === 'flashcard' &&
      (opts.ids ? opts.ids.includes(q.id) : inSection(q, opts.section)),
  );

  let queue = cards.map((q) => q.id);
  let at = 0;
  let flipped = false;

  const byId = (id) => cards.find((q) => q.id === id);
  const marked = () => store.get('review');

  const body = el('div', { className: 'stack' });
  root.append(body);
  onSwipe(body, move, signal);

  document.addEventListener(
    'keydown',
    (event) => {
      if (document.querySelector('dialog[open]')) return;
      if (event.key === 'ArrowRight') move(1);
      else if (event.key === 'ArrowLeft') move(-1);
      else if ((event.key === ' ' || event.key === 'Enter') && !event.target.closest('button, a')) {
        event.preventDefault();
        toggle();
      }
    },
    { signal },
  );

  draw();

  function draw() {
    clear(body);
    if (!queue.length) {
      toolbar(bar, { title: 'Flashcards', onBack: () => ctx.go('home') });
      body.append(el('p', { className: 'notice' }, 'No flashcards in this section.'));
      return;
    }
    if (at >= queue.length) return drawDone();

    const card = byId(queue[at]);
    const isMarked = marked().includes(card.id);
    toolbar(bar, {
      title: 'Flashcards',
      onBack: () => ctx.go('home'),
      right: `${at + 1} / ${queue.length}`,
    });

    const cardButton = el(
      'button',
      {
        type: 'button',
        className: `flip${flipped ? ' is-flipped' : ''}`,
        'aria-expanded': String(flipped),
        onclick: toggle,
      },
      el(
        'div',
        { className: 'flip-inner' },
        face('front', card, sectionName(card), card.prompt, !flipped),
        face('back', card, 'Definition', card.answer, flipped),
      ),
    );
    add(
      body,
      cardButton,
      isMarked ? el('p', { className: 'marked' }, 'Marked for review') : null,
      flipped
        ? el(
            'div',
            { className: 'row' },
            el('button', { type: 'button', className: 'primary', onclick: () => mark(false) }, 'Got it'),
            el('button', { type: 'button', onclick: () => mark(true) }, 'Review again'),
          )
        : el('button', { type: 'button', className: 'primary', onclick: toggle }, 'Show answer'),
      flipped ? plateFor(set, card) : null,
      el(
        'div',
        { className: 'row' },
        el('button', { type: 'button', className: 'ghost', disabled: at === 0, onclick: () => move(-1) }, '← Previous'),
        el('button', { type: 'button', className: 'ghost', onclick: () => move(1) }, 'Next →'),
      ),
      el('p', { className: 'hint small' }, 'Tap the card or press space to flip. Swipe or use the arrow keys to move.'),
    );
  }

  function drawDone() {
    const stillMarked = cards.filter((q) => marked().includes(q.id));
    toolbar(bar, { title: 'Flashcards', onBack: () => ctx.go('home') });
    body.append(
      el(
        'div',
        { className: 'ebox' },
        el('span', { className: 'num' }, 'END'),
        el('p', { className: 'term' }, 'Deck finished'),
        el(
          'p',
          { className: 'body muted' },
          stillMarked.length
            ? `${count(stillMarked.length, 'card')} still marked for review.`
            : 'Nothing left marked for review.',
        ),
      ),
      el(
        'div',
        { className: 'row' },
        stillMarked.length
          ? el(
              'button',
              { type: 'button', className: 'primary', onclick: () => restart(stillMarked) },
              'Study marked cards',
            )
          : null,
        el('button', { type: 'button', onclick: () => restart(cards) }, 'Start over'),
      ),
    );
    ctx.say('Deck finished.');
  }

  function restart(deck) {
    queue = deck.map((q) => q.id);
    at = 0;
    flipped = false;
    draw();
  }

  function face(side, card, label, text, visible) {
    return el(
      'div',
      { className: `face ${side} ebox`, 'aria-hidden': String(!visible) },
      el('span', { className: 'num' }, card.id.toUpperCase()),
      el('p', { className: side === 'front' ? 'term' : 'body' }, chem(text)),
      el('span', { className: 'sect' }, label),
    );
  }

  function sectionName(card) {
    return set.sections.find((s) => s.id === card.section)?.name ?? '';
  }

  function toggle() {
    if (at >= queue.length || !queue.length) return;
    flipped = !flipped;
    if (flipped) ctx.say(plain(byId(queue[at]).answer));
    draw();
  }

  function mark(review) {
    const id = queue[at];
    const next = marked().filter((other) => other !== id);
    if (review) {
      next.push(id);
      if (queue.indexOf(id, at + 1) === -1) queue.push(id);
    }
    store.set('review', next);
    move(1);
  }

  function move(step) {
    const next = at + step;
    if (next < 0 || next > queue.length) return;
    at = next;
    flipped = false;
    draw();
  }
}
