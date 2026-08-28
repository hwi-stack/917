/**
 * 수원시장애인종합복지관 개관 20주년 기념식 경품 추첨 시스템
 * 행사 슬로건: "스무 살, 더 밝게 빛날 우리"
 * 16:9 대화면 무대 최적화, 1~700번 추첨, 단체상(기관명) 추첨, 자리수별 순차 공개(2->4->6), 몰입형 사운드 및 파티클
 */

import React, { useState, useEffect, useRef } from 'react';
import { PrizeTier, LotteryConfig, DrawRecord } from './types';
import { loadSavedState, saveState, DEFAULT_CONFIG, DEFAULT_PRIZES } from './utils/storage';
import { BackgroundFestive } from './components/BackgroundFestive';
import { StageHeader } from './components/StageHeader';
import { PrizeSelector } from './components/PrizeSelector';
import { DrawStage } from './components/DrawStage';
import { WinnerHistoryModal } from './components/WinnerHistoryModal';
import { AdminModal } from './components/AdminModal';
import { ResetModal } from './components/ResetModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { audioEngine } from './utils/audio';
import {
  subscribeToFirestoreState,
  saveStateToFirestore,
  SyncStatus,
} from './utils/firebase';

export default function App() {
  const [initialState] = useState(() => loadSavedState());
  const [config, setConfig] = useState<LotteryConfig>(initialState.config);
  const [prizes, setPrizes] = useState<PrizeTier[]>(initialState.prizes);
  const [records, setRecords] = useState<DrawRecord[]>(initialState.records);
  const [activePrizeId, setActivePrizeId] = useState<string>(initialState.activePrizeId);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('connecting');

  const [soundMuted, setSoundMuted] = useState(!config.soundEnabled);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  // Ref to prevent circular updates from snapshot to save
  const isReceivingRemoteUpdate = useRef(false);

  // Sync sound engine
  useEffect(() => {
    audioEngine.setMuted(soundMuted);
  }, [soundMuted]);

  // Subscribe to real-time changes from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToFirestoreState(
      (remoteState) => {
        isReceivingRemoteUpdate.current = true;
        setConfig(remoteState.config);
        setPrizes(remoteState.prizes);
        setRecords(remoteState.records);
        if (remoteState.activePrizeId) {
          setActivePrizeId(remoteState.activePrizeId);
        }
        // Also save to localStorage
        saveState(remoteState);
        setTimeout(() => {
          isReceivingRemoteUpdate.current = false;
        }, 100);
      },
      (status) => {
        setSyncStatus(status);
      }
    );

    return () => unsubscribe();
  }, []);

  // Persist state changes locally and push to Firestore
  useEffect(() => {
    saveState({ config, prizes, records, activePrizeId });

    if (!isReceivingRemoteUpdate.current) {
      saveStateToFirestore({ config, prizes, records, activePrizeId }).catch((err) => {
        console.warn('Firestore sync background update:', err);
      });
    }
  }, [config, prizes, records, activePrizeId]);

  // Fullscreen listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Fullscreen request failed:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleToggleSound = () => {
    setSoundMuted((prev) => !prev);
  };

  // Find active prize
  const activePrize = prizes.find((p) => p.id === activePrizeId) || prizes[0];

  // Save draw results for multiple winners (numbers or groups) simultaneously
  const handleSaveDrawResults = (
    prizeId: string,
    items: { ticketNumber?: number; groupName?: string }[]
  ) => {
    const targetPrize = prizes.find((p) => p.id === prizeId);
    if (!targetPrize) return;

    const newRecords: DrawRecord[] = items.map((item) => ({
      id: `record_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      prizeId: targetPrize.id,
      prizeName: targetPrize.name,
      prizeItem: targetPrize.prizeName,
      ticketNumber: item.ticketNumber,
      groupName: item.groupName,
      drawType: targetPrize.drawType || 'number',
      drawnAt: new Date().toISOString(),
    }));

    setRecords((prev) => {
      // Remove any existing active records for this prize if re-drawn
      const filtered = prev.filter((r) => r.prizeId !== prizeId);
      return [...filtered, ...newRecords];
    });
  };

  // Redraw a single slot (number or group)
  const handleRedrawSingle = (
    prizeId: string,
    oldItem: { ticketNumber?: number; groupName?: string },
    newItem: { ticketNumber?: number; groupName?: string }
  ) => {
    const targetPrize = prizes.find((p) => p.id === prizeId);
    if (!targetPrize) return;

    setRecords((prev) => {
      return prev.map((r) => {
        const isMatchNumber =
          oldItem.ticketNumber !== undefined && r.ticketNumber === oldItem.ticketNumber;
        const isMatchGroup =
          oldItem.groupName !== undefined && r.groupName === oldItem.groupName;

        if (r.prizeId === prizeId && (isMatchNumber || isMatchGroup) && !r.isCancelled) {
          return {
            ...r,
            ticketNumber: newItem.ticketNumber,
            groupName: newItem.groupName,
            drawnAt: new Date().toISOString(),
          };
        }
        return r;
      });
    });
  };

  // Reset tier records
  const handleResetTierRecords = (prizeId: string) => {
    setRecords((prev) => {
      const updated = prev.filter((r) => r.prizeId !== prizeId);
      saveState({ config, prizes, records: updated, activePrizeId });
      saveStateToFirestore({ config, prizes, records: updated, activePrizeId }).catch(console.warn);
      return updated;
    });
  };

  // Cancel specific record in history modal
  const handleCancelRecord = (recordId: string) => {
    setRecords((prev) => {
      const updated = prev.map((r) => (r.id === recordId ? { ...r, isCancelled: true } : r));
      saveState({ config, prizes, records: updated, activePrizeId });
      saveStateToFirestore({ config, prizes, records: updated, activePrizeId }).catch(console.warn);
      return updated;
    });
  };

  // Reset all records (for admin/reset modal)
  const handleResetAllRecords = () => {
    setRecords([]);
    saveState({ config, prizes, records: [], activePrizeId });
    saveStateToFirestore({ config, prizes, records: [], activePrizeId }).catch(console.warn);
  };

  // Full factory reset (restore default config, prizes, and clear records)
  const handleFactoryReset = () => {
    setConfig(DEFAULT_CONFIG);
    setPrizes(DEFAULT_PRIZES);
    setRecords([]);
    setActivePrizeId(DEFAULT_PRIZES[0].id);
    const defaultState = {
      config: DEFAULT_CONFIG,
      prizes: DEFAULT_PRIZES,
      records: [],
      activePrizeId: DEFAULT_PRIZES[0].id,
    };
    saveState(defaultState);
    saveStateToFirestore(defaultState).catch(console.warn);
  };

  // Stats
  const validRecords = records.filter((r) => !r.isCancelled);
  const totalWinnersCount = validRecords.length;
  const completedPrizeIds = new Set(
    prizes
      .filter((p) => {
        const tierRecs = validRecords.filter((r) => r.prizeId === p.id);
        return tierRecs.length >= p.winnerCount;
      })
      .map((p) => p.id)
  );
  const remainingPrizesCount = prizes.length - completedPrizeIds.size;

  return (
    <ErrorBoundary>
      <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-stone-900 overflow-x-hidden font-sans select-none">
        {/* 16:9 Aspect Ratio Container for Grand Presentation Stage */}
        <div className="relative w-full max-w-[1920px] aspect-video max-h-screen min-h-screen sm:min-h-0 flex flex-col justify-between overflow-hidden shadow-2xl bg-gradient-to-b from-amber-50/90 via-orange-50/70 to-rose-50/80">
          {/* Festive Atmosphere Background */}
          <BackgroundFestive />

          {/* Top Grand Stage Header */}
          <StageHeader
            config={config}
            soundMuted={soundMuted}
            onToggleSound={handleToggleSound}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
            onOpenHistory={() => setIsHistoryOpen(true)}
            onOpenAdmin={() => setIsAdminOpen(true)}
            onOpenReset={() => setIsResetOpen(true)}
            totalWinnersCount={totalWinnersCount}
            remainingPrizesCount={remainingPrizesCount}
            syncStatus={syncStatus}
          />

          {/* Prize Tiers Selector Bar */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 pt-1">
            <PrizeSelector
              prizes={prizes}
              activePrizeId={activePrize?.id || ''}
              onSelectPrize={(id) => setActivePrizeId(id)}
              records={records}
              isRolling={false}
            />
          </div>

          {/* Main 16:9 Drawing Stage Area */}
          {activePrize && (
            <DrawStage
              key={activePrize.id}
              activePrize={activePrize}
              config={config}
              records={records}
              onSaveDrawResults={handleSaveDrawResults}
              onRedrawSingle={handleRedrawSingle}
              onResetTierRecords={handleResetTierRecords}
            />
          )}

          {/* Bottom Status Footer Strip */}
          <footer className="relative z-10 w-full px-6 py-2 bg-white/60 backdrop-blur-xs border-t border-amber-200/60 flex items-center justify-between text-xs text-stone-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-orange-800">
                {config.organization} 개관 20주년 기념식
              </span>
              <span className="text-stone-400">•</span>
              <span className="font-medium text-stone-600">
                &quot;{config.eventTitle}&quot;
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-semibold text-stone-500">
              <span>추첨 대상 번호: <strong>{config.minNumber}번 ~ {config.maxNumber}번</strong></span>
              <span>중복 당첨 방지: <strong className="text-emerald-700">{config.allowDuplicates ? '비활성' : '적용 중'}</strong></span>
              <span>클라우드 동기화: <strong className="text-orange-700">Firebase Firestore</strong></span>
              <span>화면 비율: <strong>16:9 대화면 무대 모드</strong></span>
            </div>
          </footer>
        </div>

        {/* Winner History Modal */}
        <WinnerHistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          records={records}
          prizes={prizes}
          config={config}
          onCancelRecord={handleCancelRecord}
          onResetAllRecords={handleResetAllRecords}
        />

        {/* Quick Reset Modal */}
        {activePrize && (
          <ResetModal
            isOpen={isResetOpen}
            onClose={() => setIsResetOpen(false)}
            activePrize={activePrize}
            records={records}
            onResetAllRecords={handleResetAllRecords}
            onResetCurrentTier={handleResetTierRecords}
            onFactoryReset={handleFactoryReset}
          />
        )}

        {/* Admin Settings Modal (Password: 0926) */}
        <AdminModal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          config={config}
          prizes={prizes}
          records={records}
          onSaveConfig={(newConfig) => setConfig(newConfig)}
          onSavePrizes={(newPrizes) => {
            setPrizes(newPrizes);
            if (!newPrizes.some((p) => p.id === activePrizeId) && newPrizes.length > 0) {
              setActivePrizeId(newPrizes[0].id);
            }
          }}
          onResetAllRecords={handleResetAllRecords}
        />
      </div>
    </ErrorBoundary>
  );
}
