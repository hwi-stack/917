import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  Firestore,
  DocumentSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { AppState, LotteryConfig, PrizeTier, DrawRecord } from '../types';
import { DEFAULT_CONFIG, DEFAULT_PRIZES, DEFAULT_GROUP_CANDIDATES } from './storage';

let app: FirebaseApp;
let db: Firestore;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  db = firebaseConfig.firestoreDatabaseId
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
}

const LOTTERY_STATE_COLLECTION = 'lottery_state';
const MAIN_DOC_ID = 'main';

export type SyncStatus = 'connecting' | 'connected' | 'syncing' | 'error';

/**
 * Save current state to Firestore cloud database
 */
export async function saveStateToFirestore(state: AppState): Promise<void> {
  if (!db) return;

  try {
    const docRef = doc(db, LOTTERY_STATE_COLLECTION, MAIN_DOC_ID);
    await setDoc(
      docRef,
      {
        config: state.config,
        prizes: state.prizes,
        records: state.records,
        activePrizeId: state.activePrizeId,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Failed to save state to Firestore:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time changes from Firestore
 */
export function subscribeToFirestoreState(
  onStateUpdate: (state: AppState) => void,
  onStatusChange?: (status: SyncStatus) => void
): () => void {
  if (!db) {
    onStatusChange?.('error');
    return () => {};
  }

  onStatusChange?.('connecting');

  const docRef = doc(db, LOTTERY_STATE_COLLECTION, MAIN_DOC_ID);

  const unsubscribe = onSnapshot(
    docRef,
    (snapshot: DocumentSnapshot) => {
      onStatusChange?.('connected');

      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data) {
          const config: LotteryConfig = data.config
            ? { ...DEFAULT_CONFIG, ...data.config }
            : DEFAULT_CONFIG;

          let prizes: PrizeTier[] = DEFAULT_PRIZES;
          if (Array.isArray(data.prizes) && data.prizes.length > 0) {
            prizes = data.prizes.map((p: Partial<PrizeTier>) => {
              const def = DEFAULT_PRIZES.find((dp) => dp.id === p.id);
              let winnerItems = p.winnerItems;
              if (!winnerItems || winnerItems.length === 0) {
                if (p.id === 'prize_4' || p.name?.includes('4등') || p.prizeName?.includes('에어프라이기')) {
                  winnerItems = ['에어프라이기', '믹서기'];
                } else if (def?.winnerItems) {
                  winnerItems = def.winnerItems;
                }
              }

              return {
                id: p.id || `prize_${Date.now()}`,
                name: p.name || '경품',
                prizeName: p.prizeName || '',
                winnerCount: p.winnerCount || 1,
                drawType: p.drawType || (p.id === 'prize_group' || (p.name && p.name.includes('단체')) ? 'group' : 'number'),
                groupCandidates: p.groupCandidates || (p.id === 'prize_group' ? DEFAULT_GROUP_CANDIDATES : []),
                winnerItems,
                rollDurationSeconds: p.rollDurationSeconds ?? def?.rollDurationSeconds,
                badgeColor: p.badgeColor || 'amber',
                description: p.description || '',
                order: typeof p.order === 'number' ? p.order : 0,
              };
            });
          }

          const records: DrawRecord[] = Array.isArray(data.records) ? data.records : [];
          const activePrizeId: string = data.activePrizeId || prizes[0]?.id || '';

          onStateUpdate({
            config,
            prizes,
            records,
            activePrizeId,
          });
        }
      } else {
        // Document does not exist yet; initialize it with defaults
        const initialState: AppState = {
          config: DEFAULT_CONFIG,
          prizes: DEFAULT_PRIZES,
          records: [],
          activePrizeId: DEFAULT_PRIZES[0].id,
        };
        saveStateToFirestore(initialState).catch((e) =>
          console.warn('Initial Firestore seeding failed:', e)
        );
      }
    },
    (error) => {
      console.error('Firestore subscription error:', error);
      onStatusChange?.('error');
    }
  );

  return unsubscribe;
}

/**
 * Fetch one-time initial state from Firestore
 */
export async function fetchStateFromFirestore(): Promise<AppState | null> {
  if (!db) return null;

  try {
    const docRef = doc(db, LOTTERY_STATE_COLLECTION, MAIN_DOC_ID);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      const data = snapshot.data();
      return {
        config: data.config ? { ...DEFAULT_CONFIG, ...data.config } : DEFAULT_CONFIG,
        prizes: Array.isArray(data.prizes) ? data.prizes : DEFAULT_PRIZES,
        records: Array.isArray(data.records) ? data.records : [],
        activePrizeId: data.activePrizeId || DEFAULT_PRIZES[0].id,
      };
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch Firestore state:', error);
    return null;
  }
}
