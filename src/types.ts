export type DrawType = 'number' | 'group';

export interface PrizeTier {
  id: string;
  name: string; // e.g. "단체상", "1등", "2등", "3등", "4등", "5등"
  prizeName: string; // e.g. "화합과 나눔 특별 선물세트", "스마트 TV"
  winnerCount: number; // e.g. 1, 3
  drawType: DrawType; // 'group' for 단체상, 'number' for 1~700
  groupCandidates?: string[]; // List of organization/group names
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

