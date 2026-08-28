import React, { useState } from 'react';
import { RotateCcw, Trash2, AlertTriangle, X, CheckCircle2, Sparkles, RefreshCw, Check, ArrowRight } from 'lucide-react';
import { PrizeTier, DrawRecord } from '../types';
import { audioEngine } from '../utils/audio';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePrize: PrizeTier;
  records: DrawRecord[];
  onResetAllRecords: () => void;
  onResetCurrentTier: (prizeId: string) => void;
  onFactoryReset: () => void;
}

type ConfirmMode = 'tier' | 'all' | 'factory' | null;

export const ResetModal: React.FC<ResetModalProps> = ({
  isOpen,
  onClose,
  activePrize,
  records,
  onResetAllRecords,
  onResetCurrentTier,
  onFactoryReset,
}) => {
  const [confirmMode, setConfirmMode] = useState<ConfirmMode>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const validRecords = records.filter((r) => !r.isCancelled);
  const currentTierRecords = validRecords.filter((r) => r.prizeId === activePrize.id);

  const executeReset = (type: 'tier' | 'all' | 'factory') => {
    audioEngine.playClick();
    if (type === 'tier') {
      onResetCurrentTier(activePrize.id);
      setFeedbackMessage(`[${activePrize.name}] 당첨 결과가 초기화되었습니다.`);
    } else if (type === 'all') {
      onResetAllRecords();
      setFeedbackMessage(`모든 당첨 기록(${validRecords.length}건)이 깨끗하게 초기화되었습니다.`);
    } else if (type === 'factory') {
      onFactoryReset();
      setFeedbackMessage('시스템이 개관 20주년 표준 설정으로 공장 초기화되었습니다.');
    }
    setConfirmMode(null);
    setTimeout(() => {
      setFeedbackMessage(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500 text-white shadow-md">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-800">추첨 시스템 초기화</h3>
              <p className="text-xs text-stone-500 font-medium">
                본 행사 시작 전 테스트 기록을 비우거나 설정을 초기화할 수 있습니다
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setConfirmMode(null);
              onClose();
            }}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert if triggered */}
        {feedbackMessage ? (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-3">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <p className="text-base font-black text-stone-800">{feedbackMessage}</p>
            <p className="text-xs text-emerald-700 font-medium">Firebase 클라우드 및 모든 연결 기기에 즉시 반영되었습니다.</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {/* Option 1: Current Prize Tier Reset */}
            <div className={`p-4 rounded-2xl border transition-all ${
              confirmMode === 'tier'
                ? 'bg-amber-100/90 border-amber-400 ring-2 ring-amber-300'
                : 'bg-amber-50/70 border-amber-200/90 hover:bg-amber-50'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 text-sm">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>현재 부문 [{activePrize.name}] 결과만 초기화</span>
                  </div>
                  <p className="text-xs text-stone-600">
                    현재 선택된 <strong>{activePrize.name}</strong>({activePrize.prizeName})의 당첨 기록({currentTierRecords.length}건)만 비우고 새로 추첨합니다.
                  </p>
                </div>

                {confirmMode !== 'tier' ? (
                  <button
                    id="btn-reset-current-tier-start"
                    onClick={() => {
                      audioEngine.playClick();
                      setConfirmMode('tier');
                    }}
                    disabled={currentTierRecords.length === 0}
                    className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                      currentTierRecords.length > 0
                        ? 'bg-amber-500 hover:bg-amber-600 text-white active:scale-95'
                        : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    부문 초기화
                  </button>
                ) : null}
              </div>

              {/* Confirmation Inline Box */}
              {confirmMode === 'tier' && (
                <div className="mt-3 pt-3 border-t border-amber-300/80 flex items-center justify-between gap-2 animate-in fade-in duration-150">
                  <span className="text-xs font-bold text-amber-950">정말 '{activePrize.name}' 당첨 기록을 삭제할까요?</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setConfirmMode(null)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-stone-600 hover:bg-stone-100 border border-stone-300 cursor-pointer"
                    >
                      취소
                    </button>
                    <button
                      id="btn-confirm-reset-tier"
                      onClick={() => executeReset('tier')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs cursor-pointer active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>확인 (삭제)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Option 2: All Draw Records Reset (Recommended before main event) */}
            <div className={`p-4 rounded-2xl border transition-all ${
              confirmMode === 'all'
                ? 'bg-orange-100/90 border-orange-400 ring-2 ring-orange-300'
                : 'bg-orange-50/70 border-orange-200/90 hover:bg-orange-50'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-1.5 font-bold text-orange-950 text-sm">
                    <Trash2 className="w-4 h-4 text-orange-600" />
                    <span>전체 당첨 기록 비우기 (본 행사 시작용 ⭐)</span>
                  </div>
                  <p className="text-xs text-stone-600">
                    경품 설정은 유지하고, <strong>지금까지 추첨된 모든 당첨 결과(총 {validRecords.length}건)만 0건으로 삭제</strong>하여 본 행사 시작 전 깨끗한 상태로 만듭니다.
                  </p>
                </div>

                {confirmMode !== 'all' ? (
                  <button
                    id="btn-reset-all-draws-start"
                    onClick={() => {
                      audioEngine.playClick();
                      setConfirmMode('all');
                    }}
                    disabled={validRecords.length === 0}
                    className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                      validRecords.length > 0
                        ? 'bg-orange-600 hover:bg-orange-700 text-white active:scale-95'
                        : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    기록 전체 삭제
                  </button>
                ) : null}
              </div>

              {/* Confirmation Inline Box */}
              {confirmMode === 'all' && (
                <div className="mt-3 pt-3 border-t border-orange-300/80 flex items-center justify-between gap-2 animate-in fade-in duration-150">
                  <span className="text-xs font-bold text-orange-950">모든 당첨 결과({validRecords.length}건)를 삭제할까요?</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setConfirmMode(null)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-stone-600 hover:bg-stone-100 border border-stone-300 cursor-pointer"
                    >
                      취소
                    </button>
                    <button
                      id="btn-confirm-reset-all"
                      onClick={() => executeReset('all')}
                      className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-xs cursor-pointer active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>네, 전체 삭제</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Option 3: Full Factory Reset */}
            <div className={`p-4 rounded-2xl border transition-all ${
              confirmMode === 'factory'
                ? 'bg-rose-100/90 border-rose-400 ring-2 ring-rose-300'
                : 'bg-rose-50/70 border-rose-200/90 hover:bg-rose-50'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-1.5 font-bold text-rose-950 text-sm">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>시스템 전체 공장 초기화 (기본값 복원)</span>
                  </div>
                  <p className="text-xs text-rose-700">
                    모든 당첨 기록을 지우고, 경품 목록·단체 기관명·번호 범위(1~700)를 <strong>개관 20주년 표준 초기 상태</strong>로 되돌립니다.
                  </p>
                </div>

                {confirmMode !== 'factory' ? (
                  <button
                    id="btn-factory-reset-start"
                    onClick={() => {
                      audioEngine.playClick();
                      setConfirmMode('factory');
                    }}
                    className="shrink-0 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                  >
                    공장 초기화
                  </button>
                ) : null}
              </div>

              {/* Confirmation Inline Box */}
              {confirmMode === 'factory' && (
                <div className="mt-3 pt-3 border-t border-rose-300/80 flex items-center justify-between gap-2 animate-in fade-in duration-150">
                  <span className="text-xs font-bold text-rose-950">설정과 기록을 모두 기본값으로 리셋할까요?</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setConfirmMode(null)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-stone-600 hover:bg-stone-100 border border-stone-300 cursor-pointer"
                    >
                      취소
                    </button>
                    <button
                      id="btn-confirm-factory-reset"
                      onClick={() => executeReset('factory')}
                      className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-700 hover:bg-rose-800 text-white shadow-xs cursor-pointer active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>공장 초기화 실행</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 bg-stone-50 border-t border-stone-200 text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
            <span>초기화 시 Firebase 클라우드에 자동 즉각 동기화됩니다.</span>
          </div>

          <button
            onClick={() => {
              setConfirmMode(null);
              onClose();
            }}
            className="px-4 py-1.5 font-bold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
