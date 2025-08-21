import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ProgressState,
  ProgressActions,
  UserProgress,
  ContentType,
} from '../types/library';

const STORAGE_KEY = '@user_progress';

// Context
const UserProgressContext = createContext<{
  state: ProgressState;
  actions: ProgressActions;
}>({
  state: { userProgress: {}, isLoading: false },
  actions: {
    updateProgress: () => {},
    getProgress: () => null,
    getContinueItems: () => [],
  },
});

// Provider component
export const UserProgressProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [userProgress, setUserProgress] = useState<
    Record<string, UserProgress>
  >({});
  const [isLoading, setIsLoading] = useState(false);

  // Load progress from storage on mount
  useEffect(() => {
    loadProgressFromStorage();
  }, []);

  const loadProgressFromStorage = useCallback(async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserProgress(parsed);
      }
    } catch (error) {
      console.error('Failed to load user progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveProgressToStorage = useCallback(
    async (progress: Record<string, UserProgress>) => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      } catch (error) {
        console.error('Failed to save user progress:', error);
      }
    },
    [],
  );

  const updateProgress = useCallback(
    (entityId: string, progress: Partial<UserProgress>) => {
      setUserProgress(prev => {
        const existing = prev[entityId];
        const updated = {
          ...existing,
          ...progress,
          entityId,
          lastAccessedAt: new Date().toISOString(),
        } as UserProgress;

        const newProgress = {
          ...prev,
          [entityId]: updated,
        };

        // Save to storage asynchronously
        saveProgressToStorage(newProgress);

        return newProgress;
      });
    },
    [saveProgressToStorage],
  );

  const getProgress = useCallback(
    (entityId: string): UserProgress | null => {
      return userProgress[entityId] || null;
    },
    [userProgress],
  );

  const getContinueItems = useCallback((): UserProgress[] => {
    return Object.values(userProgress)
      .filter(
        progress =>
          progress.progressPercent > 0 &&
          progress.progressPercent < 100 &&
          !progress.completedAt,
      )
      .sort(
        (a, b) =>
          new Date(b.lastAccessedAt).getTime() -
          new Date(a.lastAccessedAt).getTime(),
      )
      .slice(0, 10); // Limit to 10 most recent items
  }, [userProgress]);

  const state: ProgressState = useMemo(
    () => ({
      userProgress,
      isLoading,
    }),
    [userProgress, isLoading],
  );

  const actions: ProgressActions = useMemo(
    () => ({
      updateProgress,
      getProgress,
      getContinueItems,
    }),
    [updateProgress, getProgress, getContinueItems],
  );

  const value = useMemo(
    () => ({
      state,
      actions,
    }),
    [state, actions],
  );

  return (
    <UserProgressContext.Provider value={value}>
      {children}
    </UserProgressContext.Provider>
  );
};

// Hook
export const useUserProgress = () => {
  const context = useContext(UserProgressContext);
  if (!context) {
    throw new Error(
      'useUserProgress must be used within a UserProgressProvider',
    );
  }
  return context;
};

// Utility functions for progress calculations
export const calculateProgressPercentage = (
  currentSession: number,
  totalSessions: number,
): number => {
  if (totalSessions === 0) return 0;
  return Math.min(100, Math.round((currentSession / totalSessions) * 100));
};

export const getNextSessionInfo = (
  progress: UserProgress,
  totalSessions: number,
): string => {
  if (progress.completedAt) return 'Completed';

  const nextSession = (progress.currentSession || 0) + 1;
  if (nextSession > totalSessions) return 'Completed';

  return `Session ${nextSession} of ${totalSessions}`;
};

export const formatProgressText = (progress: UserProgress): string => {
  if (progress.completedAt) return 'Completed';

  if (progress.entityType === 'program') {
    const week = progress.currentWeek || 1;
    const session = progress.currentSession || 1;
    return `Week ${week}, Session ${session}`;
  }

  if (progress.entityType === 'challenge') {
    return `Day ${progress.currentSession || 1}`;
  }

  return `${progress.progressPercent}% complete`;
};
