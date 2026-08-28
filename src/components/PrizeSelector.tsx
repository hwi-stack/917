import React from 'react';
import { PrizeTier, DrawRecord } from '../types';
import { Gift, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { audioEngine } from '../utils/audio';

interface PrizeSelectorProps {
  prizes: PrizeTier[];
  activePrizeId: string;
  onSelectPrize: (prizeId: string) => void;
  records: DrawRecord[];
  isRolling: boolean;
}

export const PrizeSelector: React.FC<PrizeSelectorProps> = ({
  prizes,
  activePrizeId,
  onSelectPrize,
  records,
  isRolling,
}) => {
  const currentIndex = prizes.findIndex((p) => p.id === activePrizeId);

  const handlePrev = () => {
    if (currentIndex > 0 && !isRolling) {
      audioEngine.playClick();
      onSelectPrize(prizes[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < prizes.length - 1 && !isRolling) {
      audioEngine.playClick();
      onSelectPrize(prizes[currentIndex + 1].id);
    }
  };

  return (
    <div className="w-full flex items-center justify-between gap-2 px-2 py-1">
      {/* Prev Tier Button */}
      <button
        id="btn-prev-tier"
        onClick={handlePrev}
        disabled={currentIndex <= 0 || isRolling}
        className="shrink-0 p-2 rounded-xl bg-white/80 hover:bg-white text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm border border-stone-200/80 transition-all"
        title="이전 경품 부문"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Horizontal Scrollable Tabs */}
      <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1">
        {prizes.map((prize, idx) => {
          const isActive = prize.id === activePrizeId;
          const tierRecords = records.filter(
            (r) => r.prizeId === prize.id && !r.isCancelled
          );
          const isCompleted = tierRecords.length >= prize.winnerCount;
          const isPartial = tierRecords.length > 0 && !isCompleted;

          return (
            <button
              id={`tab-prize-${prize.id}`}
              key={prize.id}
              onClick={() => {
                if (!isRolling) {
                  audioEngine.playClick();
                  onSelectPrize(prize.id);
                }
              }}
              disabled={isRolling}
              className={`group relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 whitespace-nowrap cursor-pointer select-none ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/25 ring-2 ring-amber-300 scale-105 z-10'
                  : isCompleted
                  ? 'bg-emerald-50/90 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                  : 'bg-white/85 text-stone-700 hover:bg-white border border-stone-200 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base">
                <Gift className={`w-4 h-4 ${isActive ? 'text-amber-200' : 'text-amber-500'}`} />
                <span>{prize.name}</span>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-1">
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : isCompleted
                      ? 'bg-emerald-200/80 text-emerald-900'
                      : isPartial
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {prize.winnerCount}명
                </span>

                {isCompleted && (
                  <span className={`flex items-center text-[10px] ${isActive ? 'text-white' : 'text-emerald-600'}`}>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Next Tier Button */}
      <button
        id="btn-next-tier"
        onClick={handleNext}
        disabled={currentIndex >= prizes.length - 1 || isRolling}
        className="shrink-0 p-2 rounded-xl bg-white/80 hover:bg-white text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm border border-stone-200/80 transition-all"
        title="다음 경품 부문"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};
