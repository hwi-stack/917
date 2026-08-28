import React, { useState } from 'react';
import { PrizeTier, LotteryConfig, DrawRecord, DrawType } from '../types';
import {
  Lock,
  Unlock,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  RotateCcw,
  Save,
  X,
  ShieldCheck,
  Sliders,
  Gift,
  Download,
  AlertTriangle,
  Building2,
  Hash,
} from 'lucide-react';
import { DEFAULT_CONFIG, DEFAULT_PRIZES, DEFAULT_GROUP_CANDIDATES, exportWinnersToCSV } from '../utils/storage';
import { audioEngine } from '../utils/audio';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: LotteryConfig;
  prizes: PrizeTier[];
  records: DrawRecord[];
  onSaveConfig: (config: LotteryConfig) => void;
  onSavePrizes: (prizes: PrizeTier[]) => void;
  onResetAllRecords: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  config,
  prizes,
  records,
  onSaveConfig,
  onSavePrizes,
  onResetAllRecords,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  // Form states
  const [tempConfig, setTempConfig] = useState<LotteryConfig>({ ...config });
  const [tempPrizes, setTempPrizes] = useState<PrizeTier[]>([...prizes]);
  const [excludedInput, setExcludedInput] = useState<string>(
    config.excludedNumbers.join(', ')
  );
  const [activeTab, setActiveTab] = useState<'prizes' | 'lottery' | 'data'>('prizes');

  if (!isOpen) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === '0926') {
      setIsAuthenticated(true);
      setPasswordError(false);
      audioEngine.playClick();
    } else {
      setPasswordError(true);
      setPasswordInput('');
    }
  };

  const handleSaveAll = () => {
    // Parse excluded numbers
    const parsedExcluded = excludedInput
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    const updatedConfig: LotteryConfig = {
      ...tempConfig,
      excludedNumbers: parsedExcluded,
    };

    onSaveConfig(updatedConfig);
    onSavePrizes(tempPrizes);
    audioEngine.playClick();
    alert('관리자 설정이 성공적으로 저장되었습니다!');
    onClose();
  };

  // Prize management actions
  const handleAddPrize = () => {
    const newId = `prize_${Date.now()}`;
    const newPrize: PrizeTier = {
      id: newId,
      name: `추가상 ${tempPrizes.length + 1}`,
      prizeName: '경품 상품명 입력',
      winnerCount: 1,
      drawType: 'number',
      badgeColor: 'amber',
      order: tempPrizes.length,
    };
    setTempPrizes([...tempPrizes, newPrize]);
  };

  const handleDeletePrize = (id: string, name: string) => {
    if (tempPrizes.length <= 1) {
      alert('최소 1개 이상의 경품 부문이 필요합니다.');
      return;
    }
    const conf = window.confirm(`'${name}' 부문을 삭제하시겠습니까?`);
    if (conf) {
      setTempPrizes(tempPrizes.filter((p) => p.id !== id));
    }
  };

  const handleUpdatePrizeField = <K extends keyof PrizeTier>(
    id: string,
    field: K,
    value: PrizeTier[K]
  ) => {
    setTempPrizes(
      tempPrizes.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleUpdateGroupCandidates = (id: string, text: string) => {
    const list = text
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    handleUpdatePrizeField(id, 'groupCandidates', list);
  };

  const handleMovePrize = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= tempPrizes.length) return;
    const newPrizes = [...tempPrizes];
    const temp = newPrizes[index];
    newPrizes[index] = newPrizes[newIndex];
    newPrizes[newIndex] = temp;
    setTempPrizes(newPrizes);
  };

  const handleResetToDefaults = () => {
    const conf = window.confirm(
      '경품 목록과 기본 설정을 초기 상태(수원시장애인종합복지관 20주년 기념식 세팅)로 복원하시겠습니까?'
    );
    if (conf) {
      setTempConfig({ ...DEFAULT_CONFIG });
      setTempPrizes([...DEFAULT_PRIZES]);
      setExcludedInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">관리자 설정 센터</h3>
              <p className="text-xs text-stone-400 font-medium">
                경품 등수 설정, 단체상 기관명 목록, 추첨 번호 범위(1~700) 및 시스템 제어
              </p>
            </div>
          </div>

          <button
            id="btn-close-admin-modal"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Authentication Gate */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <h4 className="text-2xl font-bold text-stone-800 mb-1">
              관리자 인증 (비밀번호: 0926)
            </h4>
            <p className="text-sm text-stone-500 max-w-sm mb-6">
              아이디 없이 관리자 비밀번호 4자리를 입력하시면 경품, 단체 기관명 및 번호 범위 설정을 변경할 수 있습니다.
            </p>

            <form onSubmit={handlePasswordSubmit} className="w-full max-w-xs flex flex-col gap-3">
              <input
                id="input-admin-password"
                type="password"
                maxLength={10}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="비밀번호 입력 (0926)"
                autoFocus
                className={`w-full text-center tracking-widest text-lg font-bold px-4 py-3 rounded-xl border ${
                  passwordError
                    ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50'
                    : 'border-stone-300 focus:ring-2 focus:ring-amber-500'
                }`}
              />

              {passwordError && (
                <p className="text-xs text-rose-600 font-semibold">
                  비밀번호가 올바르지 않습니다. (0926)
                </p>
              )}

              <button
                id="btn-submit-password"
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>관리자 로그인</span>
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Admin Dashboard */
          <>
            {/* Tabs */}
            <div className="flex items-center gap-2 px-6 py-2 bg-stone-100 border-b border-stone-200">
              <button
                id="tab-admin-prizes"
                onClick={() => setActiveTab('prizes')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'prizes'
                    ? 'bg-white text-stone-800 shadow-xs ring-1 ring-stone-200'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Gift className="w-4 h-4 text-orange-500" />
                <span>경품 부문 & 단체상 설정 ({tempPrizes.length}개)</span>
              </button>

              <button
                id="tab-admin-lottery"
                onClick={() => setActiveTab('lottery')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'lottery'
                    ? 'bg-white text-stone-800 shadow-xs ring-1 ring-stone-200'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Sliders className="w-4 h-4 text-amber-500" />
                <span>추첨 번호 범위 & 연출 설정</span>
              </button>

              <button
                id="tab-admin-data"
                onClick={() => setActiveTab('data')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'data'
                    ? 'bg-white text-stone-800 shadow-xs ring-1 ring-stone-200'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>데이터 초기화 & 백업</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* TAB 1: PRIZES SETTINGS */}
              {activeTab === 'prizes' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-stone-800">
                        경품 등수 및 단체상 기관명 관리
                      </h4>
                      <p className="text-xs text-stone-500">
                        등수명, 경품 상품명, 당첨 인원 및 단체상 기관명 목록을 수정하고 저장할 수 있습니다.
                      </p>
                    </div>

                    <button
                      id="btn-add-prize-tier"
                      onClick={handleAddPrize}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>경품 부문 추가</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {tempPrizes.map((prize, idx) => {
                      const isGroup = prize.drawType === 'group';
                      const candidates = prize.groupCandidates || [];

                      return (
                        <div
                          key={prize.id}
                          className="flex flex-col gap-3 p-4 rounded-2xl bg-stone-50 border border-stone-200 hover:border-amber-300 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
                            {/* Order Reorder */}
                            <div className="flex sm:flex-col items-center gap-1">
                              <button
                                onClick={() => handleMovePrize(idx, 'up')}
                                disabled={idx === 0}
                                className="p-1 rounded-md text-stone-400 hover:text-stone-700 disabled:opacity-20"
                                title="위로 이동"
                              >
                                <MoveUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleMovePrize(idx, 'down')}
                                disabled={idx === tempPrizes.length - 1}
                                className="p-1 rounded-md text-stone-400 hover:text-stone-700 disabled:opacity-20"
                                title="아래로 이동"
                              >
                                <MoveDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Tier Name */}
                            <div className="w-full sm:w-28">
                              <label className="block text-[10px] font-bold text-stone-400 uppercase">
                                부문/등수
                              </label>
                              <input
                                type="text"
                                value={prize.name}
                                onChange={(e) =>
                                  handleUpdatePrizeField(prize.id, 'name', e.target.value)
                                }
                                placeholder="예: 단체상, 1등"
                                className="w-full px-2.5 py-1.5 text-sm font-bold bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                              />
                            </div>

                            {/* Draw Type Selector */}
                            <div className="w-full sm:w-36">
                              <label className="block text-[10px] font-bold text-stone-400 uppercase">
                                추첨 방식
                              </label>
                              <select
                                value={prize.drawType || 'number'}
                                onChange={(e) => {
                                  const newType = e.target.value as DrawType;
                                  handleUpdatePrizeField(prize.id, 'drawType', newType);
                                  if (newType === 'group' && (!prize.groupCandidates || prize.groupCandidates.length === 0)) {
                                    handleUpdatePrizeField(prize.id, 'groupCandidates', DEFAULT_GROUP_CANDIDATES);
                                  }
                                }}
                                className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-stone-800"
                              >
                                <option value="number">🔢 번호 추첨 (1~700)</option>
                                <option value="group">🏢 단체상 (기관명 추첨)</option>
                              </select>
                            </div>

                            {/* Prize Item Description */}
                            <div className="w-full sm:flex-1">
                              <label className="block text-[10px] font-bold text-stone-400 uppercase">
                                경품 상품명 및 설명
                              </label>
                              <input
                                type="text"
                                value={prize.prizeName}
                                onChange={(e) =>
                                  handleUpdatePrizeField(prize.id, 'prizeName', e.target.value)
                                }
                                placeholder="예: 스마트 대형 TV, 화합과 나눔 특별 선물세트"
                                className="w-full px-2.5 py-1.5 text-sm bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium"
                              />
                            </div>

                            {/* Winner Count */}
                            <div className="w-24">
                              <label className="block text-[10px] font-bold text-stone-400 uppercase">
                                당첨 인원/곳
                              </label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min={1}
                                  max={20}
                                  value={prize.winnerCount}
                                  onChange={(e) =>
                                    handleUpdatePrizeField(
                                      prize.id,
                                      'winnerCount',
                                      Math.max(1, parseInt(e.target.value) || 1)
                                    )
                                  }
                                  className="w-full px-2 py-1.5 text-sm font-bold text-center bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                />
                                <span className="text-xs font-semibold text-stone-500">
                                  {isGroup ? '곳' : '명'}
                                </span>
                              </div>
                            </div>

                            {/* Delete Button */}
                            <div className="self-end sm:self-center mt-2 sm:mt-4">
                              <button
                                id={`btn-delete-prize-${prize.id}`}
                                onClick={() => handleDeletePrize(prize.id, prize.name)}
                                className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded-xl transition-colors"
                                title="이 경품 부문 삭제"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* GROUP PRIZE DEDICATED ORGANIZATION CANDIDATES EDITOR */}
                          {isGroup && (
                            <div className="mt-1 pt-3 border-t border-stone-200/80 bg-amber-50/70 p-3.5 rounded-xl border border-amber-200">
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                  <Building2 className="w-4 h-4 text-amber-700" />
                                  <span className="text-xs font-bold text-amber-900">
                                    추첨 대상 단체 기관명 작성 (줄바꿈으로 구분)
                                  </span>
                                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold">
                                    총 {candidates.length}개 기관 등록됨
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdatePrizeField(
                                      prize.id,
                                      'groupCandidates',
                                      DEFAULT_GROUP_CANDIDATES
                                    )
                                  }
                                  className="text-[11px] font-semibold text-amber-800 hover:text-amber-950 underline cursor-pointer"
                                >
                                  기본 유관기관 예시 불러오기
                                </button>
                              </div>

                              <p className="text-[11px] text-amber-700/90 mb-2">
                                긴 기관명(예: 사단법인 한국신장장애인협회 경기협회 수원시지부)도 자동 줄바꿈으로 깔끔하게 표시됩니다. 한 줄에 한 기관씩 입력해주세요.
                              </p>

                              <textarea
                                id={`textarea-group-candidates-${prize.id}`}
                                rows={4}
                                value={candidates.join('\n')}
                                onChange={(e) =>
                                  handleUpdateGroupCandidates(prize.id, e.target.value)
                                }
                                placeholder="예:&#10;수원시장애인주간보호시설&#10;호매실장애인종합복지관&#10;사단법인 한국신장장애인협회 경기협회 수원시지부"
                                className="w-full p-2.5 text-xs sm:text-sm font-medium bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-stone-800 leading-relaxed font-mono shadow-inner"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: LOTTERY & EVENT CONFIG */}
              {activeTab === 'lottery' && (
                <div className="space-y-6 max-w-2xl">
                  {/* Event Titles */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-stone-700">행사 명칭 및 슬로건</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-500 mb-1">
                          기관명
                        </label>
                        <input
                          type="text"
                          value={tempConfig.organization}
                          onChange={(e) =>
                            setTempConfig({ ...tempConfig, organization: e.target.value })
                          }
                          className="w-full px-3 py-2 text-sm font-medium bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-500 mb-1">
                          기념식 슬로건 / 행사명
                        </label>
                        <input
                          type="text"
                          value={tempConfig.eventTitle}
                          onChange={(e) =>
                            setTempConfig({ ...tempConfig, eventTitle: e.target.value })
                          }
                          className="w-full px-3 py-2 text-sm font-bold text-orange-700 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Lottery Number Range */}
                  <div className="space-y-3 pt-3 border-t border-stone-200">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-amber-600" />
                      <h4 className="text-sm font-bold text-stone-700">추첨 번호 범위 설정 (개인 경품용)</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-500 mb-1">
                          시작 번호 (기본 1번)
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={tempConfig.minNumber}
                          onChange={(e) =>
                            setTempConfig({
                              ...tempConfig,
                              minNumber: parseInt(e.target.value) || 1,
                            })
                          }
                          className="w-full px-3 py-2 text-sm font-bold bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-500 mb-1">
                          끝 번호 (기본 700번)
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={tempConfig.maxNumber}
                          onChange={(e) =>
                            setTempConfig({
                              ...tempConfig,
                              maxNumber: parseInt(e.target.value) || 700,
                            })
                          }
                          className="w-full px-3 py-2 text-sm font-bold bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    {/* Excluded numbers */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-500 mb-1">
                        추첨 제외 번호 (미배부 번호 등 쉼표로 구분: 예: 15, 38, 102)
                      </label>
                      <input
                        type="text"
                        value={excludedInput}
                        onChange={(e) => setExcludedInput(e.target.value)}
                        placeholder="예: 4, 13, 204 (없으면 공란)"
                        className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Suspense Roll Duration */}
                  <div className="space-y-3 pt-3 border-t border-stone-200">
                    <h4 className="text-sm font-bold text-stone-700">추첨 롤링 애니메이션 시간</h4>
                    <p className="text-xs text-stone-500">
                      당첨 번호는 자리수별(예: 2, 4, 6)로 순차 공개되어 긴장감을 극대화합니다.
                    </p>
                    <div className="flex items-center gap-3">
                      {[2, 3, 4, 5].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() =>
                            setTempConfig({ ...tempConfig, rollDurationSeconds: sec })
                          }
                          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                            tempConfig.rollDurationSeconds === sec
                              ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          {sec}초 {sec >= 4 ? '(긴장감 고조)' : '(표준)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duplicate rule toggle */}
                  <div className="pt-3 border-t border-stone-200">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!tempConfig.allowDuplicates}
                        onChange={(e) =>
                          setTempConfig({
                            ...tempConfig,
                            allowDuplicates: !e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-amber-600 rounded-sm focus:ring-amber-500"
                      />
                      <div>
                        <span className="text-sm font-bold text-stone-800">
                          중복 당첨 방지 (권장)
                        </span>
                        <p className="text-xs text-stone-500">
                          이미 다른 등수에 당첨된 행운 번호는 다음 추첨 시 자동으로 제외됩니다.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 3: DATA RESET & BACKUP */}
              {activeTab === 'data' && (
                <div className="space-y-6 max-w-xl">
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm">
                    <h4 className="font-bold text-amber-900 mb-1">
                      현재 저장된 당첨 결과 ({records.filter((r) => !r.isCancelled).length}건)
                    </h4>
                    <p className="text-xs text-amber-700 mb-3">
                      본 행사 전에 테스트한 추첨 기록을 비우거나, 전체 결과를 백업할 수 있습니다.
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => exportWinnersToCSV(records, config.eventTitle)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-bold shadow-xs hover:bg-amber-100/50"
                      >
                        <Download className="w-4 h-4 text-emerald-600" />
                        <span>결과 엑셀(CSV) 백업</span>
                      </button>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
                    <h4 className="font-bold text-rose-900">당첨 데이터 초기화</h4>
                    <p className="text-xs text-rose-700">
                      리허설 후 본 추첨을 위해 모든 당첨 기록을 깨끗하게 비웁니다.
                    </p>

                    <button
                      id="btn-reset-all-draws"
                      onClick={() => {
                        const conf = window.confirm(
                          '정말로 모든 당첨 기록을 초기화하시겠습니까? (이 작업은 되돌릴 수 없습니다)'
                        );
                        if (conf) {
                          onResetAllRecords();
                          alert('모든 당첨 기록이 초기화되었습니다.');
                        }
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>모든 당첨 기록 초기화 (본 행사 시작용)</span>
                    </button>
                  </div>

                  {/* Restore defaults */}
                  <div className="pt-2">
                    <button
                      onClick={handleResetToDefaults}
                      className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 font-semibold"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>기본 경품 목록(단체상, 1등~5등)으로 설정 초기화</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between px-6 py-4 bg-stone-50 border-t border-stone-200">
              <button
                onClick={onClose}
                className="px-4 py-2 font-bold text-stone-600 hover:text-stone-900 text-sm"
              >
                취소
              </button>

              <button
                id="btn-save-admin-config"
                onClick={handleSaveAll}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>설정 저장 및 적용</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

