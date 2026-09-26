import confetti from "canvas-confetti";

const ORTHO_COLORS = [
  "#172554", // blue-950 (Primary dark)
  "#1e3a8a", // blue-900 (Secondary dark)
  "#10b981", // emerald-500 (Success green)
  "#6ee7b7", // emerald-300 (Lighter success accent)
  "#94a3b8", // slate-400 (Neutral tech accent)
];

/**
 * Quick, subtle burst when a single word is answered correctly
 */
export function triggerCorrectConfetti() {
  confetti({
    particleCount: 35,
    spread: 60,
    origin: { y: 0.75 },
    startVelocity: 25,
    ticks: 120,
    colors: ORTHO_COLORS,
    disableForReducedMotion: true,
  });
}

/**
 * Big multi-cannon celebration burst for the session completion screen
 */
export function triggerCompletionConfetti() {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = {
    startVelocity: 30,
    spread: 360,
    ticks: 80,
    zIndex: 100,
    colors: ORTHO_COLORS,
    disableForReducedMotion: true,
  };

  const randomInRange = (min: number, max: number) =>
    Math.random() * (max - min) + min;

  const interval: ReturnType<typeof setInterval> = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 40 * (timeLeft / duration);

    // Left cannon
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    });

    // Right cannon
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);
}
