import confetti from 'canvas-confetti';

export function triggerFestiveConfetti() {
  // Burst 1: Golden and coral fireworks from bottom corners
  const end = Date.now() + 2.5 * 1000;
  const colors = ['#F59E0B', '#EF4444', '#EC4899', '#3B82F6', '#10B981', '#FBBF24', '#FFFFFF'];

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 },
      colors: colors,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 },
      colors: colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();

  // Big central burst
  setTimeout(() => {
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FF69B4', '#00E5FF', '#7C3AED'],
      disableForReducedMotion: true,
    });
  }, 200);

  // Stars and shapes
  setTimeout(() => {
    confetti({
      particleCount: 50,
      spread: 120,
      origin: { y: 0.5 },
      shapes: ['star', 'circle'],
      colors: ['#FFD700', '#FFA07A', '#FFFFFF'],
      scalar: 1.2,
    });
  }, 600);
}
