import { LotteryConfig, PrizeTier, DrawRecord, AppState } from '../types';

const STORAGE_KEYS = {
  CONFIG: 'sw_rehab_lottery_config_v1',
  PRIZES: 'sw_rehab_lottery_prizes_v1',
  RECORDS: 'sw_rehab_lottery_records_v1',
  ACTIVE_PRIZE: 'sw_rehab_lottery_active_prize_v1',
};

export const DEFAULT_CONFIG: LotteryConfig = {
  eventTitle: '스무 살, 더 밝게 빛날 우리',
  organization: '수원시장애인종합복지관',
  subTitle: '개관 20주년 기념식 경품 추첨',
  minNumber: 1,
  maxNumber: 700,
  excludedNumbers: [],
  allowDuplicates: false,
  rollDurationSeconds: 4,
  soundEnabled: true,
};

export const DEFAULT_GROUP_CANDIDATES = [
  '수원시장애인주간보호시설',
  '호매실장애인종합복지관',
  '경기도지체장애인협회 수원시지회',
  '사단법인 한국신장장애인협회 경기협회 수원시지부',
  '수원시장애인가족지원센터',
  '수원시장애인직업재활시설 꿈자리보호작업장',
  '수원시장애인체육회',
  '수원시장애인자립생활센터',
  '사단법인 경기도시각장애인연합회 수원시지회',
  '수원시장애인부모회',
  '사단법인 한국농아인협회 경기도협회 수원시지회',
  '수원시장애인합창단',
];

export const DEFAULT_PRIZES: PrizeTier[] = [
  {
    id: 'prize_group',
    name: '단체상',
    prizeName: '화합과 나눔 특별 선물세트',
    winnerCount: 1,
    drawType: 'group',
    groupCandidates: DEFAULT_GROUP_CANDIDATES,
    badgeColor: 'amber',
    description: '기념식 참가 단체 및 유관기관 특별 부문',
    order: 0,
  },
  {
    id: 'prize_1',
    name: '1등',
    prizeName: '최신형 스마트 대형 TV',
    winnerCount: 1,
    drawType: 'number',
    badgeColor: 'rose',
    description: '최고의 영예 대망의 1등',
    order: 1,
  },
  {
    id: 'prize_2',
    name: '2등',
    prizeName: '프리미엄 무선 청소기',
    winnerCount: 1,
    drawType: 'number',
    badgeColor: 'orange',
    description: '풍성한 기쁨의 2등',
    order: 2,
  },
  {
    id: 'prize_3',
    name: '3등',
    prizeName: '스마트 공기청정기',
    winnerCount: 2,
    drawType: 'number',
    badgeColor: 'emerald',
    description: '청정 웰빙 라이프 3등',
    order: 3,
  },
  {
    id: 'prize_4',
    name: '4등',
    prizeName: '백화점 상품권 (10만원권)',
    winnerCount: 3,
    drawType: 'number',
    badgeColor: 'blue',
    description: '행운 가득 실속 선물 4등',
    order: 4,
  },
  {
    id: 'prize_5',
    name: '5등',
    prizeName: '건강 활력 선물세트',
    winnerCount: 5,
    drawType: 'number',
    badgeColor: 'purple',
    description: '모두 함께 나누는 5등',
    order: 5,
  },
];

export function loadSavedState(): AppState {
  try {
    const configStr = localStorage.getItem(STORAGE_KEYS.CONFIG);
    const prizesStr = localStorage.getItem(STORAGE_KEYS.PRIZES);
    const recordsStr = localStorage.getItem(STORAGE_KEYS.RECORDS);
    const activePrizeStr = localStorage.getItem(STORAGE_KEYS.ACTIVE_PRIZE);

    const config: LotteryConfig = configStr ? { ...DEFAULT_CONFIG, ...JSON.parse(configStr) } : DEFAULT_CONFIG;
    
    // Ensure existing prizes have drawType
    let prizes: PrizeTier[] = DEFAULT_PRIZES;
    if (prizesStr) {
      const loaded: PrizeTier[] = JSON.parse(prizesStr);
      prizes = loaded.map((p) => ({
        ...p,
        drawType: p.drawType || (p.id === 'prize_group' || p.name.includes('단체') ? 'group' : 'number'),
        groupCandidates: p.groupCandidates || (p.id === 'prize_group' ? DEFAULT_GROUP_CANDIDATES : []),
      }));
    }

    const records: DrawRecord[] = recordsStr ? JSON.parse(recordsStr) : [];
    
    // Validate active prize exists in prizes list
    let activePrizeId = activePrizeStr ? JSON.parse(activePrizeStr) : prizes[0]?.id || '';
    if (!prizes.some((p) => p.id === activePrizeId) && prizes.length > 0) {
      activePrizeId = prizes[0].id;
    }

    return {
      config,
      prizes,
      records,
      activePrizeId,
    };
  } catch (err) {
    console.error('Failed to load state from localStorage:', err);
    return {
      config: DEFAULT_CONFIG,
      prizes: DEFAULT_PRIZES,
      records: [],
      activePrizeId: DEFAULT_PRIZES[0].id,
    };
  }
}

export function saveState(state: Partial<AppState>) {
  try {
    if (state.config) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(state.config));
    }
    if (state.prizes) {
      localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(state.prizes));
    }
    if (state.records) {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(state.records));
    }
    if (state.activePrizeId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PRIZE, JSON.stringify(state.activePrizeId));
    }
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function exportWinnersToCSV(records: DrawRecord[], eventTitle: string) {
  const headers = ['순번', '추첨 부문', '경품 내역', '당첨 결과(번호/기관명)', '추첨 일시', '상태'];
  const validRecords = records.filter(r => !r.isCancelled);

  const rows = validRecords.map((r, idx) => {
    const date = new Date(r.drawnAt).toLocaleString('ko-KR');
    const winnerDisplay = r.drawType === 'group' ? (r.groupName || '') : (r.ticketNumber !== undefined ? `${r.ticketNumber}번` : '');
    return [
      idx + 1,
      `"${r.prizeName}"`,
      `"${r.prizeItem}"`,
      `"${winnerDisplay}"`,
      `"${date}"`,
      '당첨 확정',
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${eventTitle}_경품추첨결과_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
