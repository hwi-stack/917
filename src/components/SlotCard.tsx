import React, { useEffect, useState } from 'react';
import { Sparkles, RotateCcw, CheckCircle2, Building2, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DrawType } from '../types';
import { GroupVerticalReel } from './GroupVerticalReel';

interface SlotCardProps {
  index: number;
  drawType: DrawType;
  winnerNumber: number | null;
  winnerGroup: string | null;
  isRolling: boolean;
  revealedDigitsCount: number; // 0: all rolling, 1: 1st digit locked, 2: 1st & 2nd locked, 3: all locked
  minNumber: number;
  maxNumber: number;
  groupCandidates?: string[];
  onRedrawNumber?: (index: number) => void;
  onRedrawGroup?: (index: number) => void;
  prizeName: string;
  itemLabel?: string; // Specific item for this slot e.g. "에어프라이기", "믹서기"
  totalInTier: number;
  rollDurationMs?: number;
}

export const SlotCard: React.FC<SlotCardProps> = ({
  index,
  drawType,
  winnerNumber,
  winnerGroup,
  isRolling,
  revealedDigitsCount,
  minNumber,
  maxNumber,
  groupCandidates = [],
  onRedrawNumber,
  onRedrawGroup,
  prizeName,
  itemLabel,
  totalInTier,
  rollDurationMs = 7000,
}) => {
  // Rolling random states
  const [randomDigits, setRandomDigits] = useState<string[]>(['0', '0', '0']);

  // Format winner number as 3 digits string array e.g. ['2', '4', '6']
  const winnerDigits = winnerNumber !== null ? String(winnerNumber).padStart(3, '0').split('') : null;

  useEffect(() => {
    let interval: number;

    if (isRolling && drawType === 'number') {
      interval = window.setInterval(() => {
        const maxHundreds = Math.floor(maxNumber / 100);
        const r0 = String(Math.floor(Math.random() * (maxHundreds + 1)));
        const r1 = String(Math.floor(Math.random() * 10));
        const r2 = String(Math.floor(Math.random() * 10));
        setRandomDigits([r0, r1, r2]);
      }, 50);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRolling, drawType, maxNumber]);

  const isSingle = totalInTier === 1;
  const isTwo = totalInTier === 2;
  const isThree = totalInTier === 3;
  const isLargeTier = totalInTier >= 7; // e.g. 11 winners
  const isCompleted =
    (drawType === 'number' && winnerNumber !== null && (!isRolling || revealedDigitsCount >= 3)) ||
    (drawType === 'group' && winnerGroup !== null && !isRolling);

  return (
    <motion.div
      id={`slot-card-${index}`}
      initial={{ opacity: 0, y: 15 }}
      animate={
        isCompleted
          ? {
              opacity: 1,
              y: 0,
              scale: isSingle ? [1, 1.05, 1.02] : isTwo ? [1, 1.03, 1.01] : 1,
            }
          : { opacity: 1, y: 0, scale: 1 }
      }
      transition={
        isCompleted
          ? {
              duration: 0.5,
              ease: 'easeOut',
              times: [0, 0.4, 1],
            }
          : { duration: 0.3, delay: index * 0.04 }
      }
      className={`relative flex flex-col items-center justify-between rounded-3xl transition-all duration-300 w-full ${
        isCompleted
          ? isSingle
            ? 'max-w-3xl sm:max-w-4xl p-6 sm:p-10 lg:p-12 bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 shadow-2xl shadow-orange-500/30 border-4 border-amber-400 ring-6 ring-amber-300/60 z-20'
            : isTwo
            ? 'p-5 sm:p-7 lg:p-8 bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 shadow-xl shadow-orange-500/25 border-3 sm:border-4 border-amber-400 ring-4 ring-amber-300/50 z-20'
            : isThree
            ? 'p-4 sm:p-5 bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 shadow-xl shadow-orange-500/20 border-2 sm:border-3 border-amber-400 ring-3 ring-amber-300/40 z-20'
            : isLargeTier
            ? 'p-1.5 sm:p-2 md:p-2.5 rounded-2xl bg-gradient-to-b from-amber-50 to-orange-100 shadow-md shadow-orange-500/15 border-2 border-amber-400 ring-1 ring-amber-300/30 z-20'
            : 'p-2.5 sm:p-3 bg-gradient-to-b from-amber-50 to-orange-100 shadow-lg shadow-orange-500/20 border-2 border-amber-400 ring-2 ring-amber-300/30 z-20'
          : isSingle
          ? 'max-w-3xl sm:max-w-4xl p-6 sm:p-9 lg:p-10 bg-gradient-to-b from-white via-amber-50/60 to-orange-50/50 shadow-xl border-3 border-amber-300/80 ring-4 ring-amber-100'
          : isTwo
          ? 'p-5 sm:p-6 lg:p-7 bg-gradient-to-b from-white via-amber-50/50 to-orange-50/40 shadow-lg border-2 sm:border-3 border-amber-200'
          : isThree
          ? 'p-3.5 sm:p-4 bg-gradient-to-b from-white to-stone-50/70 shadow-md border border-amber-200/80'
          : isLargeTier
          ? 'p-1.5 sm:p-2 md:p-2.5 rounded-2xl bg-gradient-to-b from-white to-stone-50/60 shadow-2xs border border-stone-200'
          : 'p-2.5 sm:p-3 bg-gradient-to-b from-white to-stone-50/60 shadow-xs border border-stone-200'
      }`}
    >
      {/* Card Header Tag */}
      <div className="w-full flex items-center justify-between mb-1 px-0.5">
        {itemLabel ? (
          <span
            id={`slot-badge-${index}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs sm:text-sm font-black rounded-full bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white shadow-md ring-2 ring-amber-300/60 tracking-tight"
          >
            <Gift className="w-3.5 h-3.5 text-yellow-200 shrink-0" />
            <span>{itemLabel}</span>
          </span>
        ) : (
          <span
            id={`slot-badge-${index}`}
            className={`inline-flex items-center gap-1 font-bold rounded-full ${
              isCompleted
                ? isSingle
                  ? 'px-3.5 py-1 text-xs sm:text-sm bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white shadow-xs'
                  : 'px-2.5 sm:px-3 py-0.5 text-xs sm:text-sm bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white shadow-xs'
                : isSingle
                ? 'px-3.5 py-1 text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                : isLargeTier
                ? 'px-2 py-0.5 text-[10px] sm:text-xs bg-amber-100 text-amber-900 font-bold'
                : 'px-2.5 py-0.5 text-[11px] sm:text-xs bg-amber-100 text-amber-900 font-semibold'
            }`}
          >
            {drawType === 'group' ? <Building2 className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
            {drawType === 'group'
              ? totalInTier > 1
                ? `당첨 단체 ${index + 1}`
                : '당첨 단체'
              : totalInTier > 1
              ? `당첨자 ${index + 1}`
              : '당첨자'}
          </span>
        )}

        {isCompleted && (
          <span
            className={`flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 rounded-full border border-emerald-300 ${
              isLargeTier
                ? 'px-1.5 py-0 text-[10px]'
                : 'px-2 sm:px-2.5 py-0.5 text-[11px] sm:text-xs'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>당첨 확정</span>
          </span>
        )}
      </div>

      {/* Main Display Box */}
      <div
        className={`w-full relative flex items-center justify-center rounded-2xl overflow-hidden select-none transition-all duration-300 ${
          isRolling && (!winnerDigits || revealedDigitsCount < 3)
            ? 'bg-gradient-to-b from-stone-900 via-amber-950 to-stone-900 text-amber-300 shadow-inner ring-2 ring-amber-500/50'
            : isCompleted
            ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white shadow-xl shadow-orange-500/30 ring-2 sm:ring-4 ring-white/60'
            : 'bg-stone-100/90 text-stone-400 border-2 border-dashed border-stone-300'
        } ${
          isSingle
            ? 'min-h-[190px] sm:min-h-[230px] lg:min-h-[260px] my-2 p-3 sm:p-6'
            : isTwo
            ? 'min-h-[150px] sm:min-h-[190px] lg:min-h-[210px] my-1.5 p-2.5 sm:p-4'
            : isThree
            ? 'min-h-[110px] sm:min-h-[140px] my-1 p-2 sm:p-3'
            : isLargeTier
            ? 'min-h-[78px] sm:min-h-[88px] md:min-h-[98px] lg:min-h-[108px] my-0.5 p-1 sm:p-1.5'
            : 'min-h-[85px] sm:min-h-[105px] my-1 p-1.5'
        }`}
      >
        {/* Animated Background Rays on Winner Reveal */}
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-300/40 via-orange-400/20 to-transparent pointer-events-none"
          />
        )}

        {/* Animated Glow Backdrop during roll */}
        {isRolling && (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400/25 via-transparent to-transparent animate-pulse" />
        )}

        {/* 1. NUMBER DRAW VIEW WITH SEQUENTIAL DIGIT REVEAL */}
        {drawType === 'number' && (
          <div className="relative z-10 flex flex-col items-center justify-center w-full px-1">
            {/* Prominent Per-Slot Item Badge directly ABOVE the numbers (for 4등: 에어프라이기, 믹서기) */}
            {itemLabel && (
              <motion.div
                initial={{ scale: 0.88, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-xl font-black mb-2 shadow-md border transition-all ${
                  isCompleted
                    ? 'bg-amber-950/70 text-amber-100 border-amber-300 ring-2 ring-amber-300/50 px-4 sm:px-5 py-1 sm:py-1.5 text-sm sm:text-base md:text-lg'
                    : isRolling
                    ? 'bg-amber-900/80 text-amber-200 border-amber-400 ring-2 ring-amber-400/40 px-4 sm:px-5 py-1 sm:py-1.5 text-sm sm:text-base md:text-lg'
                    : 'bg-white text-stone-900 border-amber-400 ring-2 ring-amber-300/50 px-4 sm:px-5 py-1 sm:py-1.5 text-sm sm:text-base md:text-lg'
                }`}
              >
                <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
                <span className="tracking-tight font-black">{itemLabel}</span>
              </motion.div>
            )}

            {/* 3-Digit Containers */}
            <div className={`flex items-center justify-center ${isLargeTier ? 'gap-0.5 sm:gap-1 md:gap-1.5' : 'gap-1 sm:gap-2'} max-w-full overflow-hidden`}>
              {[0, 1, 2].map((digitIdx) => {
                // Determine whether this specific digit is locked/revealed
                const isDigitLocked =
                  winnerDigits !== null &&
                  (!isRolling || revealedDigitsCount > digitIdx);

                const currentDigitChar = isDigitLocked
                  ? winnerDigits[digitIdx]
                  : isRolling
                  ? randomDigits[digitIdx]
                  : '-';

                return (
                  <motion.div
                    key={`digit-reel-${index}-${digitIdx}`}
                    animate={
                      isDigitLocked
                        ? {
                            scale: isCompleted ? [1.15, 1] : 1,
                          }
                        : {}
                    }
                    transition={{ type: 'spring', stiffness: 450, damping: 16 }}
                    className={`relative flex items-center justify-center font-black rounded-xl sm:rounded-2xl select-none transition-all duration-200 shrink-0 ${
                      isDigitLocked
                        ? isCompleted
                          ? 'bg-white/25 text-white border-2 sm:border-3 border-white/90 shadow-lg shadow-amber-950/30 ring-2 sm:ring-3 ring-yellow-300/50 backdrop-blur-xs'
                          : 'bg-white/20 text-white border sm:border-2 border-white/60 shadow-md shadow-amber-950/20 ring-1 sm:ring-2 ring-white/30 backdrop-blur-xs'
                        : isRolling
                        ? 'bg-amber-900/70 text-amber-300 border border-amber-500/50 shadow-inner'
                        : 'bg-stone-200 text-stone-400'
                    } ${
                      isSingle
                        ? 'w-20 h-28 sm:w-32 sm:h-44 md:w-36 md:h-48 text-6xl sm:text-8xl md:text-9xl'
                        : isTwo
                        ? 'w-16 h-22 sm:w-24 sm:h-34 md:w-28 md:h-38 text-5xl sm:text-7xl md:text-8xl'
                        : isThree
                        ? 'w-11 h-16 sm:w-16 sm:h-24 md:w-20 md:h-28 text-4xl sm:text-5xl md:text-6xl'
                        : isLargeTier
                        ? 'w-8 h-11 sm:w-9 sm:h-13 md:w-10 md:h-14 lg:w-11 lg:h-15 xl:w-12 xl:h-16 text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl rounded-lg sm:rounded-xl'
                        : 'w-8 h-12 sm:w-11 sm:h-16 md:w-13 md:h-18 text-2xl sm:text-3xl md:text-4xl'
                    }`}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    <AnimatePresence mode="popLayout">
                      <motion.span
                        key={currentDigitChar + (isDigitLocked ? '-locked' : '-roll')}
                        initial={{ y: isDigitLocked ? -15 : -8, opacity: 0.6 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 15, opacity: 0 }}
                        transition={{ duration: 0.08 }}
                        className="drop-shadow-md leading-none flex items-center justify-center"
                      >
                        {currentDigitChar}
                      </motion.span>
                    </AnimatePresence>
                  </motion.div>
                );
              })}

              {/* Unit Tag '번' */}
              <span
                className={`font-black ml-0.5 sm:ml-1 text-white drop-shadow-md shrink-0 leading-none ${
                  isSingle
                    ? 'text-4xl sm:text-6xl md:text-7xl'
                    : isTwo
                    ? 'text-3xl sm:text-5xl md:text-6xl'
                    : isThree
                    ? 'text-2xl sm:text-4xl'
                    : isLargeTier
                    ? 'text-xs sm:text-sm md:text-base lg:text-lg'
                    : 'text-base sm:text-xl'
                }`}
              >
                번
              </span>
            </div>

            {/* When drawn, clearly confirm which item this number won */}
            {itemLabel && isCompleted && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-0.5 rounded-full bg-black/40 border border-white/30 text-amber-200 font-extrabold text-xs sm:text-sm tracking-tight shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>{itemLabel} 당첨!</span>
              </motion.div>
            )}
          </div>
        )}

        {/* 2. GROUP PRIZE VIEW */}
        {drawType === 'group' && (
          <GroupVerticalReel
            candidates={groupCandidates}
            winnerGroup={winnerGroup}
            isRolling={isRolling}
            isSingle={isSingle}
            isMedium={isTwo || isThree}
            isCompleted={isCompleted}
            durationMs={rollDurationMs}
          />
        )}

        {/* Dynamic Sweeping Shimmer Light Bar on completion */}
        {isCompleted && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-[shimmer_2s_infinite] pointer-events-none" />
        )}
      </div>

      {/* Redraw Action Button (ONLY when completed, no small text underneath) */}
      {isCompleted && (
        <div className="w-full flex items-center justify-end pt-0.5 mt-0.5 px-0.5">
          <button
            id={`btn-redraw-${index}`}
            onClick={() => {
              if (drawType === 'number' && onRedrawNumber) {
                onRedrawNumber(index);
              } else if (drawType === 'group' && onRedrawGroup) {
                onRedrawGroup(index);
              }
            }}
            className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-lg border border-rose-300 shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="당첨자가 부재중이거나 취소 시 이 번호/기관만 다시 추첨합니다"
          >
            <RotateCcw className="w-3 h-3 text-rose-600" />
            <span>재추첨</span>
          </button>
        </div>
      )}
    </motion.div>
  );
};
