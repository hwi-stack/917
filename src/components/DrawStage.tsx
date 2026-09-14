import React, { useState, useEffect, useRef } from 'react';
import { PrizeTier, DrawRecord, LotteryConfig } from '../types';
import { SlotCard } from './SlotCard';
import { Sparkles, Gift, Play, RotateCcw, PartyPopper, Building2 } from 'lucide-react';
import { audioEngine } from '../utils/audio';
import { triggerFestiveConfetti } from '../utils/confetti';
import { motion } from 'motion/react';
import { DEFAULT_GROUP_CANDIDATES, getSlotItemLabel } from '../utils/storage';

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

  // Dynamic tier duration according to event schedule:
  // 7등, 6등, 5등, 4등: 2.5초 / 3등: 3초 / 2등: 4초 / 1등: 5초 / 단체상: 7초
  const getPrizeDuration = (prize: PrizeTier): number => {
    if (prize.rollDurationSeconds && prize.rollDurationSeconds > 0) {
      return prize.rollDurationSeconds;
    }
    if (prize.drawType === 'group' || prize.name.includes('단체')) {
      return 7;
    }
    if (prize.name.includes('1등')) return 5;
    if (prize.name.includes('2등')) return 4;
    if (prize.name.includes('3등')) return 3;
    if (
      prize.name.includes('4등') ||
      prize.name.includes('5등') ||
      prize.name.includes('6등') ||
      prize.name.includes('7등')
    ) {
      return 2.5;
    }
    return 2.5;
  };

  // MAIN DRAW EXECUTION (동시 추첨 & 번호 순차 공개 2 -> 4 -> 6)
  const handleStartDraw = () => {
    if (isRolling) return;
    clearAllTimers();

    const neededCount = activePrize.winnerCount;
    const totalRollSec = getPrizeDuration(activePrize);

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

      // Proportional sequential lock timing that sums to exact totalRollSec:
      // initial 60%, tens digit +20%, units digit (final) +20%
      const initialRollSec = totalRollSec * 0.6;
      const step2DelaySec = totalRollSec * 0.2;
      const step3DelaySec = totalRollSec * 0.2;

      audioEngine.startSuspense(totalRollSec, false);

      // Phase 1: Reveal Hundreds Digit (백의 자리)
      const t1 = window.setTimeout(() => {
        setRevealedDigitsCount(1);
        audioEngine.playDigitLock(0, 3);

        // Phase 2: Reveal Tens Digit (십의 자리)
        const t2 = window.setTimeout(() => {
          setRevealedDigitsCount(2);
          audioEngine.playDigitLock(1, 3);

          // Phase 3: Reveal Units Digit (일의 자리 - 최종 당첨!)
          const t3 = window.setTimeout(() => {
            setRevealedDigitsCount(3);
            setIsRolling(false);
            audioEngine.playDigitLock(2, 3);
            audioEngine.playFanfare();
            triggerFestiveConfetti();
            setShowCelebrateBanner(true);

            onSaveDrawResults(
              activePrize.id,
              selectedWinners.map((num, idx) => ({
                ticketNumber: num,
                prizeItem: getSlotItemLabel(activePrize, idx) || activePrize.prizeName,
              }))
            );
          }, step3DelaySec * 1000);
          timerRefs.current.push(t3);
        }, step2DelaySec * 1000);
        timerRefs.current.push(t2);
      }, initialRollSec * 1000);

      timerRefs.current.push(t1);
    } else {
      // GROUP DRAW (단체상: 7.0초 감속 연출)
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

      // 단체상: 7.0초
      audioEngine.startSuspense(totalRollSec, true);

      const t1 = window.setTimeout(() => {
        setIsRolling(false);
        audioEngine.playFanfare();
        triggerFestiveConfetti();
        setShowCelebrateBanner(true);

        onSaveDrawResults(
          activePrize.id,
          selectedGroups.map((g, idx) => ({
            groupName: g,
            prizeItem: activePrize.winnerItems?.[idx] || activePrize.prizeName,
          }))
        );
      }, totalRollSec * 1000);

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
      audioEngine.startSuspense(1.8, false);

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
          }, 450);
          timerRefs.current.push(t3);
        }, 400);
        timerRefs.current.push(t2);
      }, 900);

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
      }, 7000);

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

  // Determine grid columns with maximum screen occupancy & responsive fit
  const getGridColsClass = (count: number) => {
    if (count === 1) return 'grid-cols-1 max-w-3xl lg:max-w-4xl mx-auto';
    if (count === 2) return 'grid-cols-1 sm:grid-cols-2 max-w-5xl lg:max-w-6xl mx-auto';
    if (count === 3) return 'grid-cols-1 sm:grid-cols-3 max-w-7xl mx-auto';
    if (count === 4) return 'grid-cols-2 sm:grid-cols-4 max-w-7xl mx-auto';
    if (count === 5) return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 max-w-7xl mx-auto';
    if (count <= 8) return 'grid-cols-2 sm:grid-cols-4 max-w-7xl mx-auto';
    // 9 ~ 12 winners (e.g. 11 winners for 7등) -> 6 columns for 2 tidy rows on desktop
    return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 max-w-7xl mx-auto';
  };

  const groupCandidates = activePrize.groupCandidates || DEFAULT_GROUP_CANDIDATES;

  // Render a single slot card helper
  const renderSlotCard = (idx: number) => {
    const currentRecord = tierRecords[idx];

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

    const itemLabel = getSlotItemLabel(activePrize, idx);
    const rollDurationMs = Math.round(getPrizeDuration(activePrize) * 1000);

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
        itemLabel={itemLabel}
        totalInTier={activePrize.winnerCount}
        rollDurationMs={rollDurationMs}
      />
    );
  };

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col justify-between items-center px-2 sm:px-4 py-0.5 sm:py-1 max-w-7xl mx-auto z-10">
      {/* Top Center: Current Prize Banner Display (Large prominent 상품명) */}
      <div className="text-center w-full max-w-5xl shrink-0 my-1 sm:my-1.5">
        <motion.div
          key={activePrize.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="inline-flex items-center justify-center flex-wrap gap-2.5 sm:gap-4 px-5 sm:px-8 py-1.5 sm:py-2.5 rounded-2xl sm:rounded-full bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white font-black shadow-lg shadow-orange-600/25 ring-3 sm:ring-4 ring-amber-300/80"
        >
          {/* Prize Tier */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {drawType === 'group' ? (
              <Building2 className="w-5 h-5 sm:w-7 sm:h-7 text-amber-200 shrink-0" />
            ) : (
              <Gift className="w-5 h-5 sm:w-7 sm:h-7 text-amber-200 shrink-0" />
            )}
            <span className="text-lg sm:text-2xl font-black text-amber-100 tracking-tight">
              {activePrize.name}
            </span>
          </div>

          <span className="hidden sm:inline-block w-1 h-6 bg-amber-300/60 rounded-full" />

          {/* Product Name (상품명) - Significantly Larger and Higher Contrast */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-md">
              {activePrize.prizeName}
            </span>
            <span className="text-xs sm:text-sm md:text-base text-amber-100 bg-black/30 border border-amber-300/50 px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full font-black">
              총 {activePrize.winnerCount}{drawType === 'group' ? '곳' : '명'}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Center: Winner Slots Dynamic Area */}
      <div className="w-full flex-1 min-h-0 flex items-center justify-center my-auto py-0.5 sm:py-1">
        {activePrize.winnerCount === 11 ? (
          /* 7등 (11명) Layout: Top 4, Middle 4, Bottom 3 centered */
          <div className="w-full flex flex-col items-center gap-2 sm:gap-2.5 lg:gap-3 max-w-7xl mx-auto">
            {/* Top Row: 4 cards (위에 4개) */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 lg:gap-3">
              {[0, 1, 2, 3].map((idx) => renderSlotCard(idx))}
            </div>

            {/* Middle Row: 4 cards (가운데 4개) */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 lg:gap-3">
              {[4, 5, 6, 7].map((idx) => renderSlotCard(idx))}
            </div>

            {/* Bottom Row: 3 cards centered (아래 3개) */}
            <div className="w-full flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 sm:gap-2.5 lg:gap-3">
              {[8, 9, 10].map((idx) => (
                <div
                  key={`slot-wrap-11-${idx}`}
                  className="w-[calc(50%-0.375rem)] sm:w-[calc((100%-1.875rem)/4)] lg:w-[calc((100%-2.25rem)/4)] flex justify-center"
                >
                  {renderSlotCard(idx)}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={`w-full grid gap-2 sm:gap-2.5 lg:gap-3 ${getGridColsClass(activePrize.winnerCount)}`}>
            {Array.from({ length: activePrize.winnerCount }).map((_, idx) => renderSlotCard(idx))}
          </div>
        )}
      </div>

      {/* Bottom: Main Action Stage Controls (Guaranteed visible with shrink-0) */}
      <div className="w-full max-w-xl flex flex-col items-center shrink-0 mt-0.5 mb-1 gap-1.5">
        {/* Celebration Congratulations Callout */}
        {showCelebrateBanner && isDrawn && !isRolling && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-extrabold text-xs sm:text-sm shadow-lg animate-bounce"
          >
            <PartyPopper className="w-4 h-4 text-amber-200" />
            <span>🎉 당첨되신 모든 분들 진심으로 축하드립니다! 🎉</span>
          </motion.div>
        )}

        <div className="flex items-center justify-center gap-3 w-full">
          {!isDrawn ? (
            <button
              id="btn-main-draw"
              onClick={handleStartDraw}
              disabled={isRolling}
              className={`relative group w-full max-w-md py-2.5 sm:py-3.5 px-6 sm:px-8 rounded-xl sm:rounded-2xl font-black text-lg sm:text-xl text-white shadow-xl transition-all duration-200 flex items-center justify-center gap-2.5 select-none cursor-pointer overflow-hidden shrink-0 ${
                isRolling
                  ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 animate-pulse ring-6 ring-orange-300/60 cursor-wait scale-98'
                  : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 shadow-orange-500/35 ring-4 sm:ring-6 ring-amber-300/70 hover:scale-102 active:scale-98'
              }`}
            >
              {/* Shimmer light bar */}
              <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2.5s_infinite]" />

              {isRolling ? (
                <>
                  <Sparkles className="w-6 h-6 animate-spin text-amber-200" />
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
                  <Play className="w-6 h-6 fill-white text-white group-hover:scale-110 transition-transform" />
                  <span>
                    {activePrize.name} ({activePrize.winnerCount}{drawType === 'group' ? '곳' : '명'}) 추첨 시작!
                  </span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2.5 w-full justify-center">
              <button
                id="btn-re-draw-all"
                onClick={handleResetAndRedrawAll}
                className="flex items-center gap-1.5 py-2.5 px-5 rounded-xl font-bold text-xs sm:text-sm text-rose-700 bg-white hover:bg-rose-50 border-2 border-rose-300 shadow-md transition-all hover:scale-102 active:scale-98 cursor-pointer"
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
                className="flex items-center gap-1.5 py-2.5 px-5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md shadow-orange-500/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
              >
                <PartyPopper className="w-4 h-4 text-amber-200" />
                <span>축포 다시 쏘기</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
