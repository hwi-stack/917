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
    '#FF69B4', // Hot Pink
    '#00E5FF', // Electric Cyan
    '#7C3AED', // Royal Purple
    '#10B981', // Emerald Green
    '#FFFFFF', // Sparkling White
  ];

  // 1. Center Celebratory Bursts (3 waves)
  const burstTimeouts = [0, 320, 680];
  burstTimeouts.forEach((delay, idx) => {
    setTimeout(() => {
      const posX = 0.35 + (idx === 0 ? 0.15 : (idx === 1 ? 0.08 : 0.22));
      const posY = 0.28 + (idx * 0.04);

      // Primary burst
      confetti({
        particleCount: idx === 2 ? 65 : 50,
        spread: 110,
        startVelocity: 38,
        ticks: 200,
        origin: { x: posX, y: posY },
        colors: vibrantColors,
        shapes: ['circle', 'square'],
        scalar: 1.05,
        disableForReducedMotion: false,
        zIndex: 9999,
      });

      // Starburst sparkles
      confetti({
        particleCount: 22,
        spread: 130,
        startVelocity: 42,
        ticks: 220,
        origin: { x: posX, y: posY },
        colors: ['#FFD700', '#FFFFFF', '#FFA07A', '#F43F5E'],
        shapes: ['star'],
        scalar: 1.25,
        zIndex: 9999,
      });
    }, delay);
  });

  // 2. Light Left/Right Side Cannons
  setTimeout(() => {
    // Left pop
    confetti({
      particleCount: 32,
      angle: 60,
      spread: 65,
      startVelocity: 48,
      ticks: 180,
      origin: { x: 0.05, y: 0.82 },
      colors: vibrantColors,
      scalar: 0.95,
      zIndex: 9999,
    });

    // Right pop
    confetti({
      particleCount: 32,
      angle: 120,
      spread: 65,
      startVelocity: 48,
      ticks: 180,
      origin: { x: 0.95, y: 0.82 },
      colors: vibrantColors,
      scalar: 0.95,
      zIndex: 9999,
    });
  }, 180);

  // 3. Gentle Falling Golden & Rose Confetti from Top (2 waves for continuous celebratory atmosphere)
  [450, 900].forEach((delay) => {
    setTimeout(() => {
      confetti({
        particleCount: 40,
        spread: 160,
        startVelocity: 20,
        ticks: 280,
        gravity: 0.75,
        origin: { x: 0.5, y: 0.05 },
        colors: ['#FFD700', '#FBBF24', '#FB7185', '#38BDF8', '#FFFFFF'],
        shapes: ['star', 'circle'],
        scalar: 1.15,
        zIndex: 9999,
      });
    }, delay);
  });
}
