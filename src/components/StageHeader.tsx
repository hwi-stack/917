import React from 'react';
import { Volume2, VolumeX, Maximize2, Minimize2, Award, Settings, Sparkles, Cloud, CloudOff, RefreshCw, RotateCcw } from 'lucide-react';
import { LotteryConfig } from '../types';
import { audioEngine } from '../utils/audio';
import { SyncStatus } from '../utils/firebase';

interface StageHeaderProps {
  config: LotteryConfig;
  soundMuted: boolean;
  onToggleSound: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenHistory: () => void;
  onOpenAdmin: () => void;
  onOpenReset: () => void;
  totalWinnersCount: number;
  remainingPrizesCount: number;
  syncStatus?: SyncStatus;
}

export const StageHeader: React.FC<StageHeaderProps> = ({
  config,
  soundMuted,
  onToggleSound,
  isFullscreen,
  onToggleFullscreen,
  onOpenHistory,
  onOpenAdmin,
  onOpenReset,
  totalWinnersCount,
  remainingPrizesCount,
  syncStatus = 'connected',
}) => {
  return (
    <header className="w-full relative z-20 flex flex-row items-center justify-between gap-2 px-3 sm:px-6 py-1.5 sm:py-2 bg-white/80 backdrop-blur-md border-b border-amber-200/80 shadow-xs shrink-0">
      {/* Left: Organization & Slogan */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* 20th Anniversary emblem badge */}
        <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/20 ring-2 ring-amber-300 shrink-0">
          <div className="text-center leading-none">
            <span className="block text-[8px] sm:text-[9px] font-bold tracking-tighter uppercase opacity-90">20th</span>
            <span className="block text-xs sm:text-sm font-black">수원</span>
          </div>
          <div className="absolute -top-1 -right-1">
            <Sparkles className="w-3 h-3 text-amber-200 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] sm:text-xs font-bold text-orange-800 tracking-tight">
              {config.organization}
            </span>
            <span className="inline-block w-1 h-1 rounded-full bg-orange-400" />
            <span className="text-[10px] sm:text-xs text-stone-500 font-medium hidden sm:inline">
              추첨번호 1~{config.maxNumber}번
            </span>
          </div>

          <h1 className="text-sm sm:text-lg md:text-xl font-black bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent tracking-tight">
            {config.eventTitle}
          </h1>
        </div>
      </div>

      {/* Center: Live Stats Summary & Firebase Status */}
      <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 rounded-full bg-amber-50/90 border border-amber-200 text-xs font-semibold text-stone-700 shadow-inner">
        <span className="flex items-center gap-1 text-amber-800">
          <Award className="w-4 h-4 text-amber-600" />
          당첨 완료: <strong className="text-orange-600 font-bold">{totalWinnersCount}명</strong>
        </span>
        <span className="text-stone-300">|</span>
        <span className="text-stone-600">
          잔여 추첨: <strong className="text-stone-800">{remainingPrizesCount}개</strong>
        </span>
        <span className="text-stone-300">|</span>
        {/* Firebase Cloud Live Sync Badge */}
        <span
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold transition-all ${
            syncStatus === 'connected'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : syncStatus === 'syncing' || syncStatus === 'connecting'
              ? 'bg-sky-100 text-sky-800 border border-sky-300'
              : 'bg-rose-100 text-rose-800 border border-rose-300'
          }`}
          title={
            syncStatus === 'connected'
              ? 'Firebase Firestore 클라우드 실시간 동기화 연결됨'
              : syncStatus === 'syncing' || syncStatus === 'connecting'
              ? '클라우드 동기화 중...'
              : '클라우드 오프라인 (로컬 보관 중)'
          }
        >
          {syncStatus === 'connected' ? (
            <>
              <Cloud className="w-3 h-3 text-emerald-600" />
              <span>클라우드 동기화 ON</span>
            </>
          ) : syncStatus === 'syncing' || syncStatus === 'connecting' ? (
            <>
              <RefreshCw className="w-3 h-3 text-sky-600 animate-spin" />
              <span>동기화 연결 중</span>
            </>
          ) : (
            <>
              <CloudOff className="w-3 h-3 text-rose-600" />
              <span>로컬 저장 모드</span>
            </>
          )}
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Sound toggle */}
        <button
          id="btn-sound-toggle"
          onClick={() => {
            audioEngine.playClick();
            onToggleSound();
          }}
          className={`p-2.5 rounded-xl border transition-all ${
            soundMuted
              ? 'bg-stone-100 border-stone-300 text-stone-400 hover:bg-stone-200'
              : 'bg-amber-500/10 border-amber-300 text-amber-700 hover:bg-amber-500/20 shadow-xs'
          }`}
          title={soundMuted ? '효과음 켜기' : '효과음 끄기'}
        >
          {soundMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        {/* Winner history list */}
        <button
          id="btn-winner-history"
          onClick={() => {
            audioEngine.playClick();
            onOpenHistory();
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-amber-50/80 border border-amber-200 text-stone-700 hover:text-orange-700 text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
        >
          <Award className="w-4 h-4 text-orange-500" />
          <span>당첨 기록</span>
          {totalWinnersCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[11px] bg-orange-500 text-white font-bold">
              {totalWinnersCount}
            </span>
          )}
        </button>

        {/* Quick Reset Modal Trigger */}
        <button
          id="btn-quick-reset"
          onClick={() => {
            audioEngine.playClick();
            onOpenReset();
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
          title="추첨 기록 초기화 및 전체 기본값 초기화"
        >
          <RotateCcw className="w-4 h-4 text-rose-500" />
          <span className="hidden sm:inline">초기화</span>
        </button>

        {/* Fullscreen toggle */}
        <button
          id="btn-fullscreen-toggle"
          onClick={() => {
            audioEngine.playClick();
            onToggleFullscreen();
          }}
          className="hidden sm:flex items-center gap-1 p-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-semibold shadow-xs transition-all"
          title={isFullscreen ? '전체화면 해제' : '무대 전체화면 16:9'}
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>

        {/* Admin settings gear button */}
        <button
          id="btn-admin-settings"
          onClick={() => {
            audioEngine.playClick();
            onOpenAdmin();
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-700 hover:to-stone-800 text-white text-xs sm:text-sm font-bold shadow-md transition-all"
          title="관리자 설정 (비밀번호: 0926)"
        >
          <Settings className="w-4 h-4 text-amber-300" />
          <span className="hidden sm:inline">관리자 설정</span>
        </button>
      </div>
    </header>
  );
};
