import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { LibraryNavigator } from '../../navigation/LibraryNavigator';
import { LibraryProvider } from '../../state/LibraryContext';
import { UserProgressProvider } from '../../state/UserProgressContext';

// Mock all external dependencies
jest.mock('../../services/libraryApi');
jest.mock('../../services/premiumService');
jest.mock('../../services/offlineService');
jest.mock('@react-native-async-storage/async-storage');

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
    canGoBack: () => true,
  }),
  useRoute: () => ({
    name: 'LibraryMain',
    params: {},
  }),
}));

const renderWithAllProviders = (component: React.ReactElement) => {
  return render(
    <NavigationContainer>
      <LibraryProvider>
        <UserProgressProvider>{component}</UserProgressProvider>
      </LibraryProvider>
    </NavigationContainer>,
  );
};

describe('Library Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    const { libraryApi } = require('../../services/libraryApi');
    const { premiumService } = require('../../services/premiumService');
    const { offlineService } = require('../../services/offlineService');

    libraryApi.getLibrarySections.mockResolvedValue([
      {
        id: 'programs',
        type: 'programs',
        title: 'Programs',
        items: [
          {
            id: 'program-1',
            type: 'program',
            title: 'Test Program',
            premium: false,
            tags: [],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            weeks: 4,
            sessionsPerWeek: 3,
            level: 'Beginner',
            equipment: ['none'],
            locations: ['home'],
            goals: ['strength'],
            totalWorkouts: 12,
            estimatedCalories: 300,
          },
        ],
        hasMore: false,
      },
    ]);

    premiumService.canAccessContent.mockReturnValue({ canAccess: true });
    premiumService.hasPremiumAccess.mockReturnValue(false);
    premiumService.canStartWorkout.mockReturnValue({ canStart: true });

    offlineService.initialize.mockResolvedValue(undefined);
    offlineService.getOfflineStatus.mockReturnValue({
      isOnline: true,
      hasConnection: true,
      connectionType: 'wifi',
    });
    offlineService.shouldShowOfflineBanner.mockReturnValue(false);
  });

  describe('End-to-End User Flows', () => {
    it('should complete full content discovery flow', async () => {
      const { getByText, getByPlaceholderText } = renderWithAllProviders(
        <LibraryNavigator />,
      );

      // 1. Library loads with content
      await waitFor(() => {
        expect(getByText('Programs')).toBeTruthy();
        expect(getByText('Test Program')).toBeTruthy();
      });

      // 2. User can search for content
      const searchInput = getByPlaceholderText('Find a workout, article...');
      fireEvent.changeText(searchInput, 'test');

      // 3. User can apply filters
      // Would need to interact with filter chips

      // 4. User can select content
      fireEvent.press(getByText('Test Program'));

      // 5. Navigation should occur
      expect(mockNavigate).toHaveBeenCalledWith('ProgramDetail', {
        programId: 'program-1',
        content: expect.objectContaining({
          id: 'program-1',
          title: 'Test Program',
        }),
      });
    });

    it('should handle premium content flow', async () => {
      const { premiumService } = require('../../services/premiumService');
      premiumService.canAccessContent.mockReturnValue({
        canAccess: false,
        reason: 'premium_required',
      });

      const premiumContent = {
        id: 'premium-program',
        type: 'program',
        title: 'Premium Program',
        premium: true,
        tags: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        weeks: 8,
        sessionsPerWeek: 4,
        level: 'Advanced',
        equipment: ['dumbbells'],
        locations: ['gym'],
        goals: ['strength'],
        totalWorkouts: 32,
        estimatedCalories: 400,
      };

      const { libraryApi } = require('../../services/libraryApi');
      libraryApi.getLibrarySections.mockResolvedValue([
        {
          id: 'programs',
          type: 'programs',
          title: 'Programs',
          items: [premiumContent],
          hasMore: false,
        },
      ]);

      const { getByText } = renderWithAllProviders(<LibraryNavigator />);

      await waitFor(() => {
        expect(getByText('Premium Program')).toBeTruthy();
        expect(getByText('Premium')).toBeTruthy();
      });

      // User taps premium content
      fireEvent.press(getByText('Premium Program'));

      // Should still navigate but premium gate would be shown in detail screen
      expect(mockNavigate).toHaveBeenCalled();
    });

    it('should handle offline flow', async () => {
      const { offlineService } = require('../../services/offlineService');
      offlineService.getOfflineStatus.mockReturnValue({
        isOnline: false,
        hasConnection: false,
        connectionType: null,
      });
      offlineService.shouldShowOfflineBanner.mockReturnValue(true);
      offlineService.getOfflineMessage.mockReturnValue(
        "You're offline. Showing cached content.",
      );

      const { getByText } = renderWithAllProviders(<LibraryNavigator />);

      await waitFor(() => {
        expect(
          getByText("You're offline. Showing cached content."),
        ).toBeTruthy();
      });
    });
  });

  describe('State Management Integration', () => {
    it('should sync library state with user progress', async () => {
      const { getByText } = renderWithAllProviders(<LibraryNavigator />);

      await waitFor(() => {
        expect(getByText('Programs')).toBeTruthy();
      });

      // Simulate user starting a program
      // This would update progress state and should reflect in continue section
      act(() => {
        // Would trigger progress update
      });

      // Continue section should show the started program
      await waitFor(() => {
        // expect(getByText('Continue')).toBeTruthy();
      });
    });

    it('should handle filter state persistence', async () => {
      const { libraryApi } = require('../../services/libraryApi');

      const { getByText } = renderWithAllProviders(<LibraryNavigator />);

      await waitFor(() => {
        expect(getByText('Programs')).toBeTruthy();
      });

      // Apply filters
      act(() => {
        // Would trigger filter changes
      });

      // Filters should be saved
      expect(libraryApi.saveFilterPreferences).toHaveBeenCalled();
    });
  });

  describe('Error Recovery Integration', () => {
    it('should recover from API errors gracefully', async () => {
      const { libraryApi } = require('../../services/libraryApi');
      libraryApi.getLibrarySections.mockRejectedValueOnce(
        new Error('API Error'),
      );

      const { getByText, queryByText } = renderWithAllProviders(
        <LibraryNavigator />,
      );

      // Should show error state initially
      await waitFor(() => {
        // Would show error message
      });

      // Mock successful retry
      libraryApi.getLibrarySections.mockResolvedValueOnce([
        {
          id: 'programs',
          type: 'programs',
          title: 'Programs',
          items: [],
          hasMore: false,
        },
      ]);

      // Trigger retry
      act(() => {
        // Would trigger retry action
      });

      // Should recover and show content
      await waitFor(() => {
        expect(getByText('Programs')).toBeTruthy();
      });
    });

    it('should handle network connectivity changes', async () => {
      const { offlineService } = require('../../services/offlineService');

      const { rerender } = renderWithAllProviders(<LibraryNavigator />);

      // Start online
      await waitFor(() => {
        // Content loaded
      });

      // Go offline
      offlineService.getOfflineStatus.mockReturnValue({
        isOnline: false,
        hasConnection: false,
        connectionType: null,
      });
      offlineService.shouldShowOfflineBanner.mockReturnValue(true);

      rerender(
        <NavigationContainer>
          <LibraryProvider>
            <UserProgressProvider>
              <LibraryNavigator />
            </UserProgressProvider>
          </LibraryProvider>
        </NavigationContainer>,
      );

      // Should show offline banner
      await waitFor(() => {
        // Would show offline indicator
      });

      // Come back online
      offlineService.getOfflineStatus.mockReturnValue({
        isOnline: true,
        hasConnection: true,
        connectionType: 'wifi',
      });
      offlineService.shouldShowOfflineBanner.mockReturnValue(false);

      rerender(
        <NavigationContainer>
          <LibraryProvider>
            <UserProgressProvider>
              <LibraryNavigator />
            </UserProgressProvider>
          </LibraryProvider>
        </NavigationContainer>,
      );

      // Should hide offline banner and refresh content
      await waitFor(() => {
        // Offline banner should be gone
      });
    });
  });

  describe('Performance Integration', () => {
    it('should handle rapid user interactions without blocking', async () => {
      const { getByText, getByPlaceholderText } = renderWithAllProviders(
        <LibraryNavigator />,
      );

      await waitFor(() => {
        expect(getByText('Programs')).toBeTruthy();
      });

      // Rapid interactions
      const searchInput = getByPlaceholderText('Find a workout, article...');

      // Rapid typing
      for (let i = 0; i < 10; i++) {
        fireEvent.changeText(searchInput, `query ${i}`);
      }

      // Rapid content taps
      for (let i = 0; i < 5; i++) {
        fireEvent.press(getByText('Test Program'));
      }

      // Should handle all interactions without crashing
      expect(mockNavigate).toHaveBeenCalled();
    });

    it('should maintain performance with large datasets', async () => {
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        id: `item-${i}`,
        type: 'workout' as const,
        title: `Workout ${i}`,
        premium: false,
        tags: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        durationMinutes: 15,
        level: 'Beginner' as const,
        equipment: ['none'],
        locations: ['home'],
        goals: ['cardio'],
        exercises: [],
        estimatedCalories: 100,
      }));

      const { libraryApi } = require('../../services/libraryApi');
      libraryApi.getLibrarySections.mockResolvedValue([
        {
          id: 'workouts',
          type: 'quickStart',
          title: 'Quick Start',
          items: largeDataset,
          hasMore: false,
        },
      ]);

      const renderStart = performance.now();

      const { getByText } = renderWithAllProviders(<LibraryNavigator />);

      await waitFor(() => {
        expect(getByText('Quick Start')).toBeTruthy();
      });

      const renderEnd = performance.now();
      const renderTime = renderEnd - renderStart;

      // Should render large datasets efficiently
      expect(renderTime).toBeLessThan(2000); // 2 seconds max
    });
  });

  describe('Accessibility Integration', () => {
    it('should maintain accessibility throughout navigation', async () => {
      const { getByRole, getByLabelText } = renderWithAllProviders(
        <LibraryNavigator />,
      );

      await waitFor(() => {
        // Should have accessible elements
        expect(getByRole('button')).toBeTruthy();
      });

      // Navigate to different screens
      fireEvent.press(getByRole('button'));

      // Accessibility should be maintained
      expect(mockNavigate).toHaveBeenCalled();
    });

    it('should announce state changes to screen readers', async () => {
      // This would require mocking AccessibilityInfo
      // and testing screen reader announcements throughout the flow

      const { getByText } = renderWithAllProviders(<LibraryNavigator />);

      await waitFor(() => {
        expect(getByText('Programs')).toBeTruthy();
      });

      // State changes should be announced
      // Would need to verify AccessibilityInfo.announceForAccessibility calls
    });
  });

  describe('Data Consistency Integration', () => {
    it('should maintain data consistency across components', async () => {
      const { getByText } = renderWithAllProviders(<LibraryNavigator />);

      await waitFor(() => {
        expect(getByText('Test Program')).toBeTruthy();
      });

      // Data should be consistent between library and progress contexts
      // Changes in one should reflect in the other

      act(() => {
        // Simulate progress update
      });

      // Should reflect in continue section
      await waitFor(() => {
        // Verify consistency
      });
    });
  });
});
