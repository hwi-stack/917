import React, { useState } from 'react';
import { DrawRecord, PrizeTier, LotteryConfig } from '../types';
import { X, Download, Printer, Search, Award, CheckCircle2, Building2, Trash2 } from 'lucide-react';
import { exportWinnersToCSV } from '../utils/storage';
import { audioEngine } from '../utils/audio';

interface WinnerHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: DrawRecord[];
  prizes: PrizeTier[];
  config: LotteryConfig;
  onCancelRecord: (recordId: string) => void;
  onResetAllRecords?: () => void;
}

export const WinnerHistoryModal: React.FC<WinnerHistoryModalProps> = ({
  isOpen,
  onClose,
  records,
  prizes,
  config,
  onCancelRecord,
  onResetAllRecords,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPrizeId, setFilterPrizeId] = useState<string>('ALL');

  if (!isOpen) return null;

  const validRecords = records.filter((r) => !r.isCancelled);

  // Filtering
  const filteredRecords = validRecords.filter((r) => {
    const ticketStr = r.ticketNumber !== undefined ? r.ticketNumber.toString() : '';
    const groupStr = r.groupName || '';
    const matchesSearch =
      ticketStr.includes(searchTerm) ||
      groupStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.prizeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.prizeItem.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrize = filterPrizeId === 'ALL' || r.prizeId === filterPrizeId;
    return matchesSearch && matchesPrize;
  });

  const handlePrint = () => {
    window.print();
  };

  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  const handleExportCSV = () => {
    audioEngine.playClick();
    exportWinnersToCSV(records, config.eventTitle);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-orange-500 text-white shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-stone-800">
                경품 추첨 당첨자 명단 및 기록
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                {config.organization} • {config.eventTitle} (총 당첨 {validRecords.length}건)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onResetAllRecords && validRecords.length > 0 && (
              !confirmDeleteAll ? (
                <button
                  id="btn-reset-history-records"
                  onClick={() => {
                    audioEngine.playClick();
                    setConfirmDeleteAll(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl shadow-xs transition-colors cursor-pointer"
                  title="추첨 기록 전체 삭제"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>기록 전체 초기화</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 bg-rose-100/90 border border-rose-300 px-2.5 py-1 rounded-xl animate-in fade-in">
                  <span className="text-xs font-bold text-rose-900">정말 삭제할까요?</span>
                  <button
                    onClick={() => {
                      audioEngine.playClick();
                      onResetAllRecords();
                      setConfirmDeleteAll(false);
                    }}
                    className="px-2 py-0.5 rounded text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer"
                  >
                    삭제
                  </button>
                  <button
                    onClick={() => setConfirmDeleteAll(false)}
                    className="px-2 py-0.5 rounded text-xs font-semibold bg-white text-stone-700 hover:bg-stone-100 border border-stone-300 cursor-pointer"
                  >
                    취소
                  </button>
                </div>
              )
            )}

            <button
              id="btn-export-csv"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>CSV 엑셀 다운로드</span>
            </button>

            <button
              id="btn-print-winners"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-blue-600" />
              <span>명단 인쇄</span>
            </button>

            <button
              id="btn-close-history"
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-stone-50/80 border-b border-stone-200 text-sm">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="당첨 번호, 단체 기관명, 경품명 검색..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-600">부문 필터:</span>
            <select
              value={filterPrizeId}
              onChange={(e) => setFilterPrizeId(e.target.value)}
              className="px-3 py-1.5 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium text-stone-700"
            >
              <option value="ALL">전체 경품 부문 ({validRecords.length}건)</option>
              {prizes.map((p) => {
                const count = validRecords.filter((r) => r.prizeId === p.id).length;
                return (
                  <option key={p.id} value={p.id}>
                    {p.name} ({count}/{p.winnerCount}{p.drawType === 'group' ? '곳' : '명'})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredRecords.length === 0 ? (
            <div className="py-16 text-center text-stone-400">
              <Award className="w-12 h-12 mx-auto mb-3 opacity-30 text-amber-500" />
              <p className="font-semibold text-stone-600">추첨된 당첨 기록이 없습니다.</p>
              <p className="text-xs text-stone-400 mt-1">
                무대 화면에서 추첨을 시작하면 결과가 실시간으로 자동 기록됩니다.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-stone-200 shadow-xs">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-stone-100/80 text-stone-600 text-xs font-bold border-b border-stone-200">
                    <th className="py-3 px-4 text-center w-16">순번</th>
                    <th className="py-3 px-4">추첨 부문</th>
                    <th className="py-3 px-4">경품 내역</th>
                    <th className="py-3 px-4 text-center">당첨 결과 (번호 / 기관명)</th>
                    <th className="py-3 px-4">추첨 일시</th>
                    <th className="py-3 px-4 text-center">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                  {filteredRecords.map((record, index) => {
                    const isGroup = record.drawType === 'group' || !!record.groupName;

                    return (
                      <tr key={record.id} className="hover:bg-amber-50/50 transition-colors">
                        <td className="py-3 px-4 text-center text-xs text-stone-400">
                          {index + 1}
                        </td>
                        <td className="py-3 px-4 font-bold text-orange-700">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-100/70 text-orange-800 text-xs">
                            {isGroup && <Building2 className="w-3 h-3 text-orange-700" />}
                            {record.prizeName}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-stone-800">
                          {record.prizeItem}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isGroup ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm rounded-xl shadow-xs">
                              <Building2 className="w-4 h-4 text-amber-200 shrink-0" />
                              <span>{record.groupName}</span>
                            </span>
                          ) : (
                            <span className="inline-block px-3 py-1 bg-amber-500 text-white font-black text-base rounded-xl shadow-xs">
                              {String(record.ticketNumber).padStart(3, '0')}번
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-stone-500">
                          {new Date(record.drawnAt).toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            id={`btn-cancel-record-${record.id}`}
                            onClick={() => {
                              const targetLabel = isGroup ? record.groupName : `${record.ticketNumber}번`;
                              const conf = window.confirm(
                                `[${record.prizeName}] ${targetLabel} 당첨 기록을 무효화/취소하시겠습니까?`
                              );
                              if (conf) {
                                onCancelRecord(record.id);
                              }
                            }}
                            className="text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 font-medium transition-colors cursor-pointer"
                            title="부재 또는 미수령으로 인한 당첨 취소"
                          >
                            당첨 취소
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 bg-stone-50 border-t border-stone-200 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>모든 당첨 데이터는 브라우저 저장소에 안전하게 자동 보관됩니다.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 font-bold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
