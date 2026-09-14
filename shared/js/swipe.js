const DISTANCE = 45;

// Horizontal swipes that start inside `node`. The click ending the gesture is
// swallowed, so a swipe beginning on a button does not also press it.
export function onSwipe(node, handler, signal) {
  let startX = null;
  let startY = 0;
  let swiped = false;

  document.addEventListener(
    'pointerdown',
    (event) => {
      startX = node.contains(event.target) ? event.clientX : null;
      startY = event.clientY;
      swiped = false;
    },
    { signal },
  );

  document.addEventListener(
    'pointerup',
    (event) => {
      if (startX === null) return;
      const dx = event.clientX - startX;
      startX = null;
      if (Math.abs(dx) < DISTANCE || Math.abs(dx) <= Math.abs(event.clientY - startY)) return;
      swiped = true;
      handler(dx < 0 ? 1 : -1);
    },
    { signal },
  );

  node.addEventListener(
    'click',
    (event) => {
      if (!swiped) return;
      swiped = false;
      event.stopPropagation();
      event.preventDefault();
    },
    { capture: true, signal },
  );
}
