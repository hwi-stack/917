import React, { useEffect, useState } from 'react';
import { Sparkles, RotateCcw, CheckCircle2, Building2 } from 'lucide-react';
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
  totalInTier: number;
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
  totalInTier,
}) => {
  // Rolling random states
  const [randomDigits, setRandomDigits] = useState<string[]>(['0', '0', '0']);
  const [randomGroupName, setRandomGroupName] = useState<string>('추첨 대기 중');

  // Format winner number as 3 digits string array e.g. ['2', '4', '6']
  const winnerDigits = winnerNumber !== null ? String(winnerNumber).padStart(3, '0').split('') : null;

  useEffect(() => {
    let interval: number;

    if (isRolling) {
      interval = window.setInterval(() => {
        if (drawType === 'number') {
          const maxHundreds = Math.floor(maxNumber / 100);
          const r0 = String(Math.floor(Math.random() * (maxHundreds + 1)));
          const r1 = String(Math.floor(Math.random() * 10));
          const r2 = String(Math.floor(Math.random() * 10));
          setRandomDigits([r0, r1, r2]);
        } else {
          if (groupCandidates.length > 0) {
            const rand = groupCandidates[Math.floor(Math.random() * groupCandidates.length)];
            setRandomGroupName(rand);
          } else {
            setRandomGroupName('단체 기관 추첨 중...');
          }
        }
      }, 50);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isRolling, drawType, maxNumber, groupCandidates]);

  const isSingle = totalInTier === 1;
  const isMedium = totalInTier <= 3;
  const isCompleted =
    (drawType === 'number' && winnerNumber !== null && (!isRolling || revealedDigitsCount >= 3)) ||
    (drawType === 'group' && winnerGroup !== null && !isRolling);

  return (
    <motion.div
      id={`slot-card-${index}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      className={`relative flex flex-col items-center justify-between rounded-2xl transition-all duration-300 ${
        isSingle
          ? 'w-full max-w-lg p-6 sm:p-8 bg-gradient-to-b from-white via-amber-50/60 to-orange-50/50 shadow-2xl border-4 border-amber-400/90 ring-8 ring-amber-200/50'
          : isMedium
          ? 'w-full p-5 sm:p-6 bg-gradient-to-b from-white via-amber-50/50 to-orange-50/40 shadow-xl border-3 border-amber-300/90 ring-4 ring-amber-200/40'
          : 'w-full p-4 bg-gradient-to-b from-white to-amber-50/40 shadow-lg border-2 border-amber-200/80'
      }`}
    >
      {/* Card Header Tag */}
      <div className="w-full flex items-center justify-between mb-2">
        <span
          id={`slot-badge-${index}`}
          className={`inline-flex items-center gap-1 font-semibold rounded-full ${
            isSingle
              ? 'px-4 py-1 text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
              : 'px-3 py-0.5 text-xs bg-amber-100 text-amber-900 font-medium'
          }`}
        >
          {drawType === 'group' ? <Building2 className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
          {drawType === 'group'
            ? totalInTier > 1
              ? `당첨 단체 ${index + 1}`
              : '당첨 단체'
            : totalInTier > 1
            ? `당첨자 ${index + 1}`
            : '당첨자'}
        </span>

        {isCompleted && (
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            당첨 확정
          </span>
        )}
      </div>

      {/* Main Display Box */}
      <div
        className={`w-full relative flex items-center justify-center rounded-2xl overflow-hidden select-none transition-all duration-300 ${
          isRolling && (!winnerDigits || revealedDigitsCount < 3)
            ? 'bg-gradient-to-b from-stone-900 via-amber-950 to-stone-900 text-amber-300 shadow-inner'
            : isCompleted
            ? 'bg-gradient-to-b from-amber-500 via-orange-500 to-rose-500 text-white shadow-xl shadow-orange-500/25'
            : 'bg-stone-100/90 text-stone-400 border-2 border-dashed border-stone-300'
        } ${isSingle ? 'min-h-[160px] sm:min-h-[190px] my-3 p-4' : isMedium ? 'min-h-[130px] sm:min-h-[160px] my-2 p-3' : 'min-h-[110px] sm:min-h-[130px] my-1 p-2'}`}
      >
        {/* Animated Glow Backdrop */}
        {isRolling && (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent animate-pulse" />
        )}

        {/* 1. NUMBER DRAW VIEW WITH SEQUENTIAL DIGIT REVEAL (자리수별 순차 공개) */}
        {drawType === 'number' && (
          <div className="relative z-10 flex flex-col items-center justify-center w-full">
            <span className="text-[10px] sm:text-xs tracking-widest uppercase opacity-80 mb-1 font-medium text-amber-200">
              LUCKY TICKET NO.
            </span>

            <div className="flex items-center justify-center gap-1.5 sm:gap-3">
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
                        ? { scale: [1.25, 1], filter: ['brightness(1.4)', 'brightness(1)'] }
                        : {}
                    }
                    transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                    className={`relative flex items-center justify-center font-black rounded-xl select-none transition-all duration-200 ${
                      isDigitLocked
                        ? 'bg-white/20 text-white border-2 border-white/60 shadow-lg shadow-amber-950/20 ring-2 ring-white/30 backdrop-blur-xs'
                        : isRolling
                        ? 'bg-amber-900/60 text-amber-300 border border-amber-600/40 shadow-inner'
                        : 'bg-stone-200 text-stone-400'
                    } ${
                      isSingle
                        ? 'w-16 h-24 sm:w-22 sm:h-32 text-5xl sm:text-7xl md:text-8xl'
                        : isMedium
                        ? 'w-12 h-18 sm:w-16 sm:h-24 text-4xl sm:text-5xl md:text-6xl'
                        : 'w-10 h-14 sm:w-12 sm:h-18 text-3xl sm:text-4xl'
                    }`}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    <AnimatePresence mode="popLayout">
                      <motion.span
                        key={currentDigitChar + (isDigitLocked ? '-locked' : '-roll')}
                        initial={{ y: isDigitLocked ? -20 : -10, opacity: 0.7 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        transition={{ duration: 0.08 }}
                      >
                        {currentDigitChar}
                      </motion.span>
                    </AnimatePresence>
                  </motion.div>
                );
              })}

              {/* Unit Tag '번' */}
              <span
                className={`font-black ml-1 text-white/90 drop-shadow ${
                  isSingle ? 'text-3xl sm:text-4xl' : isMedium ? 'text-2xl sm:text-3xl' : 'text-xl'
                }`}
              >
                번
              </span>
            </div>
          </div>
        )}

        {/* 2. GROUP PRIZE VIEW (단체상 기관명 표시 - 위로 계속 올라가는 드롭다운/슬롯 릴 애니메이션) */}
        {drawType === 'group' && (
          <GroupVerticalReel
            candidates={groupCandidates}
            winnerGroup={winnerGroup}
            isRolling={isRolling}
            isSingle={isSingle}
            isMedium={isMedium}
            isCompleted={isCompleted}
          />
        )}

        {/* Shimmer Light Flare on completion */}
        {isCompleted && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 animate-[shimmer_2s_infinite]" />
        )}
      </div>

      {/* Footer Info / Redraw Action */}
      <div className="w-full flex items-center justify-between pt-2 border-t border-stone-200/70 mt-1">
        <span className="text-xs text-stone-500 font-medium truncate max-w-[150px] sm:max-w-[220px]">
          {prizeName}
        </span>

        {isCompleted && (
          <button
            id={`btn-redraw-${index}`}
            onClick={() => {
              if (drawType === 'number' && onRedrawNumber) {
                onRedrawNumber(index);
              } else if (drawType === 'group' && onRedrawGroup) {
                onRedrawGroup(index);
              }
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200 transition-colors cursor-pointer"
            title="당첨자가 부재중이거나 취소 시 이 번호/기관만 다시 추첨합니다"
          >
            <RotateCcw className="w-3 h-3" />
            재추첨
          </button>
        )}
      </div>
    </motion.div>
  );
};
