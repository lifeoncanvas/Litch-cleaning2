/**
 * Apple-style spring physics for the web.
 *
 * Parameterised the way Apple designs them (WWDC "Designing Fluid Interfaces"):
 *   damping  — damping ratio. 1.0 = critically damped (no overshoot), < 1 bounces.
 *   response — roughly how quickly the value reaches its target, in seconds.
 *
 * Springs start from the current (presentation) value and accept an initial
 * velocity in px/s, so a gesture can hand its momentum straight to the
 * animation, and a running spring can be stopped and re-grabbed at any frame.
 */

/** Apple's momentum projection (exponential deceleration, as in scroll views). */
export function project(velocity, decelerationRate = 0.998) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/** Progressive resistance past a boundary — never a hard stop. */
export function rubberband(overshoot, dimension, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Animate a scalar with a spring.
 * @returns {{ stop: () => number, isRunning: () => boolean }}
 *   stop() halts on the current frame and returns the live value.
 */
export function animateSpring({
  from,
  to,
  velocity = 0,
  damping = 1,
  response = 0.35,
  onUpdate,
  onComplete,
}) {
  const stiffness = Math.pow((2 * Math.PI) / response, 2);
  const friction = (4 * Math.PI * damping) / response;

  let x = from;
  let v = velocity;
  let last = null;
  let raf = null;
  let running = true;

  // Reduced motion: no travel, just land (callers cross-fade instead).
  if (prefersReducedMotion()) {
    onUpdate(to);
    running = false;
    if (onComplete) requestAnimationFrame(() => onComplete());
    return { stop: () => to, isRunning: () => false };
  }

  const step = (now) => {
    if (!running) return;
    if (last === null) last = now;
    // Clamp dt so a backgrounded tab doesn't explode the integration.
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;

    // Semi-implicit Euler with sub-steps for stability at high stiffness.
    const steps = 8;
    const h = dt / steps;
    for (let i = 0; i < steps; i++) {
      const accel = -stiffness * (x - to) - friction * v;
      v += accel * h;
      x += v * h;
    }

    if (Math.abs(x - to) < 0.5 && Math.abs(v) < 8) {
      x = to;
      running = false;
      onUpdate(x);
      if (onComplete) onComplete();
      return;
    }
    onUpdate(x);
    raf = requestAnimationFrame(step);
  };

  raf = requestAnimationFrame(step);

  return {
    stop: () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      return x;
    },
    isRunning: () => running,
  };
}
