import { add, clear, el, toolbar } from './dom.js';
import { inSection, shuffle } from './util.js';
import { plateFor } from './plate.js';
import { chem, plain } from './chem.js';
import { onSwipe } from './swipe.js';

export function practice(ctx) {
  const { set, store, root, bar, signal, opts } = ctx;
  const isReview = opts.mode === 'review';
  const title = isReview ? 'Review missed' : 'Practice test';

  const pool = set.questions.filter(
    (q) =>
      q.type === 'multiple_choice' &&
      (opts.ids ? opts.ids.includes(q.id) : inSection(q, opts.section)),
  );

  let round = [];
  let at = 0;
  let answers = [];

  const body = el('div', { className: 'stack' });
  root.append(body);
  onSwipe(body, (step) => step === 1 && advance(), signal);

  document.addEventListener(
    'keydown',
    (event) => {
      if (document.querySelector('dialog[open]')) return;
      const current = round[at];
      if (!current) return;
      const key = Number(event.key);
      if (key >= 1 && key <= current.choices.length && current.answered === null) {
        event.preventDefault();
        choose(key - 1);
      } else if ((event.key === 'ArrowRight' || event.key === 'Enter') && current.answered !== null && !event.target.closest('button')) {
        event.preventDefault();
        advance();
      }
    },
    { signal },
  );

  begin();

  function begin() {
    round = shuffle(pool).map((question) => ({
      question,
      choices: shuffle(question.choices.map((text, index) => ({ text, correct: index === question.answerIndex }))),
      answered: null,
    }));
    at = 0;
    answers = [];
    draw();
  }

  function draw() {
    clear(body);
    if (!round.length) {
      toolbar(bar, { title, onBack: () => ctx.go('home') });
      body.append(el('p', { className: 'notice' }, 'No questions in this section.'));
      return;
    }
    if (at >= round.length) return drawResults();

    const item = round[at];
    const { question } = item;
    const right = answers.filter((a) => a.correct).length;
    toolbar(bar, { title, onBack: () => ctx.go('home'), right: `${right} correct` });

    const list = el('ul', { className: 'choices' });
    item.choices.forEach((choice, index) => {
      const chosen = item.answered === index;
      const state = item.answered === null ? '' : choice.correct ? ' correct' : chosen ? ' wrong' : '';
      list.append(
        el(
          'li',
          {},
          el(
            'button',
            {
              type: 'button',
              className: `choice${state}`,
              disabled: item.answered !== null,
              onclick: () => choose(index),
            },
            el('span', { className: 'key' }, String(index + 1)),
            el('span', {}, chem(choice.text)),
            el('span', { className: 'mark' }, state === ' correct' ? '✓ correct' : state === ' wrong' ? '✕ your answer' : ''),
          ),
        ),
      );
    });

    body.append(
      progress(at + 1, round.length),
      el(
        'div',
        { className: 'ebox' },
        el('span', { className: 'num' }, String(at + 1).padStart(2, '0')),
        el('p', { className: 'ask' }, chem(question.prompt)),
        el('span', { className: 'sect' }, set.sections.find((s) => s.id === question.section)?.name ?? ''),
      ),
      list,
    );

    if (item.answered !== null) {
      const correct = item.choices[item.answered].correct;
      add(
        body,
        el(
          'div',
          { className: `verdict ${correct ? 'correct' : 'wrong'}` },
          el('p', { className: 'head' }, correct ? '✓ Correct' : '✕ Not quite'),
          el('p', {}, chem(question.explanation)),
        ),
        plateFor(set, question),
        el(
          'button',
          { type: 'button', className: 'primary', onclick: advance },
          at === round.length - 1 ? 'See results' : 'Next question',
        ),
        el('p', { className: 'hint small' }, 'Or swipe left to move on.'),
      );
      body.querySelector('.primary').focus({ preventScroll: true });
    } else {
      body.append(el('p', { className: 'hint small' }, 'Pick an answer, or press 1–4.'));
    }
  }

  function choose(index) {
    const item = round[at];
    if (item.answered !== null) return;
    item.answered = index;
    const correct = item.choices[index].correct;
    answers.push({ id: item.question.id, correct, given: item.choices[index].text });
    ctx.say(`${correct ? 'Correct.' : 'Incorrect.'} ${plain(item.question.explanation)}`);
    draw();
  }

  function advance() {
    if (at >= round.length || round[at].answered === null) return;
    at += 1;
    draw();
  }

  function drawResults() {
    const right = answers.filter((a) => a.correct).length;
    const missed = answers.filter((a) => !a.correct);
    store.set('missed', missed.map((a) => a.id));
    toolbar(bar, { title, onBack: () => ctx.go('home') });
    ctx.say(`Finished. ${right} of ${round.length} correct.`);

    add(
      body,
      el(
        'div',
        { className: 'ebox' },
        el('span', { className: 'num' }, 'SCORE'),
        el('p', { className: 'score' }, `${right}/${round.length}`),
        el('span', { className: 'sect' }, `${Math.round((right / round.length) * 100)}% correct`),
      ),
      missed.length
        ? el('h2', {}, `Missed ${missed.length === 1 ? 'question' : 'questions'}`)
        : el('p', { className: 'notice' }, 'Every question correct.'),
      missed.length ? missedList(missed) : null,
      el(
        'div',
        { className: 'row' },
        missed.length
          ? el(
              'button',
              {
                type: 'button',
                className: 'primary',
                onclick: () => ctx.go('practice', { ...opts, ids: missed.map((a) => a.id), mode: 'review' }),
              },
              'Review missed',
            )
          : null,
        el('button', { type: 'button', onclick: begin }, 'Start over'),
      ),
    );
  }

  function missedList(missed) {
    const list = el('ul', { className: 'missed' });
    for (const answer of missed) {
      const question = pool.find((q) => q.id === answer.id);
      list.append(
        el(
          'li',
          {},
          el('p', { className: 'q' }, chem(question.prompt)),
          el('p', { className: 'line' }, el('b', {}, 'You answered: '), chem(answer.given)),
          el('p', { className: 'line' }, el('b', {}, 'Correct answer: '), chem(question.choices[question.answerIndex])),
          el('p', { className: 'line muted' }, chem(question.explanation)),
          plateFor(set, question),
        ),
      );
    }
    return list;
  }
}

function progress(current, total) {
  return el(
    'div',
    { className: 'progress' },
    el('span', {}, `Question ${current} of ${total}`),
    el('div', { className: 'track' }, el('div', { className: 'fill', style: `width:${(current / total) * 100}%` })),
  );
}
