import React from 'react';

export const BackgroundFestive: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-br from-amber-50 via-orange-50/70 to-rose-50/80">
      {/* Radiant radial gradient light glows */}
      <div 
        className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[90vw] h-[60vh] rounded-full blur-[100px] opacity-45 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(251, 191, 36, 0.6) 0%, rgba(244, 63, 94, 0.25) 60%, transparent 100%)' }}
      />
      <div 
        className="absolute -bottom-[15%] left-[10%] w-[50vw] h-[50vh] rounded-full blur-[90px] opacity-35 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(249, 115, 22, 0.4) 0%, rgba(236, 72, 153, 0.2) 70%, transparent 100%)' }}
      />
      <div 
        className="absolute top-[30%] -right-[10%] w-[45vw] h-[55vh] rounded-full blur-[95px] opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(252, 211, 77, 0.5) 0%, rgba(251, 113, 133, 0.2) 75%, transparent 100%)' }}
      />

      {/* Decorative festive golden light rays */}
      <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="festive-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="1.2" fill="#D97706" opacity="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#festive-grid)" />
      </svg>

      {/* Floating subtle celebratory sparkle glyphs */}
      <div className="absolute top-12 left-16 text-amber-300/40 text-3xl select-none animate-pulse">✦</div>
      <div className="absolute top-28 right-24 text-rose-300/40 text-2xl select-none animate-pulse delay-300">★</div>
      <div className="absolute bottom-20 left-32 text-orange-300/35 text-4xl select-none animate-pulse delay-700">✦</div>
      <div className="absolute bottom-36 right-36 text-amber-400/40 text-2xl select-none animate-pulse delay-500">★</div>
      <div className="absolute top-1/2 left-8 text-rose-400/30 text-2xl select-none animate-pulse delay-1000">✧</div>
      <div className="absolute top-1/3 right-12 text-amber-400/35 text-3xl select-none animate-pulse delay-200">✧</div>
    </div>
  );
};
