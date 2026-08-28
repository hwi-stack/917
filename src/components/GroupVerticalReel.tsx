import React, { useEffect, useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, Trophy, Sparkles } from 'lucide-react';
import { audioEngine } from '../utils/audio';

interface GroupVerticalReelProps {
  candidates: string[];
  winnerGroup: string | null;
  isRolling: boolean;
  isSingle: boolean;
  isMedium: boolean;
  isCompleted: boolean;
}

export const GroupVerticalReel: React.FC<GroupVerticalReelProps> = ({
  candidates = [],
  winnerGroup,
  isRolling,
  isSingle,
  isMedium,
  isCompleted,
}) => {
  // Ensure safe candidate list
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

  // Current display candidate while rolling
  const [currentDisplayItem, setCurrentDisplayItem] = useState<string>(() => {
    return winnerGroup || safeCandidates[0];
  });
  const [stepSpeed, setStepSpeed] = useState<number>(70);
  const [rollProgress, setRollProgress] = useState<number>(0);
  const [isFinalLocked, setIsFinalLocked] = useState<boolean>(false);

  // References for step execution
  const stepTimerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Step sequence generator (~7.2 seconds total duration)
  useEffect(() => {
    if (!isRolling) {
      if (stepTimerRef.current !== null) {
        clearTimeout(stepTimerRef.current);
        stepTimerRef.current = null;
      }
      if (winnerGroup) {
        setCurrentDisplayItem(winnerGroup);
      }
      setIsFinalLocked(isCompleted);
      return;
    }

    setIsFinalLocked(false);
    startTimeRef.current = Date.now();

    // Prepare candidate pool
    const otherCandidates = safeCandidates.filter((c) => c !== winnerGroup);
    const pool = otherCandidates.length > 0 ? otherCandidates : safeCandidates;

    // Total steps ~ 46 steps (Extended from ~4.2s to ~7.2s)
    const totalSteps = 46;
    const sequenceItems: string[] = [];

    for (let i = 0; i < totalSteps - 1; i++) {
      const randCand = pool[Math.floor(Math.random() * pool.length)];
      sequenceItems.push(randCand);
    }
    // Final step is strictly the designated winner
    sequenceItems.push(winnerGroup || safeCandidates[0]);

    // Compute step delays:
    // 0 ~ 26 steps: Fast rolling ~60ms to 90ms (approx 2.0s)
    // 27 ~ 38 steps: Gradual deceleration ~100ms to 280ms (approx 2.2s)
    // 39 ~ 45 steps: Deep suspense slow passing ~380ms to 780ms (approx 3.0s)
    const stepDelays: number[] = [];
    for (let i = 0; i < totalSteps; i++) {
      const t = i / (totalSteps - 1); // 0 -> 1
      // Non-linear cubic easing curve for dramatic deceleration
      const delay = 60 + Math.pow(t, 3.2) * 720;
      stepDelays.push(Math.round(delay));
    }

    let currentStep = 0;

    const executeNextStep = () => {
      if (currentStep >= totalSteps) {
        // Reached end of deceleration: Winner Locked!
        setCurrentDisplayItem(winnerGroup || sequenceItems[totalSteps - 1]);
        setIsFinalLocked(true);
        audioEngine.playDigitLock(2, 3);
        return;
      }

      const nextItem = sequenceItems[currentStep];
      setCurrentDisplayItem(nextItem);

      const progress = currentStep / (totalSteps - 1);
      setRollProgress(progress);
      setStepSpeed(stepDelays[currentStep]);

      // Play mechanical tick sound synchronized with wheel speed
      if (progress > 0.3) {
        audioEngine.playSlotTick(progress);
      }

      const delay = stepDelays[currentStep];
      currentStep++;

      stepTimerRef.current = window.setTimeout(executeNextStep, delay);
    };

    executeNextStep();

    return () => {
      if (stepTimerRef.current !== null) {
        clearTimeout(stepTimerRef.current);
        stepTimerRef.current = null;
      }
    };
  }, [isRolling, winnerGroup, safeCandidates, isCompleted]);

  // Dynamic font sizing
  const fontSizeClass = isSingle
    ? currentDisplayItem.length > 18
      ? 'text-xl sm:text-2xl md:text-3xl'
      : 'text-2xl sm:text-3xl md:text-4xl'
    : isMedium
    ? currentDisplayItem.length > 18
      ? 'text-base sm:text-xl'
      : 'text-lg sm:text-2xl'
    : 'text-sm sm:text-lg font-bold';

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden py-1">
      {/* Category Header with live status badge */}
      <div className="relative z-20 flex items-center gap-1.5 text-[11px] sm:text-xs tracking-wider uppercase font-black text-amber-200 drop-shadow mb-1">
        <Building2 className="w-3.5 h-3.5 text-amber-300" />
        <span>단체 기관상 추첨</span>
        {isRolling && (
          <span
            className={`ml-1 text-[10px] px-2 py-0.5 rounded-full border font-bold transition-all ${
              rollProgress > 0.75
                ? 'bg-rose-500/30 text-rose-300 border-rose-400/50 animate-pulse'
                : rollProgress > 0.45
                ? 'bg-amber-500/30 text-amber-300 border-amber-400/40'
                : 'bg-amber-400/20 text-amber-300 border-amber-400/30'
            }`}
          >
            {rollProgress > 0.8
              ? '🎯 최종 정렬 중...'
              : rollProgress > 0.45
              ? '⏳ 감속 중...'
              : '⚡ 고속 롤링 중'}
          </span>
        )}
      </div>

      {/* Main Display Window */}
      <div className="relative w-full flex-1 flex items-center justify-center min-h-[110px] sm:min-h-[140px] overflow-hidden">
        {/* Top/Bottom Gradient Shadows for Mechanical Depth */}
        {isRolling && (
          <>
            <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-stone-950 via-stone-950/85 to-transparent z-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-stone-950 via-stone-950/85 to-transparent z-20 pointer-events-none" />

            {/* Target Alignment Crosshairs */}
            <div className="absolute inset-x-2 inset-y-2 rounded-2xl border-2 border-amber-400/50 bg-amber-400/5 pointer-events-none z-20 shadow-[0_0_25px_rgba(251,191,36,0.25)] flex items-center justify-between px-3">
              <span className="text-amber-400 text-xs sm:text-sm font-black animate-pulse">▶</span>
              <span className="text-amber-400 text-xs sm:text-sm font-black animate-pulse">◀</span>
            </div>
          </>
        )}

        {/* 1. ROLLING STATE: Smooth Upward Scrolling with Decelerating Transition */}
        {isRolling && (
          <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden px-3">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={currentDisplayItem + rollProgress}
                initial={{ y: 55, opacity: 0.25, scale: 0.92 }}
                animate={{ y: 0, opacity: 1, scale: 1.02 }}
                exit={{ y: -55, opacity: 0.15, scale: 0.92 }}
                transition={{
                  duration: Math.max(0.06, (stepSpeed / 1000) * 0.92),
                  ease: rollProgress > 0.65 ? 'easeOut' : 'linear',
                }}
                className="w-full text-center flex flex-col items-center justify-center"
              >
                <div
                  className={`font-black tracking-tight leading-snug break-keep drop-shadow-md transition-all ${
                    rollProgress > 0.82
                      ? 'text-amber-300 scale-105 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                      : rollProgress > 0.5
                      ? 'text-amber-200 scale-100'
                      : 'text-amber-100/90'
                  } ${fontSizeClass}`}
                >
                  {currentDisplayItem}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* 2. COMPLETED WINNER STATE: Celebratory Spring Entrance */}
        {!isRolling && isCompleted && winnerGroup && (
          <motion.div
            key="group-winner-celebrate"
            initial={{ scale: 0.55, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 360, damping: 16 }}
            className="relative z-10 w-full flex flex-col items-center justify-center px-4 text-center"
          >
            <motion.div
              animate={{ y: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500/35 to-orange-500/35 backdrop-blur-xs text-amber-200 text-xs font-black mb-2 border border-amber-300/40 shadow-xs"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
              <span>행운의 당첨 기관</span>
            </motion.div>

            <h3
              className={`font-black text-white tracking-tight leading-snug drop-shadow-2xl break-keep ${fontSizeClass}`}
            >
              {winnerGroup}
            </h3>
          </motion.div>
        )}

        {/* 3. IDLE / WAITING STATE */}
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
