import React, { useEffect, useMemo, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Building2, Trophy } from 'lucide-react';

interface GroupVerticalReelProps {
  candidates: string[];
  winnerGroup: string | null;
  isRolling: boolean;
  isSingle: boolean;
  isMedium: boolean;
  isCompleted: boolean;
  durationMs?: number;
}

export const GroupVerticalReel: React.FC<GroupVerticalReelProps> = ({
  candidates = [],
  winnerGroup,
  isRolling,
  isSingle,
  isMedium,
  isCompleted,
  durationMs = 7300,
}) => {
  // Safe candidate list
  const safeCandidates = useMemo(() => {
    if (candidates && candidates.length > 0) return candidates;
    return [
      '수원시장애인종합복지관',
      '수원시장애인주간보호시설',
      '수원시장애인직업재활시설',
      '수원시장애인단기보호시설',
      '수원시립장애인복지시설',
    ];
  }, [candidates]);

  // Current display text
  const [displayText, setDisplayText] = useState<string>(() => winnerGroup || safeCandidates[0]);
  const [progress, setProgress] = useState<number>(0);
  const [animKey, setAnimKey] = useState<number>(0);

  const timeoutIdsRef = useRef<number[]>([]);

  // Cleanup all timers
  const clearAllTimers = () => {
    timeoutIdsRef.current.forEach((id) => clearTimeout(id));
    timeoutIdsRef.current = [];
  };

  useEffect(() => {
    if (!isRolling) {
      clearAllTimers();
      if (winnerGroup) {
        setDisplayText(winnerGroup);
      }
      setProgress(1);
      return;
    }

    clearAllTimers();
    setProgress(0);

    // Prepare steps sequence
    const otherCandidates = safeCandidates.filter((c) => c !== winnerGroup);
    const pool = otherCandidates.length > 0 ? otherCandidates : safeCandidates;

    const totalSteps = 36;
    const items: string[] = [];
    for (let i = 0; i < totalSteps - 1; i++) {
      items.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    items.push(winnerGroup || safeCandidates[0]);

    // Calculate normalized delays so sum(delays) === durationMs EXACTLY
    // Weights follow cubic deceleration curve: high speed initially, smoothly easing to slow
    const rawWeights: number[] = [];
    for (let i = 0; i < totalSteps; i++) {
      const t = i / (totalSteps - 1); // 0 -> 1
      const weight = 1 + Math.pow(t, 3.2) * 12; // smoothly rises
      rawWeights.push(weight);
    }
    const totalWeight = rawWeights.reduce((a, b) => a + b, 0);

    let cumulativeTime = 0;
    for (let i = 0; i < totalSteps; i++) {
      const stepDuration = Math.round((rawWeights[i] / totalWeight) * durationMs);
      cumulativeTime += stepDuration;

      const currentItem = items[i];
      const stepProgress = (i + 1) / totalSteps;

      const tId = window.setTimeout(() => {
        setDisplayText(currentItem);
        setProgress(stepProgress);
        setAnimKey((k) => k + 1);
      }, cumulativeTime);

      timeoutIdsRef.current.push(tId);
    }

    return () => {
      clearAllTimers();
    };
  }, [isRolling, winnerGroup, safeCandidates, durationMs]);

  // Sizing helper
  const fontSizeClass = isSingle
    ? displayText.length > 18
      ? 'text-xl sm:text-2xl md:text-3xl'
      : 'text-2xl sm:text-3xl md:text-4xl'
    : isMedium
    ? displayText.length > 18
      ? 'text-base sm:text-xl'
      : 'text-lg sm:text-2xl'
    : 'text-sm sm:text-lg font-bold';

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden py-1">
      {/* Category Header */}
      <div className="relative z-20 flex items-center gap-1.5 text-[11px] sm:text-xs tracking-wider uppercase font-black text-amber-200 drop-shadow mb-1">
        <Building2 className="w-3.5 h-3.5 text-amber-300" />
        <span>단체 기관상 추첨</span>
        {isRolling && (
          <span
            className={`ml-1 text-[10px] px-2 py-0.2 rounded-full border font-bold transition-all ${
              progress > 0.8
                ? 'bg-rose-500/30 text-rose-300 border-rose-400/50 animate-pulse'
                : progress > 0.45
                ? 'bg-amber-500/30 text-amber-300 border-amber-400/40'
                : 'bg-amber-400/20 text-amber-300 border-amber-400/30'
            }`}
          >
            {progress > 0.8
              ? '🎯 최종 당첨 정렬 중...'
              : progress > 0.45
              ? '⏳ 서서히 감속 중...'
              : '⚡ 고속 롤링 중'}
          </span>
        )}
      </div>

      {/* Reel Window */}
      <div className="relative w-full flex-1 flex items-center justify-center min-h-[110px] sm:min-h-[140px] overflow-hidden">
        {/* Top/Bottom Gradient Shadows */}
        {isRolling && (
          <>
            <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent z-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-stone-950 via-stone-950/80 to-transparent z-20 pointer-events-none" />

            {/* Target Crosshair */}
            <div className="absolute inset-x-2 inset-y-2 rounded-2xl border-2 border-amber-400/50 bg-amber-400/5 pointer-events-none z-20 shadow-[0_0_20px_rgba(251,191,36,0.2)] flex items-center justify-between px-3">
              <span className="text-amber-400 text-xs sm:text-sm font-black">▶</span>
              <span className="text-amber-400 text-xs sm:text-sm font-black">◀</span>
            </div>
          </>
        )}

        {/* 1. Rolling State: Smooth upward slide */}
        {isRolling && (
          <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden px-3">
            <motion.div
              key={animKey}
              initial={{ y: 35, opacity: 0.4 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: progress > 0.75 ? 0.28 : 0.08,
                ease: progress > 0.75 ? 'easeOut' : 'linear',
              }}
              className="w-full text-center flex flex-col items-center justify-center"
            >
              <div
                className={`font-black tracking-tight leading-snug break-keep drop-shadow-md transition-all ${
                  progress > 0.85
                    ? 'text-amber-300 scale-105 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]'
                    : progress > 0.5
                    ? 'text-amber-200'
                    : 'text-amber-100/90'
                } ${fontSizeClass}`}
              >
                {displayText}
              </div>
            </motion.div>
          </div>
        )}

        {/* 2. Winner Completed State */}
        {!isRolling && isCompleted && winnerGroup && (
          <motion.div
            key="winner-celebration"
            initial={{ scale: 0.65, y: 25, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 18 }}
            className="relative z-10 w-full flex flex-col items-center justify-center px-4 text-center"
          >
            <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500/35 to-orange-500/35 backdrop-blur-xs text-amber-200 text-xs font-black mb-2 border border-amber-300/40 shadow-xs">
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
              <span>행운의 당첨 기관</span>
            </div>

            <h3
              className={`font-black text-white tracking-tight leading-snug drop-shadow-2xl break-keep ${fontSizeClass}`}
            >
              {winnerGroup}
            </h3>
          </motion.div>
        )}

        {/* 3. Idle State */}
        {!isRolling && !isCompleted && (
          <div className="relative z-10 flex flex-col items-center justify-center text-stone-400 font-bold text-sm sm:text-base space-y-1">
            <Building2 className="w-8 h-8 opacity-40 text-stone-400" />
            <span>추첨 대기 중</span>
          </div>
        )}
      </div>
    </div>
  );
};
