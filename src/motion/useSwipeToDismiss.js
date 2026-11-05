import { useEffect, useRef } from 'react';
import { animateSpring, project, rubberband } from './spring';

/**
 * Swipe a side panel (drawer) to the right to dismiss it.
 *
 * Implements the apple-design gesture rules:
 *  - 10px hysteresis before committing to a direction; vertical intent is left
 *    to native scrolling (touch-action: pan-y).
 *  - 1:1 tracking relative to where the panel was grabbed.
 *  - Rubber-banding when pulled past the open position.
 *  - Velocity history → momentum projection decides commit vs. return,
 *    weighted by the velocity sign.
 *  - Release velocity is handed to the spring (no seam between drag and motion).
 *  - Fully interruptible: grabbing a moving panel starts from its live value.
 *  - The scrim fades continuously with drag progress.
 *
 * @param {React.RefObject<HTMLElement>} panelRef
 * @param {{ enabled: boolean, onDismiss: () => void }} options
 */
export function useSwipeToDismiss(panelRef, { enabled, onDismiss }) {
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    const panel = panelRef.current;
    if (!enabled || !panel) return undefined;

    const scrim = panel.parentElement;
    let x = 0;               // presentation value (px, 0 = open)
    let spring = null;
    let gesture = null;      // { id, startX, startY, startOffset, active, history }

    const width = () => panel.getBoundingClientRect().width || 1;

    const render = (value) => {
      x = value;
      panel.style.transform = value === 0 ? '' : `translate3d(${value}px, 0, 0)`;
      if (scrim) scrim.style.setProperty('--drag-progress', String(Math.max(0, Math.min(1, value / width()))));
    };

    /** Read the on-screen translateX, even mid CSS animation, then take over. */
    const grabLiveValue = () => {
      if (spring && spring.isRunning()) {
        spring.stop();
        spring = null;
        return x;
      }
      const running = panel.getAnimations ? panel.getAnimations() : [];
      if (running.length) {
        const m = new DOMMatrixReadOnly(getComputedStyle(panel).transform);
        running.forEach((a) => a.cancel());
        render(m.m41);
        return m.m41;
      }
      return x;
    };

    const springTo = (target, velocity, opts) => {
      spring = animateSpring({
        from: x,
        to: target,
        velocity,
        onUpdate: render,
        ...opts,
      });
    };

    const isFormField = (el) => el.closest('input, textarea, select, [contenteditable="true"]');

    const onPointerDown = (e) => {
      if (e.button !== 0 || isFormField(e.target)) return;
      const startOffset = grabLiveValue();
      gesture = {
        id: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        startOffset,
        active: startOffset !== 0, // a moving panel is grabbed immediately
        history: [{ x: e.clientX, t: e.timeStamp }],
      };
      if (gesture.active) panel.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!gesture || e.pointerId !== gesture.id) return;
      const dx = e.clientX - gesture.startX;
      const dy = e.clientY - gesture.startY;

      if (!gesture.active) {
        if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
          gesture.active = true;
          gesture.startX = e.clientX; // begin tracking from here: no jump
          panel.setPointerCapture(e.pointerId);
        } else if (Math.abs(dy) > 10) {
          gesture = null; // vertical intent → let the list scroll
          return;
        } else {
          return;
        }
      }

      gesture.history.push({ x: e.clientX, t: e.timeStamp });
      while (gesture.history.length > 2 && e.timeStamp - gesture.history[0].t > 100) {
        gesture.history.shift();
      }

      let next = gesture.startOffset + (e.clientX - gesture.startX);
      if (next < 0) next = rubberband(next, width());
      render(next);
    };

    /** Velocity over the last 100ms *before release* — a held pointer reads ~0. */
    const releaseVelocity = (e) => {
      const h = gesture.history.concat({ x: e.clientX, t: e.timeStamp })
        .filter((p) => e.timeStamp - p.t <= 100);
      if (h.length < 2) return 0;
      const first = h[0];
      const lastPt = h[h.length - 1];
      const dt = (lastPt.t - first.t) / 1000;
      return dt > 0 ? (lastPt.x - first.x) / dt : 0;
    };

    const onPointerUp = (e) => {
      if (!gesture || e.pointerId !== gesture.id) return;
      const wasActive = gesture.active;
      const velocity = wasActive ? releaseVelocity(e) : 0;
      gesture = null;
      if (!wasActive) return;

      // A drag is not a tap: swallow the click that follows it.
      const swallow = (ev) => { ev.stopPropagation(); ev.preventDefault(); };
      panel.addEventListener('click', swallow, { capture: true, once: true });
      setTimeout(() => panel.removeEventListener('click', swallow, { capture: true }), 0);

      const w = width();
      const projected = x + project(velocity);
      const commit = velocity > 400 || (projected > w / 2 && velocity > -100);

      if (commit) {
        // Leaving the screen: critically damped, inherits the flick velocity.
        springTo(w, velocity, {
          damping: 1,
          response: 0.3,
          onComplete: () => {
            panel.dataset.gestureDismissed = 'true';
            onDismissRef.current();
          },
        });
      } else {
        // Returning home after a throw: a touch of bounce is earned here.
        springTo(0, velocity, { damping: 0.8, response: 0.35 });
      }
    };

    const onPointerCancel = (e) => {
      if (!gesture || e.pointerId !== gesture.id) return;
      gesture = null;
      springTo(0, 0, { damping: 1, response: 0.35 });
    };

    panel.addEventListener('pointerdown', onPointerDown);
    panel.addEventListener('pointermove', onPointerMove);
    panel.addEventListener('pointerup', onPointerUp);
    panel.addEventListener('pointercancel', onPointerCancel);

    return () => {
      if (spring) spring.stop();
      panel.removeEventListener('pointerdown', onPointerDown);
      panel.removeEventListener('pointermove', onPointerMove);
      panel.removeEventListener('pointerup', onPointerUp);
      panel.removeEventListener('pointercancel', onPointerCancel);
    };
  }, [enabled, panelRef]);
}
