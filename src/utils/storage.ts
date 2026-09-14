import { LotteryConfig, PrizeTier, DrawRecord, AppState } from '../types';

const STORAGE_KEYS = {
  CONFIG: 'sw_rehab_lottery_config_v4',
  PRIZES: 'sw_rehab_lottery_prizes_v4',
  RECORDS: 'sw_rehab_lottery_records_v4',
  ACTIVE_PRIZE: 'sw_rehab_lottery_active_prize_v4',
};

export const DEFAULT_CONFIG: LotteryConfig = {
  eventTitle: '스무 살, 더 밝게 빛날 우리',
  organization: '수원시장애인종합복지관',
  subTitle: '개관 20주년 기념식 경품 추첨',
  minNumber: 1,
  maxNumber: 700,
  excludedNumbers: [],
  allowDuplicates: false,
  rollDurationSeconds: 2.5,
  soundEnabled: true,
};

export const DEFAULT_GROUP_CANDIDATES = [
  '보듬 경기남부피해장애인쉼터',
  '구세군장애인주간이용시설',
  '별무리장애인주간이용시설',
  '에이블장애인직업적응훈련센터',
  '수원시오목천동장애인주간이용시설',
  '노을빛장애인주간이용센터',
  '경기도 최중증발달장애인 통합돌봄센터 제2호',
  '꿈자리보금자리',
  '수원시정자동장애인주간이용시설',
  '수원시성인정신건강복지센터',
  '마음샘정신재활센터',
  '호매실장애인종합복지관 주간이용시설',
  '수원시광교장애인주간이용시설',
];

export const DEFAULT_PRIZES: PrizeTier[] = [
  {
    id: 'prize_group',
    name: '단체상',
    prizeName: 'TV',
    winnerCount: 1,
    drawType: 'group',
    groupCandidates: DEFAULT_GROUP_CANDIDATES,
    rollDurationSeconds: 5,
    badgeColor: 'amber',
    description: '기념식 참가 유관기관 특별 부문 (TV)',
    order: 0,
  },
  {
    id: 'prize_1',
    name: '1등',
    prizeName: '청소기',
    winnerCount: 1,
    drawType: 'number',
    rollDurationSeconds: 4,
    badgeColor: 'rose',
    description: '최고의 영예 대망의 1등 (청소기 1명)',
    order: 1,
  },
  {
    id: 'prize_2',
    name: '2등',
    prizeName: '밥솥',
    winnerCount: 1,
    drawType: 'number',
    rollDurationSeconds: 3.5,
    badgeColor: 'orange',
    description: '기쁨 가득 2등 (밥솥 1명)',
    order: 2,
  },
  {
    id: 'prize_3',
    name: '3등',
    prizeName: '에어프라이어',
    winnerCount: 1,
    drawType: 'number',
    rollDurationSeconds: 3,
    badgeColor: 'emerald',
    description: '실속 만점 3등 (에어프라이어 1명)',
    order: 3,
  },
  {
    id: 'prize_4',
    name: '4등',
    prizeName: '헤어 드라이기 / 믹서기',
    winnerCount: 3,
    winnerItems: ['헤어 드라이기', '헤어 드라이기', '믹서기'],
    drawType: 'number',
    rollDurationSeconds: 2.5,
    badgeColor: 'blue',
    description: '헤어 드라이기 2명, 믹서기 1명',
    order: 4,
  },
  {
    id: 'prize_5',
    name: '5등',
    prizeName: '냄비세트',
    winnerCount: 11,
    winnerItems: Array(11).fill('냄비세트'),
    drawType: 'number',
    rollDurationSeconds: 2,
    badgeColor: 'purple',
    description: '풍성한 나눔 5등 (냄비세트 11명)',
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
    
    // Ensure existing prizes have drawType, winnerItems, rollDurationSeconds
    let prizes: PrizeTier[] = DEFAULT_PRIZES;
    if (prizesStr) {
      const loaded: PrizeTier[] = JSON.parse(prizesStr);
      prizes = loaded.map((p) => {
        const def = DEFAULT_PRIZES.find((dp) => dp.id === p.id);
        let winnerItems = p.winnerItems;
        if (!winnerItems || winnerItems.length === 0) {
          if (def?.winnerItems) {
            winnerItems = def.winnerItems;
          }
        }
        return {
          ...p,
          drawType: p.drawType || (p.id === 'prize_group' || p.name.includes('단체') ? 'group' : 'number'),
          groupCandidates: p.groupCandidates || (p.id === 'prize_group' ? DEFAULT_GROUP_CANDIDATES : []),
          winnerItems,
          rollDurationSeconds: p.rollDurationSeconds ?? def?.rollDurationSeconds,
        };
      });
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

/**
 * Returns distinct item label for a slot if the prize tier has different items per winner (e.g. 4등: 에어프라이기, 믹서기).
 * For single-item tiers (1등 청소기, 2등 밥솥, 7등 냄비세트), returns undefined so only clean numbers are shown.
 */
export function getSlotItemLabel(prize: PrizeTier | undefined, slotIndex: number): string | undefined {
  if (!prize) return undefined;

  // 1. Explicit winnerItems with distinct values
  if (Array.isArray(prize.winnerItems) && prize.winnerItems.length > 0) {
    const validItems = prize.winnerItems.map((s) => (s ? String(s).trim() : '')).filter(Boolean);
    const uniqueSet = new Set(validItems);
    if (uniqueSet.size > 1) {
      return validItems[slotIndex] || undefined;
    }
  }

  // 2. Fallback for 4등 or multi-item prize names
  const pName = prize.prizeName || '';
  if (
    pName.includes('헤어 드라이기') ||
    pName.includes('드라이기') ||
    pName.includes('믹서기') ||
    pName.includes('에어프라이기') ||
    pName.includes('/') ||
    pName.includes(',') ||
    prize.name?.includes('4등') ||
    prize.id === 'prize_4'
  ) {
    if (prize.winnerItems && prize.winnerItems.length > slotIndex) {
      return prize.winnerItems[slotIndex];
    }
    const defaults = ['헤어 드라이기', '헤어 드라이기', '믹서기'];
    return defaults[slotIndex] || undefined;
  }

  return undefined;
}

