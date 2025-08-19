// Timer Engine Pseudocode matching SDD (no external deps yet)
// Later: implement with Reanimated worklet and SVG progress ring.

export type TimerEngineConfig = {
  totalMs: number;
};

export type TimerCallbacks = {
  onTick?: (elapsedMs: number) => void; // consider throttling to ~250–500ms for text
  onComplete?: () => void;
};

export function createTimerEngine(_config: TimerEngineConfig, _cb: TimerCallbacks) {
  // Placeholder JS fallback to keep interfaces stable before Reanimated integration
  // This will be replaced with a UI-thread worklet implementation.
  let startAt = 0;
  let pausedAt = 0;
  let rafId: number | null = null;
  let running = false;
  let lastTick = 0;

  const loop = () => {
    if (!running) return;
    const now = Date.now();
    const elapsed = now - startAt;
    // Throttle text updates to ~300ms to reduce JS churn
    if (now - lastTick >= 300) {
      lastTick = now;
      _cb.onTick?.(elapsed);
    }
    if (rafId != null) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(loop);
  };

  return {
    start() {
      if (running) return;
      running = true;
      startAt = Date.now() - pausedAt; // resume from paused offset if any
      rafId = requestAnimationFrame(loop);
    },
    pause() {
      if (!running) return;
      running = false;
      pausedAt = Date.now() - startAt;
      if (rafId != null) cancelAnimationFrame(rafId);
      rafId = null;
    },
    reset() {
      running = false;
      startAt = 0;
      pausedAt = 0;
      if (rafId != null) cancelAnimationFrame(rafId);
      rafId = null;
    },
  };
}
