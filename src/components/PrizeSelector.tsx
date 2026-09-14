import React from 'react';
import { PrizeTier, DrawRecord } from '../types';
import { Gift, Check, Building2 } from 'lucide-react';
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
  return (
    <div className="w-full py-0.5 sm:py-1 shrink-0">
      {/* All tiers displayed in a single unified bar at a glance (no arrows needed) */}
      <div className="w-full flex flex-wrap sm:flex-nowrap items-stretch justify-center gap-1 sm:gap-1.5 md:gap-2">
        {prizes.map((prize) => {
          const isActive = prize.id === activePrizeId;
          const tierRecords = records.filter(
            (r) => r.prizeId === prize.id && !r.isCancelled
          );
          const isCompleted = tierRecords.length >= prize.winnerCount;
          const isPartial = tierRecords.length > 0 && !isCompleted;

          const isGroup = prize.drawType === 'group';

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
              title={`${prize.name} (${prize.prizeName || ''}) - ${prize.winnerCount}${isGroup ? '곳' : '명'}`}
              className={`group relative flex-1 min-w-[calc(25%-0.375rem)] sm:min-w-0 flex flex-col items-center justify-center px-1 sm:px-2 md:px-2.5 py-1 sm:py-1.5 rounded-xl transition-all duration-150 cursor-pointer select-none text-center ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/25 ring-2 ring-amber-300 scale-102 z-10'
                  : isCompleted
                  ? 'bg-emerald-50/95 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400'
                  : 'bg-white/90 text-stone-700 hover:bg-white border border-stone-200 shadow-2xs hover:border-amber-300'
              }`}
            >
              {/* Top: Tier Name & Count Pill */}
              <div className="flex items-center justify-center gap-1 sm:gap-1.5 w-full">
                {isGroup ? (
                  <Building2
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${
                      isActive ? 'text-amber-200' : isCompleted ? 'text-emerald-600' : 'text-amber-500'
                    }`}
                  />
                ) : (
                  <Gift
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${
                      isActive ? 'text-amber-200' : isCompleted ? 'text-emerald-600' : 'text-amber-500'
                    }`}
                  />
                )}
                <span className="font-extrabold text-xs sm:text-sm md:text-sm tracking-tight truncate">
                  {prize.name}
                </span>

                <span
                  className={`text-[9px] sm:text-[10px] md:text-[11px] px-1 sm:px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : isCompleted
                      ? 'bg-emerald-200/80 text-emerald-900'
                      : isPartial
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {prize.winnerCount}
                  {isGroup ? '곳' : '명'}
                </span>

                {isCompleted && (
                  <span
                    className={`shrink-0 ${
                      isActive ? 'text-white' : 'text-emerald-600'
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>

              {/* Bottom: Prize Product Name */}
              {prize.prizeName && (
                <div
                  className={`w-full truncate text-[10px] sm:text-xs font-semibold mt-0.5 ${
                    isActive
                      ? 'text-amber-100 font-bold'
                      : isCompleted
                      ? 'text-emerald-700 font-medium'
                      : 'text-stone-500 group-hover:text-stone-800'
                  }`}
                >
                  {prize.prizeName}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

