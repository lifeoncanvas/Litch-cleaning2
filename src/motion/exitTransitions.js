/**
 * Exit transitions for overlays that React unmounts instantly.
 *
 * apple-design §7: "If something disappears one way, we expect it to emerge
 * from where it came." Every modal, drawer, menu and toast in the app is
 * conditionally rendered, so on close it would vanish in a single frame.
 *
 * Instead of threading a "closing" state through every component, this module
 * watches the DOM. When one of the registered overlays is removed, it puts back
 * an inert, non-interactive copy in the same place and plays the mirrored exit
 * animation on it (defined in apple-design.css), then removes the copy.
 *
 * Input is never locked out: the copy ignores pointer events, and it is
 * dropped immediately if the same overlay is opened again (interruptible).
 */

const EXITS = [
  { selector: '.licht-modal-overlay', className: 'apple-exit-modal' },
  { selector: '.admin-modal-overlay', className: 'apple-exit-modal' },
  { selector: '.cart-drawer-overlay', className: 'apple-exit-drawer' },
  { selector: '.mobile-nav-backdrop', className: 'apple-exit-fade' },
  { selector: '.mobile-nav-drawer', className: 'apple-exit-menu' },
  { selector: '.licht-toast', className: 'apple-exit-toast' },
];

const EXIT_DURATION_MS = 320;
const ghosts = new Map(); // selector -> Set<HTMLElement>
const scrollPositions = new WeakMap();

function reducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function makeGhost(original) {
  const clone = original.cloneNode(true);

  // Carry over live state cloneNode doesn't copy: scroll offsets and field values.
  const srcAll = [original, ...original.querySelectorAll('*')];
  const dstAll = [clone, ...clone.querySelectorAll('*')];
  srcAll.forEach((src, i) => {
    const dst = dstAll[i];
    if (!dst) return;
    const top = scrollPositions.get(src);
    if (top) dst.dataset.appleScrollTop = String(top);
    if ('value' in src && (src.tagName === 'INPUT' || src.tagName === 'TEXTAREA' || src.tagName === 'SELECT')) {
      dst.value = src.value;
      if (src.type === 'checkbox' || src.type === 'radio') dst.checked = src.checked;
    }
    if (dst.id) dst.removeAttribute('id'); // never duplicate ids
  });

  // Don't reload third-party frames (e.g. PayPal) inside the copy.
  clone.querySelectorAll('iframe, script, video').forEach((el) => {
    const placeholder = document.createElement('div');
    placeholder.style.cssText = el.style.cssText;
    el.replaceWith(placeholder);
  });

  clone.setAttribute('aria-hidden', 'true');
  clone.inert = true;
  clone.classList.add('apple-exiting');
  return clone;
}

function playExit(node, exit, parent, nextSibling) {
  const clone = makeGhost(node);
  clone.classList.add(exit.className);

  if (parent && parent.isConnected) {
    const ref = nextSibling && nextSibling.parentNode === parent ? nextSibling : null;
    parent.insertBefore(clone, ref);
  } else {
    document.body.appendChild(clone);
  }

  // Restore scroll after insertion (scrollTop is ignored on detached nodes).
  [clone, ...clone.querySelectorAll('[data-apple-scroll-top]')].forEach((el) => {
    if (el.dataset.appleScrollTop) el.scrollTop = Number(el.dataset.appleScrollTop);
  });

  if (!ghosts.has(exit.selector)) ghosts.set(exit.selector, new Set());
  ghosts.get(exit.selector).add(clone);

  const remove = () => {
    clone.remove();
    ghosts.get(exit.selector)?.delete(clone);
  };
  setTimeout(remove, reducedMotion() ? 220 : EXIT_DURATION_MS);
}

function dropGhosts(selector) {
  const set = ghosts.get(selector);
  if (!set) return;
  set.forEach((g) => g.remove());
  set.clear();
}

export function installExitTransitions() {
  if (typeof window === 'undefined' || typeof MutationObserver === 'undefined') return;

  // Remember scroll offsets inside overlays so the copy doesn't jump to the top.
  document.addEventListener(
    'scroll',
    (e) => {
      if (e.target instanceof Element) scrollPositions.set(e.target, e.target.scrollTop);
    },
    true
  );

  const observer = new MutationObserver((records) => {
    records.forEach((record) => {
      record.addedNodes.forEach((node) => {
        if (!(node instanceof Element) || node.classList.contains('apple-exiting')) return;
        EXITS.forEach((exit) => { if (node.matches(exit.selector)) dropGhosts(exit.selector); });
      });

      record.removedNodes.forEach((node) => {
        if (!(node instanceof Element) || node.classList.contains('apple-exiting')) return;
        const exit = EXITS.find((x) => node.matches(x.selector));
        if (exit) playExit(node, exit, record.target, record.nextSibling);
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
