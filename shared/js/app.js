import { clear, el } from './dom.js';
import { Store } from './store.js';
import { home } from './home.js';
import { flashcards } from './flashcards.js';
import { practice } from './practice.js';

const SCREENS = { home, flashcards, practice };

export async function start({ id, source, index = '../../' }) {
  const root = document.getElementById('screen');
  const bar = document.getElementById('topbar');
  const live = document.getElementById('live');

  let set;
  try {
    const response = await fetch(source, { cache: 'no-cache' });
    if (!response.ok) throw new Error(response.status);
    set = await response.json();
  } catch {
    root.append(
      el('p', { className: 'notice' }, `Could not load ${source}. Open the site over http, not as a local file.`),
    );
    return;
  }

  const store = new Store(id);
  const app = { set, store, say, index };
  let running;

  app.go = (name, opts = {}) => {
    running?.abort();
    running = new AbortController();
    clear(root);
    clear(bar);
    window.scrollTo(0, 0);
    if (name !== 'home') store.set('mode', opts.mode ?? name);
    SCREENS[name]({ ...app, root, bar, opts, signal: running.signal });
  };

  app.go('home');

  // Re-announce identical strings by clearing the region first.
  function say(message) {
    live.textContent = '';
    requestAnimationFrame(() => {
      live.textContent = message;
    });
  }
}
