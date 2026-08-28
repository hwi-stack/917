import confetti from 'canvas-confetti';

/**
 * Grand Celebration Fireworks & Confetti System
 * - Fullscreen 360-degree fireworks bursts
 * - Continuous dual side cannons
 * - Gold, Coral, Emerald, Sapphire, Ruby sparkle trails & star shapes
 * - High density & long duration (5.5+ seconds of dazzling celebratory particles)
 */
export function triggerFestiveConfetti() {
  const duration = 5.5 * 1000;
  const animationEnd = Date.now() + duration;

  const vibrantColors = [
    '#FFD700', // Royal Gold
    '#FFA500', // Bright Amber/Orange
    '#FF3366', // Festive Coral Red
    '#FF007F', // Vivid Pink
    '#00E5FF', // Electric Cyan
    '#7C3AED', // Royal Purple
    '#10B981', // Emerald Green
    '#FFFFFF', // Sparkling White
  ];

  // 1. Fullscreen Central Supernova Explosions (Sequential Waves)
  const burstTimeouts = [0, 400, 1100, 1900, 2800, 3700];
  burstTimeouts.forEach((delay, idx) => {
    setTimeout(() => {
      // Randomized center positions across stage
      const posX = 0.25 + Math.random() * 0.5;
      const posY = 0.25 + Math.random() * 0.35;

      // Heavy firework core
      confetti({
        particleCount: 120 + idx * 10,
        spread: 140,
        startVelocity: 45,
        ticks: 250,
        origin: { x: posX, y: posY },
        colors: vibrantColors,
        shapes: ['circle', 'square'],
        scalar: 1.25,
        disableForReducedMotion: false,
        zIndex: 9999,
      });

      // Starburst sparkles
      confetti({
        particleCount: 60,
        spread: 160,
        startVelocity: 55,
        ticks: 300,
        origin: { x: posX, y: posY },
        colors: ['#FFD700', '#FFFFFF', '#FFA07A', '#00FFFF'],
        shapes: ['star'],
        scalar: 1.6,
        zIndex: 9999,
      });
    }, delay);
  });

  // 2. Dual Side Continuous Celebration Cannons (Shooting arches from bottom corners)
  (function sideCannons() {
    // Left bottom cannon shooting up-right
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 75,
      startVelocity: 65,
      ticks: 200,
      origin: { x: -0.02, y: 0.85 },
      colors: vibrantColors,
      scalar: 1.2,
      zIndex: 9999,
    });

    // Right bottom cannon shooting up-left
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 75,
      startVelocity: 65,
      ticks: 200,
      origin: { x: 1.02, y: 0.85 },
      colors: vibrantColors,
      scalar: 1.2,
      zIndex: 9999,
    });

    if (Date.now() < animationEnd) {
      requestAnimationFrame(sideCannons);
    }
  })();

  // 3. Falling Golden Rain from Top
  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 180,
      startVelocity: 25,
      ticks: 400,
      gravity: 0.6,
      origin: { x: 0.5, y: 0.05 },
      colors: ['#FFD700', '#FBBF24', '#F59E0B', '#FFFFFF'],
      shapes: ['star', 'circle'],
      scalar: 1.4,
      zIndex: 9999,
    });
  }, 800);
}
