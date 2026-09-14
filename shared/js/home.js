import { add, clear, el, toolbar } from './dom.js';
import { count, inSection } from './util.js';

export function home(ctx) {
  const { set, store, root, bar } = ctx;
  toolbar(bar, { backHref: ctx.index, backLabel: 'All guides' });

  const select = el(
    'select',
    { id: 'section', onchange: () => { store.set('section', select.value); draw(); } },
    el('option', { value: 'all' }, 'All sections'),
    set.sections.map((s) => el('option', { value: s.id }, s.name)),
  );
  select.value = store.get('section');
  if (!select.value) select.value = 'all';

  const tiles = el('ul', { className: 'tiles' });
  const extras = el('div', { className: 'stack' });

  add(
    root,
    el(
      'div',
      { className: 'masthead' },
      el('span', { className: 'superHeader' }, set.superTitle),
      el('h1', {}, set.title),
      set.description ? el('p', { className: 'muted' }, set.description) : null,
    ),
    el('label', { className: 'field', htmlFor: 'section' }, el('span', {}, 'Section'), select),
    tiles,
    extras,
  );

  draw();

  function draw() {
    const section = select.value;
    const pick = (type) => set.questions.filter((q) => q.type === type && inSection(q, section));
    const cards = pick('flashcard');
    const quiz = pick('multiple_choice');
    const missed = quiz.filter((q) => store.get('missed').includes(q.id));
    const marked = cards.filter((q) => store.get('review').includes(q.id));
    const last = store.get('mode');

    clear(tiles);
    tiles.append(
      tile(1, 'Fc', 'Flashcards', count(cards.length, 'card'), cards.length > 0, last === 'flashcards', () =>
        ctx.go('flashcards', { section }),
      ),
      tile(2, 'Pt', 'Practice test', count(quiz.length, 'question'), quiz.length > 0, last === 'practice', () =>
        ctx.go('practice', { section }),
      ),
      tile(
        3,
        'Rm',
        'Review missed',
        missed.length ? count(missed.length, 'question') : 'Nothing missed yet',
        missed.length > 0,
        last === 'review',
        () => ctx.go('practice', { section, ids: missed.map((q) => q.id), mode: 'review' }),
      ),
    );

    clear(extras);
    if (marked.length) {
      add(
        extras,
        el(
          'button',
          {
            type: 'button',
            onclick: () => ctx.go('flashcards', { section, ids: marked.map((q) => q.id) }),
          },
          `Study ${count(marked.length, 'card')} marked for review`,
        ),
      );
    }
    add(extras, resetControl());
  }

  function resetControl() {
    const slot = el('div', { className: 'reset' });

    const idle = () =>
      add(clear(slot), el('button', { type: 'button', className: 'ghost small', onclick: asking }, 'Reset progress'));

    const asking = () =>
      add(
        clear(slot),
        el(
          'p',
          { className: 'small muted' },
          'Clear saved progress on this device? Cards marked for review and the last set of missed questions will be forgotten.',
        ),
        el(
          'div',
          { className: 'row' },
          el('button', { type: 'button', onclick: wipe }, 'Yes, reset'),
          el('button', { type: 'button', className: 'ghost', onclick: idle }, 'Cancel'),
        ),
      );

    const wipe = () => {
      store.reset();
      select.value = 'all';
      ctx.say('Progress cleared.');
      draw();
    };

    return idle();
  }
}

function tile(number, symbol, name, meta, enabled, isLast, onclick) {
  const button = el(
    'button',
    { type: 'button', className: 'tile', disabled: !enabled, onclick },
    el('span', { className: 'num' }, String(number).padStart(2, '0')),
    el('span', { className: 'sym' }, symbol),
    el('span', { className: 'name' }, name),
    el('span', { className: 'meta' }, isLast ? `${meta} · last used` : meta),
  );
  return el('li', {}, button);
}
