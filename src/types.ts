export type DrawType = 'number' | 'group';

export interface PrizeTier {
  id: string;
  name: string; // e.g. "단체상", "1등", "2등", "3등", "4등", "5등", "7등"
  prizeName: string; // e.g. "TV", "청소기", "밥솥", "전자레인지", "에어프라이기(1명) / 믹서기(1명)"
  winnerCount: number; // e.g. 1, 2, 11
  drawType: DrawType; // 'group' for 단체상, 'number' for 1~700
  groupCandidates?: string[]; // List of organization/group names
  winnerItems?: string[]; // Item name per slot e.g. ['에어프라이기', '믹서기']
  rollDurationSeconds?: number; // Custom draw duration in seconds (7, 5, 4, 3, 2.5)
  badgeColor: string; // Tailwind color class or hex
  description?: string;
  order: number;
}

export interface DrawRecord {
  id: string;
  prizeId: string;
  prizeName: string;
  prizeItem: string;
  drawType: DrawType;
  ticketNumber?: number; // for number draw
  groupName?: string; // for group draw
  drawnAt: string; // ISO string
  isCancelled?: boolean;
}

export interface LotteryConfig {
  eventTitle: string; // "스무 살, 더 밝게 빛날 우리"
  organization: string; // "수원시장애인종합복지관"
  subTitle: string; // "기념식 경품 추첨"
  minNumber: number; // 1
  maxNumber: number; // 700
  excludedNumbers: number[]; // Excluded numbers
  allowDuplicates: boolean; // false
  rollDurationSeconds: number; // e.g. 3.5 seconds
  soundEnabled: boolean;
}

export interface AppState {
  config: LotteryConfig;
  prizes: PrizeTier[];
  records: DrawRecord[];
  activePrizeId: string;
}

