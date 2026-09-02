import confetti from 'canvas-confetti';

/**
 * Clean & Refined Celebration Fireworks & Confetti System
 * - Balanced particle count (light & elegant, avoids visual clutter)
 * - 2-wave central celebratory burst
 * - Soft side fountain pops
 * - Gentle falling golden sparkles
 */
export function triggerFestiveConfetti() {
  const vibrantColors = [
    '#FFD700', // Royal Gold
    '#FFA500', // Bright Amber/Orange
    '#FF3366', // Festive Coral Red
    '#00E5FF', // Electric Cyan
    '#7C3AED', // Royal Purple
    '#10B981', // Emerald Green
    '#FFFFFF', // Sparkling White
  ];

  // 1. Main Center Celebration Bursts (2 gentle waves)
  const burstTimeouts = [0, 450];
  burstTimeouts.forEach((delay, idx) => {
    setTimeout(() => {
      const posX = 0.35 + (idx === 0 ? 0.15 : Math.random() * 0.3);
      const posY = 0.3 + Math.random() * 0.15;

      // Primary light burst
      confetti({
        particleCount: 40,
        spread: 100,
        startVelocity: 35,
        ticks: 180,
        origin: { x: posX, y: posY },
        colors: vibrantColors,
        shapes: ['circle', 'square'],
        scalar: 1.0,
        disableForReducedMotion: false,
        zIndex: 9999,
      });

      // Subtle starburst sparkles
      confetti({
        particleCount: 15,
        spread: 120,
        startVelocity: 40,
        ticks: 200,
        origin: { x: posX, y: posY },
        colors: ['#FFD700', '#FFFFFF', '#FFA07A'],
        shapes: ['star'],
        scalar: 1.2,
        zIndex: 9999,
      });
    }, delay);
  });

  // 2. Light Left/Right Side Cannons (Gentle celebratory pops, non-intrusive)
  setTimeout(() => {
    // Left pop
    confetti({
      particleCount: 20,
      angle: 60,
      spread: 55,
      startVelocity: 45,
      ticks: 160,
      origin: { x: 0.05, y: 0.85 },
      colors: vibrantColors,
      scalar: 0.9,
      zIndex: 9999,
    });

    // Right pop
    confetti({
      particleCount: 20,
      angle: 120,
      spread: 55,
      startVelocity: 45,
      ticks: 160,
      origin: { x: 0.95, y: 0.85 },
      colors: vibrantColors,
      scalar: 0.9,
      zIndex: 9999,
    });
  }, 200);

  // 3. Gentle Falling Golden Sparkles from Top
  setTimeout(() => {
    confetti({
      particleCount: 30,
      spread: 140,
      startVelocity: 18,
      ticks: 250,
      gravity: 0.7,
      origin: { x: 0.5, y: 0.08 },
      colors: ['#FFD700', '#FBBF24', '#FFFFFF'],
      shapes: ['star', 'circle'],
      scalar: 1.1,
      zIndex: 9999,
    });
  }, 500);
}
