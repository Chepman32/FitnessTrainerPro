import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserProgressProvider,
  useUserProgress,
} from '../../state/UserProgressContext';
import {
  calculateProgressPercentage,
  getNextSessionInfo,
  formatProgressText,
} from '../../state/UserProgressContext';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <UserProgressProvider>{children}</UserProgressProvider>
);

describe('UserProgressContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useUserProgress(), { wrapper });

      expect(result.current.state).toEqual({
        userProgress: {},
        isLoading: false,
      });
    });

    it('should load progress from storage on mount', async () => {
      const mockProgress = {
        'program-1': {
          entityId: 'program-1',
          entityType: 'program' as const,
          progressPercent: 50,
          currentWeek: 2,
          currentSession: 3,
          lastAccessedAt: '2024-01-01T00:00:00Z',
        },
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockProgress),
      );

      const { result } = renderHook(() => useUserProgress(), { wrapper });

      // Wait for async loading
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.state.userProgress).toEqual(mockProgress);
    });
  });

  describe('Progress Management', () => {
    it('should update progress correctly', async () => {
      const { result } = renderHook(() => useUserProgress(), { wrapper });

      await act(async () => {
        result.current.actions.updateProgress('program-1', {
          entityType: 'program',
          progressPercent: 25,
          currentWeek: 1,
          currentSession: 2,
        });
      });

      const progress = result.current.actions.getProgress('program-1');
      expect(progress).toMatchObject({
        entityId: 'program-1',
        entityType: 'program',
        progressPercent: 25,
        currentWeek: 1,
        currentSession: 2,
      });
      expect(progress?.lastAccessedAt).toBeTruthy();
    });

    it('should get progress correctly', () => {
      const { result } = renderHook(() => useUserProgress(), { wrapper });

      // First update progress
      act(() => {
        result.current.actions.updateProgress('workout-1', {
          entityType: 'workout',
          progressPercent: 100,
        });
      });

      const progress = result.current.actions.getProgress('workout-1');
      expect(progress?.entityId).toBe('workout-1');
      expect(progress?.progressPercent).toBe(100);
    });

    it('should return null for non-existent progress', () => {
      const { result } = renderHook(() => useUserProgress(), { wrapper });

      const progress = result.current.actions.getProgress('non-existent');
      expect(progress).toBeNull();
    });
  });

  describe('Continue Items', () => {
    it('should get continue items correctly', () => {
      const { result } = renderHook(() => useUserProgress(), { wrapper });

      // Add some progress items
      act(() => {
        result.current.actions.updateProgress('program-1', {
          entityType: 'program',
          progressPercent: 50,
        });

        result.current.actions.updateProgress('challenge-1', {
          entityType: 'challenge',
          progressPercent: 75,
        });

        result.current.actions.updateProgress('program-2', {
          entityType: 'program',
          progressPercent: 100, // Completed - should not appear
          completedAt: '2024-01-01T00:00:00Z',
        });

        result.current.actions.updateProgress('program-3', {
          entityType: 'program',
          progressPercent: 0, // Not started - should not appear
        });
      });

      const continueItems = result.current.actions.getContinueItems();

      expect(continueItems).toHaveLength(2);
      expect(continueItems.map(item => item.entityId)).toContain('program-1');
      expect(continueItems.map(item => item.entityId)).toContain('challenge-1');
      expect(continueItems.map(item => item.entityId)).not.toContain(
        'program-2',
      );
      expect(continueItems.map(item => item.entityId)).not.toContain(
        'program-3',
      );
    });

    it('should sort continue items by last accessed date', () => {
      const { result } = renderHook(() => useUserProgress(), { wrapper });

      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

      act(() => {
        result.current.actions.updateProgress('program-1', {
          entityType: 'program',
          progressPercent: 50,
          lastAccessedAt: twoDaysAgo.toISOString(),
        });

        result.current.actions.updateProgress('program-2', {
          entityType: 'program',
          progressPercent: 25,
          lastAccessedAt: now.toISOString(),
        });

        result.current.actions.updateProgress('program-3', {
          entityType: 'program',
          progressPercent: 75,
          lastAccessedAt: yesterday.toISOString(),
        });
      });

      const continueItems = result.current.actions.getContinueItems();

      expect(continueItems[0].entityId).toBe('program-2'); // Most recent
      expect(continueItems[1].entityId).toBe('program-3'); // Yesterday
      expect(continueItems[2].entityId).toBe('program-1'); // Two days ago
    });

    it('should limit continue items to 10', () => {
      const { result } = renderHook(() => useUserProgress(), { wrapper });

      // Add 15 progress items
      act(() => {
        for (let i = 1; i <= 15; i++) {
          result.current.actions.updateProgress(`program-${i}`, {
            entityType: 'program',
            progressPercent: 50,
          });
        }
      });

      const continueItems = result.current.actions.getContinueItems();
      expect(continueItems).toHaveLength(10);
    });
  });

  describe('Storage Integration', () => {
    it('should save progress to storage when updated', async () => {
      const { result } = renderHook(() => useUserProgress(), { wrapper });

      await act(async () => {
        result.current.actions.updateProgress('program-1', {
          entityType: 'program',
          progressPercent: 50,
        });
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@user_progress',
        expect.stringContaining('program-1'),
      );
    });

    it('should handle storage errors gracefully', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(
        new Error('Storage error'),
      );

      const { result } = renderHook(() => useUserProgress(), { wrapper });

      // Should not throw
      await act(async () => {
        result.current.actions.updateProgress('program-1', {
          entityType: 'program',
          progressPercent: 50,
        });
      });

      // Progress should still be updated in memory
      const progress = result.current.actions.getProgress('program-1');
      expect(progress?.progressPercent).toBe(50);
    });
  });
});

describe('Progress Utility Functions', () => {
  describe('calculateProgressPercentage', () => {
    it('should calculate progress percentage correctly', () => {
      expect(calculateProgressPercentage(5, 10)).toBe(50);
      expect(calculateProgressPercentage(3, 12)).toBe(25);
      expect(calculateProgressPercentage(10, 10)).toBe(100);
      expect(calculateProgressPercentage(0, 10)).toBe(0);
    });

    it('should handle edge cases', () => {
      expect(calculateProgressPercentage(5, 0)).toBe(0);
      expect(calculateProgressPercentage(15, 10)).toBe(100); // Should cap at 100%
    });
  });

  describe('getNextSessionInfo', () => {
    it('should return correct next session info', () => {
      const progress = {
        entityId: 'program-1',
        entityType: 'program' as const,
        progressPercent: 50,
        currentSession: 5,
        lastAccessedAt: '2024-01-01T00:00:00Z',
      };

      expect(getNextSessionInfo(progress, 10)).toBe('Session 6 of 10');
    });

    it('should handle completed progress', () => {
      const progress = {
        entityId: 'program-1',
        entityType: 'program' as const,
        progressPercent: 100,
        currentSession: 10,
        lastAccessedAt: '2024-01-01T00:00:00Z',
        completedAt: '2024-01-01T00:00:00Z',
      };

      expect(getNextSessionInfo(progress, 10)).toBe('Completed');
    });

    it('should handle session overflow', () => {
      const progress = {
        entityId: 'program-1',
        entityType: 'program' as const,
        progressPercent: 100,
        currentSession: 10,
        lastAccessedAt: '2024-01-01T00:00:00Z',
      };

      expect(getNextSessionInfo(progress, 10)).toBe('Completed');
    });
  });

  describe('formatProgressText', () => {
    it('should format program progress correctly', () => {
      const progress = {
        entityId: 'program-1',
        entityType: 'program' as const,
        progressPercent: 50,
        currentWeek: 2,
        currentSession: 3,
        lastAccessedAt: '2024-01-01T00:00:00Z',
      };

      expect(formatProgressText(progress)).toBe('Week 2, Session 3');
    });

    it('should format challenge progress correctly', () => {
      const progress = {
        entityId: 'challenge-1',
        entityType: 'challenge' as const,
        progressPercent: 50,
        currentSession: 5,
        lastAccessedAt: '2024-01-01T00:00:00Z',
      };

      expect(formatProgressText(progress)).toBe('Day 5');
    });

    it('should format completed progress correctly', () => {
      const progress = {
        entityId: 'program-1',
        entityType: 'program' as const,
        progressPercent: 100,
        currentWeek: 4,
        currentSession: 12,
        lastAccessedAt: '2024-01-01T00:00:00Z',
        completedAt: '2024-01-01T00:00:00Z',
      };

      expect(formatProgressText(progress)).toBe('Completed');
    });

    it('should format generic progress correctly', () => {
      const progress = {
        entityId: 'workout-1',
        entityType: 'workout' as const,
        progressPercent: 75,
        lastAccessedAt: '2024-01-01T00:00:00Z',
      };

      expect(formatProgressText(progress)).toBe('75% complete');
    });
  });
});
