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

  // Step sequence generator
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

    // Prepare fixed sequence of steps that ends with winnerGroup
    const otherCandidates = safeCandidates.filter((c) => c !== winnerGroup);
    const pool = otherCandidates.length > 0 ? otherCandidates : safeCandidates;

    // Generate ~32 steps with increasing delays (deceleration)
    const sequenceItems: string[] = [];
    const totalSteps = 28;

    for (let i = 0; i < totalSteps - 1; i++) {
      const randCand = pool[Math.floor(Math.random() * pool.length)];
      sequenceItems.push(randCand);
    }
    // Final item is always the winner
    sequenceItems.push(winnerGroup || safeCandidates[0]);

    // Compute delay curve (easing out): fast at first (55ms), then easing to ~650ms at the end
    // Duration total ~ 4.2s
    const stepDelays: number[] = [];
    for (let i = 0; i < totalSteps; i++) {
      const t = i / (totalSteps - 1); // 0 -> 1
      // Quadratic/cubic ease-out curve
      const delay = 55 + Math.pow(t, 2.8) * 600;
      stepDelays.push(Math.round(delay));
    }

    let currentStep = 0;

    const executeNextStep = () => {
      if (currentStep >= totalSteps) {
        // Finished deceleration sequence, locked on winner!
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

      // Play tick sound that adjusts pitch & volume with deceleration
      if (progress > 0.4) {
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

  // Height and font sizing
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
      {/* Category Header */}
      <div className="relative z-20 flex items-center gap-1.5 text-[11px] sm:text-xs tracking-wider uppercase font-black text-amber-200 drop-shadow mb-1">
        <Building2 className="w-3.5 h-3.5 text-amber-300" />
        <span>단체 기관상 추첨</span>
        {isRolling && (
          <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 animate-pulse font-semibold">
            {rollProgress > 0.75 ? '감속 중...' : '롤링 중...'}
          </span>
        )}
      </div>

      {/* Main Display Window */}
      <div className="relative w-full flex-1 flex items-center justify-center min-h-[105px] sm:min-h-[135px] overflow-hidden">
        {/* Top/Bottom Gradient Shadows for Mechanical Depth */}
        {isRolling && (
          <>
            <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent z-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-stone-950 via-stone-950/80 to-transparent z-20 pointer-events-none" />

            {/* Target Alignment Crosshairs */}
            <div className="absolute inset-x-3 inset-y-2 rounded-2xl border-2 border-amber-400/50 bg-amber-400/5 pointer-events-none z-20 shadow-[0_0_20px_rgba(251,191,36,0.2)] flex items-center justify-between px-3">
              <span className="text-amber-400 text-xs font-black">▶</span>
              <span className="text-amber-400 text-xs font-black">◀</span>
            </div>
          </>
        )}

        {/* 1. ROLLING STATE: Smooth Upward Scrolling with Decelerating Transition */}
        {isRolling && (
          <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden px-4">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={currentDisplayItem + rollProgress}
                initial={{ y: 55, opacity: 0.25, scale: 0.92 }}
                animate={{ y: 0, opacity: 1, scale: 1.02 }}
                exit={{ y: -55, opacity: 0.15, scale: 0.92 }}
                transition={{
                  duration: Math.max(0.06, (stepSpeed / 1000) * 0.9),
                  ease: rollProgress > 0.7 ? 'easeOut' : 'linear',
                }}
                className="w-full text-center flex flex-col items-center justify-center"
              >
                <div
                  className={`font-black tracking-tight leading-snug break-keep drop-shadow-md transition-colors ${
                    rollProgress > 0.8
                      ? 'text-amber-300 scale-105'
                      : 'text-amber-200/90'
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
            initial={{ scale: 0.6, y: 35, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 17 }}
            className="relative z-10 w-full flex flex-col items-center justify-center px-4 text-center"
          >
            <motion.div
              animate={{ y: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/30 to-orange-500/30 backdrop-blur-xs text-amber-200 text-xs font-black mb-2 border border-amber-300/40 shadow-xs"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
              <span>행운의 당첨 기관</span>
            </motion.div>

            <h3
              className={`font-black text-white tracking-tight leading-snug drop-shadow-xl break-keep ${fontSizeClass}`}
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
