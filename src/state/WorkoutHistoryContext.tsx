import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@workout_sessions';

export interface WorkoutSession {
  id: string;
  completedAt: string; // ISO string
  totalElapsedMs: number;
  estimatedCalories: number;
  programTitle: string;
}

export interface WorkoutStats {
  workoutsThisMonth: number;
  totalMinutes: number;
  totalCalories: number;
  streakDays: number;
}

interface WorkoutHistoryContextType {
  sessions: WorkoutSession[];
  addSession: (session: Omit<WorkoutSession, 'id'>) => void;
  stats: WorkoutStats;
}

const WorkoutHistoryContext = createContext<WorkoutHistoryContextType>({
  sessions: [],
  addSession: () => {},
  stats: { workoutsThisMonth: 0, totalMinutes: 0, totalCalories: 0, streakDays: 0 },
});

export const WorkoutHistoryProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(stored => { if (stored) setSessions(JSON.parse(stored)); })
      .catch(() => {});
  }, []);

  const addSession = useCallback((session: Omit<WorkoutSession, 'id'>) => {
    const newSession: WorkoutSession = {
      ...session,
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    };
    setSessions(prev => {
      const updated = [newSession, ...prev];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const stats = useMemo<WorkoutStats>(() => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const workoutsThisMonth = sessions.filter(
      s => new Date(s.completedAt) >= thisMonthStart,
    ).length;

    const totalMinutes = Math.round(
      sessions.reduce((sum, s) => sum + s.totalElapsedMs, 0) / 60000,
    );

    const totalCalories = sessions.reduce((sum, s) => sum + s.estimatedCalories, 0);

    // Streak: consecutive days back from today that have at least one session
    const dayStrings = new Set(
      sessions.map(s => {
        const d = new Date(s.completedAt);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      }),
    );
    let streak = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    while (dayStrings.has(`${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }

    return { workoutsThisMonth, totalMinutes, totalCalories, streakDays: streak };
  }, [sessions]);

  const value = useMemo(
    () => ({ sessions, addSession, stats }),
    [sessions, addSession, stats],
  );

  return (
    <WorkoutHistoryContext.Provider value={value}>
      {children}
    </WorkoutHistoryContext.Provider>
  );
};

export const useWorkoutHistory = () => useContext(WorkoutHistoryContext);
