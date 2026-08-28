import React, { useState, useEffect, useRef } from 'react';
import { PrizeTier, DrawRecord, LotteryConfig } from '../types';
import { SlotCard } from './SlotCard';
import { Sparkles, Gift, Play, RotateCcw, PartyPopper, Building2 } from 'lucide-react';
import { audioEngine } from '../utils/audio';
import { triggerFestiveConfetti } from '../utils/confetti';
import { motion } from 'motion/react';
import { DEFAULT_GROUP_CANDIDATES } from '../utils/storage';

interface DrawStageProps {
  activePrize: PrizeTier;
  config: LotteryConfig;
  records: DrawRecord[];
  onSaveDrawResults: (prizeId: string, items: { ticketNumber?: number; groupName?: string }[]) => void;
  onRedrawSingle: (
    prizeId: string,
    oldItem: { ticketNumber?: number; groupName?: string },
    newItem: { ticketNumber?: number; groupName?: string }
  ) => void;
  onResetTierRecords: (prizeId: string) => void;
}

export const DrawStage: React.FC<DrawStageProps> = ({
  activePrize,
  config,
  records,
  onSaveDrawResults,
  onRedrawSingle,
  onResetTierRecords,
}) => {
  const [isRolling, setIsRolling] = useState(false);
  const [revealedDigitsCount, setRevealedDigitsCount] = useState<number>(3); // 0, 1, 2, 3
  const [showCelebrateBanner, setShowCelebrateBanner] = useState(false);

  // Temporary candidate winners held during active roll before final save
  const [rollingTargetWinners, setRollingTargetWinners] = useState<{
    numbers?: number[];
    groups?: string[];
  }>({});

  // Individual slot being redrawn
  const [redrawingSlotIndex, setRedrawingSlotIndex] = useState<number | null>(null);

  const timerRefs = useRef<number[]>([]);

  const clearAllTimers = () => {
    timerRefs.current.forEach((id) => clearTimeout(id));
    timerRefs.current = [];
  };

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  // Filter records for the current active prize
  const tierRecords = records.filter(
    (r) => r.prizeId === activePrize.id && !r.isCancelled
  );

  const isDrawn = tierRecords.length >= activePrize.winnerCount;
  const drawType = activePrize.drawType || 'number';

  // Available pool of numbers (1~700)
  const getAvailableNumberPool = (excludeCurrentTier: number[] = []): number[] => {
    const pool: number[] = [];
    const drawnSet = new Set(
      config.allowDuplicates
        ? []
        : records
            .filter((r) => !r.isCancelled && r.ticketNumber !== undefined)
            .map((r) => r.ticketNumber as number)
    );
    const excludeSet = new Set([...config.excludedNumbers, ...excludeCurrentTier]);

    for (let i = config.minNumber; i <= config.maxNumber; i++) {
      if (!excludeSet.has(i) && !drawnSet.has(i)) {
        pool.push(i);
      }
    }
    return pool;
  };

  // Available pool of group candidates
  const getAvailableGroupPool = (excludeCurrentTier: string[] = []): string[] => {
    const candidates = activePrize.groupCandidates && activePrize.groupCandidates.length > 0
      ? activePrize.groupCandidates
      : DEFAULT_GROUP_CANDIDATES;

    const drawnSet = new Set(
      config.allowDuplicates
        ? []
        : records
            .filter((r) => !r.isCancelled && r.groupName)
            .map((r) => r.groupName as string)
    );
    const excludeSet = new Set(excludeCurrentTier);

    return candidates.filter((name) => !excludeSet.has(name) && !drawnSet.has(name));
  };

  // MAIN DRAW EXECUTION (동시 추첨 & 번호 순차 공개 2 -> 4 -> 6)
  const handleStartDraw = () => {
    if (isRolling) return;
    clearAllTimers();

    const neededCount = activePrize.winnerCount;

    if (drawType === 'number') {
      const pool = getAvailableNumberPool();
      if (pool.length < neededCount) {
        alert(
          `추첨 가능한 잔여 번호가 부족합니다.\n필요: ${neededCount}명, 현재 잔여 번호: ${pool.length}개\n(관리자 설정에서 번호 범위를 확인해주세요)`
        );
        return;
      }

      // Pick unique random winners
      const selectedWinners: number[] = [];
      const tempPool = [...pool];
      for (let i = 0; i < neededCount; i++) {
        const randIdx = Math.floor(Math.random() * tempPool.length);
        selectedWinners.push(tempPool[randIdx]);
        tempPool.splice(randIdx, 1);
      }

      setRollingTargetWinners({ numbers: selectedWinners });
      setIsRolling(true);
      setRevealedDigitsCount(0);
      setShowCelebrateBanner(false);

      const rollSec = config.rollDurationSeconds || 3;
      audioEngine.startSuspense(rollSec + 2.5, false);

      // Phase 1: Fast initial roll duration (e.g. 2.5s)
      const t1 = window.setTimeout(() => {
        // Step 1: Reveal Hundreds Digit (백의 자리)
        setRevealedDigitsCount(1);
        audioEngine.playDigitLock(0, 3);

        // Step 2: Reveal Tens Digit (십의 자리) after 800ms
        const t2 = window.setTimeout(() => {
          setRevealedDigitsCount(2);
          audioEngine.playDigitLock(1, 3);

          // Step 3: Reveal Units Digit (일의 자리 - 최종 당첨!) after 850ms
          const t3 = window.setTimeout(() => {
            setRevealedDigitsCount(3);
            setIsRolling(false);
            audioEngine.playDigitLock(2, 3);
            audioEngine.playFanfare();
            triggerFestiveConfetti();
            setShowCelebrateBanner(true);

            onSaveDrawResults(
              activePrize.id,
              selectedWinners.map((num) => ({ ticketNumber: num }))
            );
          }, 850);
          timerRefs.current.push(t3);
        }, 800);
        timerRefs.current.push(t2);
      }, rollSec * 1000);

      timerRefs.current.push(t1);
    } else {
      // GROUP DRAW (단체상)
      const pool = getAvailableGroupPool();
      if (pool.length < neededCount) {
        alert(
          `등록된 단체 기관명이 부족합니다.\n필요: ${neededCount}곳, 현재 잔여 기관: ${pool.length}곳\n(관리자 설정에서 단체 기관명을 등록해주세요)`
        );
        return;
      }

      const selectedGroups: string[] = [];
      const tempPool = [...pool];
      for (let i = 0; i < neededCount; i++) {
        const randIdx = Math.floor(Math.random() * tempPool.length);
        selectedGroups.push(tempPool[randIdx]);
        tempPool.splice(randIdx, 1);
      }

      setRollingTargetWinners({ groups: selectedGroups });
      setIsRolling(true);
      setShowCelebrateBanner(false);

      // Group draw: extended by ~3.0 seconds (Total ~7.3s for grand tension deceleration)
      const rollSec = Math.max(7.3, (config.rollDurationSeconds || 4.2) + 3.1);
      audioEngine.startSuspense(rollSec, true);

      const t1 = window.setTimeout(() => {
        setIsRolling(false);
        audioEngine.playFanfare();
        triggerFestiveConfetti();
        setShowCelebrateBanner(true);

        onSaveDrawResults(
          activePrize.id,
          selectedGroups.map((g) => ({ groupName: g }))
        );
      }, rollSec * 1000);

      timerRefs.current.push(t1);
    }
  };

  // REDRAW SINGLE WINNER (개별 재추첨 - 자리수 순차 공개 적용)
  const handleRedrawSingle = (slotIndex: number) => {
    if (isRolling) return;
    clearAllTimers();

    const currentRecord = tierRecords[slotIndex];
    if (!currentRecord) return;

    if (drawType === 'number') {
      const oldNumber = currentRecord.ticketNumber;
      if (oldNumber === undefined) return;

      const currentNumbers = tierRecords.map((r) => r.ticketNumber as number);
      const pool = getAvailableNumberPool(currentNumbers);
      if (pool.length === 0) {
        return;
      }

      const randIdx = Math.floor(Math.random() * pool.length);
      const newNumber = pool[randIdx];

      setRedrawingSlotIndex(slotIndex);
      setRollingTargetWinners((prev) => {
        const currentNums = [...(prev.numbers || currentNumbers)];
        currentNums[slotIndex] = newNumber;
        return { ...prev, numbers: currentNums };
      });

      setIsRolling(true);
      setRevealedDigitsCount(0);
      audioEngine.startSuspense(4.0);

      const t1 = window.setTimeout(() => {
        setRevealedDigitsCount(1);
        audioEngine.playDigitLock(0, 3);

        const t2 = window.setTimeout(() => {
          setRevealedDigitsCount(2);
          audioEngine.playDigitLock(1, 3);

          const t3 = window.setTimeout(() => {
            setRevealedDigitsCount(3);
            setIsRolling(false);
            setRedrawingSlotIndex(null);
            audioEngine.playDigitLock(2, 3);
            audioEngine.playFanfare();
            triggerFestiveConfetti();

            onRedrawSingle(
              activePrize.id,
              { ticketNumber: oldNumber },
              { ticketNumber: newNumber }
            );
          }, 800);
          timerRefs.current.push(t3);
        }, 750);
        timerRefs.current.push(t2);
      }, 1800);

      timerRefs.current.push(t1);
    } else {
      // GROUP REDRAW
      const oldGroup = currentRecord.groupName;
      if (!oldGroup) return;

      const currentGroups = tierRecords.map((r) => r.groupName as string);
      const pool = getAvailableGroupPool(currentGroups);
      if (pool.length === 0) {
        return;
      }

      const randIdx = Math.floor(Math.random() * pool.length);
      const newGroup = pool[randIdx];

      setRedrawingSlotIndex(slotIndex);
      setRollingTargetWinners((prev) => {
        const currentGrps = [...(prev.groups || currentGroups)];
        currentGrps[slotIndex] = newGroup;
        return { ...prev, groups: currentGrps };
      });
      setIsRolling(true);
      audioEngine.startSuspense(7.3, true);

      const t1 = window.setTimeout(() => {
        setIsRolling(false);
        setRedrawingSlotIndex(null);
        audioEngine.playFanfare();
        triggerFestiveConfetti();

        onRedrawSingle(
          activePrize.id,
          { groupName: oldGroup },
          { groupName: newGroup }
        );
      }, 7300);

      timerRefs.current.push(t1);
    }
  };

  // RESET AND REDRAW ALL FOR THIS TIER
  const handleResetAndRedrawAll = () => {
    if (isRolling) return;
    onResetTierRecords(activePrize.id);
    setShowCelebrateBanner(false);
    setRevealedDigitsCount(3);
  };

  // Determine grid columns
  const getGridColsClass = (count: number) => {
    if (count === 1) return 'grid-cols-1 max-w-lg mx-auto';
    if (count === 2) return 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto';
    if (count === 3) return 'grid-cols-1 sm:grid-cols-3 max-w-5xl mx-auto';
    if (count === 4) return 'grid-cols-2 sm:grid-cols-4 max-w-6xl mx-auto';
    if (count === 5) return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 max-w-7xl mx-auto';
    return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 max-w-7xl mx-auto';
  };

  const groupCandidates = activePrize.groupCandidates || DEFAULT_GROUP_CANDIDATES;

  return (
    <div className="w-full flex-1 flex flex-col justify-between items-center px-4 py-2 sm:py-3 max-w-7xl mx-auto z-10">
      {/* Top Center: Current Prize Banner Display */}
      <div className="text-center w-full max-w-3xl mb-1 sm:mb-3">
        <motion.div
          key={activePrize.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="inline-flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-black text-lg sm:text-2xl shadow-lg shadow-orange-500/20 ring-4 ring-amber-200/60 mb-2">
            {drawType === 'group' ? (
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-amber-200" />
            ) : (
              <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-amber-200" />
            )}
            <span>{activePrize.name}</span>
            <span className="text-amber-200 text-sm sm:text-base font-normal">
              ({activePrize.winnerCount}{drawType === 'group' ? '곳' : '명'})
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-800 tracking-tight drop-shadow-xs">
            {activePrize.prizeName}
          </h2>
          {activePrize.description && (
            <p className="text-stone-500 text-xs sm:text-sm font-medium mt-0.5">
              {activePrize.description}
            </p>
          )}
        </motion.div>
      </div>

      {/* Center: Winner Slots Dynamic Area */}
      <div className="w-full flex-1 flex items-center justify-center my-auto py-1 sm:py-2">
        <div className={`w-full grid gap-3 sm:gap-4 lg:gap-6 ${getGridColsClass(activePrize.winnerCount)}`}>
          {Array.from({ length: activePrize.winnerCount }).map((_, idx) => {
            const currentRecord = tierRecords[idx];
            
            // Determine winner value (either currently locked during roll or already persisted in records)
            let winnerNum: number | null = null;
            let winnerGrp: string | null = null;

            if (isRolling) {
              if (drawType === 'number') {
                winnerNum = rollingTargetWinners.numbers?.[idx] ?? null;
              } else {
                winnerGrp = rollingTargetWinners.groups?.[idx] ?? null;
              }
            } else if (isDrawn && currentRecord) {
              winnerNum = currentRecord.ticketNumber ?? null;
              winnerGrp = currentRecord.groupName ?? null;
            }

            const isThisSlotRolling =
              isRolling && (redrawingSlotIndex === null || redrawingSlotIndex === idx);

            return (
              <SlotCard
                key={`${activePrize.id}-${idx}`}
                index={idx}
                drawType={drawType}
                winnerNumber={winnerNum}
                winnerGroup={winnerGrp}
                isRolling={isThisSlotRolling}
                revealedDigitsCount={isThisSlotRolling ? revealedDigitsCount : 3}
                minNumber={config.minNumber}
                maxNumber={config.maxNumber}
                groupCandidates={groupCandidates}
                onRedrawNumber={() => handleRedrawSingle(idx)}
                onRedrawGroup={() => handleRedrawSingle(idx)}
                prizeName={activePrize.prizeName}
                totalInTier={activePrize.winnerCount}
                rollDurationMs={drawType === 'group' ? 7300 : undefined}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom: Main Action Stage Controls */}
      <div className="w-full max-w-xl flex flex-col items-center gap-2.5 mt-2 pt-1">
        {/* Celebration Congratulations Callout */}
        {showCelebrateBanner && isDrawn && !isRolling && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-extrabold text-sm sm:text-base shadow-lg animate-bounce"
          >
            <PartyPopper className="w-5 h-5 text-amber-200" />
            <span>🎉 당첨되신 모든 분들 진심으로 축하드립니다! 🎉</span>
          </motion.div>
        )}

        <div className="flex items-center justify-center gap-3 w-full">
          {!isDrawn ? (
            <button
              id="btn-main-draw"
              onClick={handleStartDraw}
              disabled={isRolling}
              className={`relative group flex-1 max-w-md py-4 sm:py-5 px-8 rounded-2xl font-black text-xl sm:text-2xl text-white shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 select-none cursor-pointer overflow-hidden ${
                isRolling
                  ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 animate-pulse ring-8 ring-orange-300/60 cursor-wait scale-98'
                  : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 shadow-orange-500/35 ring-6 ring-amber-300/70 hover:scale-103 active:scale-97'
              }`}
            >
              {/* Shimmer light bar */}
              <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2.5s_infinite]" />

              {isRolling ? (
                <>
                  <Sparkles className="w-7 h-7 animate-spin text-amber-200" />
                  <span>
                    {drawType === 'group'
                      ? '행운의 단체 기관 추첨 중...'
                      : revealedDigitsCount === 0
                      ? '행운의 번호 추첨 중...'
                      : revealedDigitsCount === 1
                      ? '백의 자리 확정! 다음 번호는?'
                      : '십의 자리 확정! 마지막 번호는?'}
                  </span>
                </>
              ) : (
                <>
                  <Play className="w-7 h-7 fill-white text-white group-hover:scale-110 transition-transform" />
                  <span>
                    {activePrize.name} ({activePrize.winnerCount}{drawType === 'group' ? '곳' : '명'}) 추첨 시작!
                  </span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-3 w-full justify-center">
              <button
                id="btn-re-draw-all"
                onClick={handleResetAndRedrawAll}
                className="flex items-center gap-2 py-3 px-6 rounded-xl font-bold text-sm sm:text-base text-rose-700 bg-white hover:bg-rose-50 border-2 border-rose-300 shadow-md transition-all hover:scale-102 active:scale-98 cursor-pointer"
                title="이 부문의 모든 당첨 결과를 취소하고 다시 추첨합니다"
              >
                <RotateCcw className="w-4 h-4 text-rose-600" />
                <span>{activePrize.name} 전체 재추첨</span>
              </button>

              <button
                id="btn-confetti-retrigger"
                onClick={() => {
                  audioEngine.playFanfare();
                  triggerFestiveConfetti();
                }}
                className="flex items-center gap-2 py-3 px-6 rounded-xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md shadow-orange-500/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
              >
                <PartyPopper className="w-4 h-4 text-amber-200" />
                <span>축하 축포 다시 쏘기</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
