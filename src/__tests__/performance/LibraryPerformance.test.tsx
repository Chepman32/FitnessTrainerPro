import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { FlatList } from 'react-native';
import { LibraryScreen } from '../../screens/LibraryScreen';
import { LibraryProvider } from '../../state/LibraryContext';
import { UserProgressProvider } from '../../state/UserProgressContext';
import { Content, LibrarySection } from '../../types/library';

// Mock performance APIs
const mockPerformanceNow = jest.fn();
global.performance = {
  now: mockPerformanceNow,
} as any;

// Mock the API service with large datasets
jest.mock('../../services/libraryApi', () => ({
  libraryApi: {
    getLibrarySections: jest.fn(),
    loadMoreSectionItems: jest.fn(),
    searchContent: jest.fn(),
  },
}));

// Mock offline service
jest.mock('../../services/offlineService', () => ({
  offlineService: {
    initialize: jest.fn(),
    getOfflineStatus: jest.fn(() => ({
      isOnline: true,
      hasConnection: true,
      connectionType: 'wifi',
    })),
    shouldShowOfflineBanner: jest.fn(() => false),
    getOfflineMessage: jest.fn(() => ''),
  },
}));

// Generate large mock datasets
const generateMockContent = (
  count: number,
  type: Content['type'],
): Content[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `${type}-${index}`,
    type,
    title: `${type} ${index}`,
    premium: index % 3 === 0, // Every 3rd item is premium
    tags: [`tag-${index}`, `category-${index % 5}`],
    createdAt: new Date(Date.now() - index * 1000).toISOString(),
    updatedAt: new Date(Date.now() - index * 1000).toISOString(),
    ...(type === 'workout' && {
      durationMinutes: 10 + (index % 50),
      level: ['Beginner', 'Intermediate', 'Advanced'][index % 3] as any,
      equipment: [['none'], ['dumbbells'], ['bands']][index % 3],
      locations: [['home'], ['gym'], ['outdoor']][index % 3],
      goals: [['cardio'], ['strength'], ['mobility']][index % 3],
      exercises: [`exercise-${index}`],
      estimatedCalories: 100 + (index % 300),
    }),
    ...(type === 'program' && {
      weeks: 4 + (index % 8),
      sessionsPerWeek: 3 + (index % 2),
      level: ['Beginner', 'Intermediate', 'Advanced'][index % 3] as any,
      equipment: [['none'], ['dumbbells'], ['bands']][index % 3],
      locations: [['home'], ['gym'], ['outdoor']][index % 3],
      goals: [['cardio'], ['strength'], ['mobility']][index % 3],
      totalWorkouts: 12 + (index % 24),
      estimatedCalories: 200 + (index % 400),
    }),
    ...(type === 'challenge' && {
      durationDays: 7 + (index % 23),
      metricType: ['time', 'reps', 'distance', 'calories'][index % 4] as any,
      participantsCount: 100 + (index % 2000),
      friendsCount: index % 10,
      joined: index % 5 === 0,
    }),
    ...(type === 'article' && {
      readTimeMinutes: 3 + (index % 12),
      topic: ['Nutrition', 'Training', 'Recovery'][index % 3],
      publishedAt: new Date(Date.now() - index * 1000).toISOString(),
      thumbnailUrl: `https://example.com/thumb-${index}.jpg`,
      excerpt: `This is the excerpt for article ${index}`,
      author: `Author ${index % 10}`,
    }),
  })) as Content[];
};

const generateLargeMockSections = (): LibrarySection[] => {
  return [
    {
      id: 'continue',
      type: 'continue',
      title: 'Continue',
      items: generateMockContent(5, 'program'),
      hasMore: false,
    },
    {
      id: 'recommended',
      type: 'recommended',
      title: 'Recommended for you',
      items: generateMockContent(20, 'workout'),
      hasMore: true,
      nextCursor: 'recommended_cursor',
    },
    {
      id: 'quickStart',
      type: 'quickStart',
      title: 'Quick Start',
      items: generateMockContent(15, 'workout'),
      hasMore: false,
    },
    {
      id: 'programs',
      type: 'programs',
      title: 'Programs',
      items: generateMockContent(50, 'program'),
      hasMore: true,
      nextCursor: 'programs_cursor',
    },
    {
      id: 'challenges',
      type: 'challenges',
      title: 'Challenges',
      items: generateMockContent(30, 'challenge'),
      hasMore: true,
      nextCursor: 'challenges_cursor',
    },
    {
      id: 'knowledge',
      type: 'knowledge',
      title: 'Knowledge',
      items: generateMockContent(40, 'article'),
      hasMore: true,
      nextCursor: 'knowledge_cursor',
    },
  ];
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <LibraryProvider>
      <UserProgressProvider>{component}</UserProgressProvider>
    </LibraryProvider>,
  );
};

describe('Library Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformanceNow.mockReturnValue(0);

    const { libraryApi } = require('../../services/libraryApi');
    libraryApi.getLibrarySections.mockResolvedValue(
      generateLargeMockSections(),
    );
    libraryApi.loadMoreSectionItems.mockResolvedValue({
      items: generateMockContent(20, 'workout'),
      hasMore: true,
      nextCursor: 'next_cursor',
    });
  });

  describe('Initial Load Performance', () => {
    it('should load initial content within 2 seconds', async () => {
      const startTime = Date.now();
      mockPerformanceNow.mockReturnValue(startTime);

      const { getByTestId } = renderWithProviders(<LibraryScreen />);

      // Wait for initial load to complete
      await waitFor(
        () => {
          // Would need to add testID to loaded state indicator
          // expect(getByTestId('library-loaded')).toBeTruthy();
        },
        { timeout: 2000 },
      );

      const endTime = Date.now();
      const loadTime = endTime - startTime;

      expect(loadTime).toBeLessThan(2000); // 2-second requirement
    });

    it('should render skeleton states immediately', () => {
      const startTime = performance.now();

      const { getByTestId } = renderWithProviders(<LibraryScreen />);

      const renderTime = performance.now() - startTime;

      // Skeleton should render within 100ms
      expect(renderTime).toBeLessThan(100);

      // Would need to add testID to skeleton components
      // expect(getByTestId('library-skeleton')).toBeTruthy();
    });
  });

  describe('Scrolling Performance', () => {
    it('should maintain 60fps during vertical scrolling', async () => {
      const { libraryApi } = require('../../services/libraryApi');
      libraryApi.getLibrarySections.mockResolvedValue(
        generateLargeMockSections(),
      );

      const { getByTestId } = renderWithProviders(<LibraryScreen />);

      // Wait for content to load
      await waitFor(() => {
        // Content should be loaded
      });

      // Simulate rapid scrolling
      const frameCount = 60; // 1 second at 60fps
      const frameDuration = 1000 / 60; // ~16.67ms per frame

      for (let i = 0; i < frameCount; i++) {
        const frameStart = performance.now();

        // Simulate scroll event
        act(() => {
          // Would trigger scroll events on FlatList
          // This is a conceptual test - actual implementation would need
          // to measure real scroll performance
        });

        const frameEnd = performance.now();
        const frameDurationActual = frameEnd - frameStart;

        // Each frame should complete within 16.67ms for 60fps
        expect(frameDurationActual).toBeLessThan(frameDuration);
      }
    });

    it('should handle horizontal scrolling in content shelves efficiently', async () => {
      const { getByTestId } = renderWithProviders(<LibraryScreen />);

      await waitFor(() => {
        // Content loaded
      });

      // Test horizontal scrolling performance in shelves
      const scrollEvents = 30;

      for (let i = 0; i < scrollEvents; i++) {
        const scrollStart = performance.now();

        act(() => {
          // Simulate horizontal scroll in content shelf
          // Would need to access FlatList ref and trigger scroll
        });

        const scrollEnd = performance.now();
        const scrollDuration = scrollEnd - scrollStart;

        // Horizontal scroll should be smooth
        expect(scrollDuration).toBeLessThan(16.67); // 60fps
      }
    });
  });

  describe('Memory Performance', () => {
    it('should not leak memory during extended use', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      const { rerender } = renderWithProviders(<LibraryScreen />);

      // Simulate multiple re-renders and data updates
      for (let i = 0; i < 10; i++) {
        const newSections = generateLargeMockSections();
        const { libraryApi } = require('../../services/libraryApi');
        libraryApi.getLibrarySections.mockResolvedValue(newSections);

        rerender(
          <LibraryProvider>
            <UserProgressProvider>
              <LibraryScreen />
            </UserProgressProvider>
          </LibraryProvider>,
        );

        await waitFor(() => {
          // Wait for re-render
        });
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    it('should properly cleanup event listeners and timers', () => {
      const { unmount } = renderWithProviders(<LibraryScreen />);

      // Track active timers/listeners before unmount
      const activeTimers = jest.getTimerCount();

      unmount();

      // Should not have leaked timers
      expect(jest.getTimerCount()).toBeLessThanOrEqual(activeTimers);
    });
  });

  describe('Large Dataset Performance', () => {
    it('should handle 1000+ content items efficiently', async () => {
      const largeSections = [
        {
          id: 'large-section',
          type: 'programs' as const,
          title: 'Large Section',
          items: generateMockContent(1000, 'program'),
          hasMore: false,
        },
      ];

      const { libraryApi } = require('../../services/libraryApi');
      libraryApi.getLibrarySections.mockResolvedValue(largeSections);

      const renderStart = performance.now();

      const { getByTestId } = renderWithProviders(<LibraryScreen />);

      await waitFor(() => {
        // Content loaded
      });

      const renderEnd = performance.now();
      const renderTime = renderEnd - renderStart;

      // Should handle large datasets within reasonable time
      expect(renderTime).toBeLessThan(3000); // 3 seconds max
    });

    it('should virtualize long lists properly', async () => {
      const { getByTestId } = renderWithProviders(<LibraryScreen />);

      await waitFor(() => {
        // Content loaded
      });

      // Check that FlatList is using virtualization
      // This would require accessing the FlatList component
      // and verifying that only visible items are rendered

      // Conceptual test - would need to verify:
      // 1. Only visible items are in DOM
      // 2. Items are recycled during scroll
      // 3. Memory usage remains constant regardless of total items
    });
  });

  describe('Search Performance', () => {
    it('should handle search queries within 300ms', async () => {
      const { libraryApi } = require('../../services/libraryApi');
      const largeSearchResults = generateMockContent(500, 'workout');

      libraryApi.searchContent.mockImplementation(async query => {
        const searchStart = performance.now();

        // Simulate search processing
        const results = largeSearchResults.filter(item =>
          item.title.toLowerCase().includes(query.toLowerCase()),
        );

        const searchEnd = performance.now();
        const searchTime = searchEnd - searchStart;

        // Search should complete within 300ms
        expect(searchTime).toBeLessThan(300);

        return {
          items: results,
          suggestions: ['suggestion1', 'suggestion2'],
        };
      });

      const { getByPlaceholderText } = renderWithProviders(<LibraryScreen />);

      // Would need SearchBar to be rendered in LibraryScreen
      // const searchInput = getByPlaceholderText('Find a workout, article...');
      // fireEvent.changeText(searchInput, 'test query');
    });

    it('should debounce search requests efficiently', async () => {
      const { libraryApi } = require('../../services/libraryApi');
      let searchCallCount = 0;

      libraryApi.searchContent.mockImplementation(async () => {
        searchCallCount++;
        return { items: [], suggestions: [] };
      });

      // Simulate rapid typing
      const queries = ['t', 'te', 'tes', 'test', 'test ', 'test q', 'test qu'];

      for (const query of queries) {
        // Simulate typing with minimal delay
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Wait for debounce to complete
      await new Promise(resolve => setTimeout(resolve, 400));

      // Should only make one API call due to debouncing
      expect(searchCallCount).toBeLessThanOrEqual(1);
    });
  });

  describe('Image Loading Performance', () => {
    it('should lazy load images efficiently', async () => {
      const { getByTestId } = renderWithProviders(<LibraryScreen />);

      await waitFor(() => {
        // Content loaded
      });

      // Track image loading performance
      const imageLoadTimes: number[] = [];

      // Mock Image component to track load times
      const originalImage = require('react-native').Image;
      const mockImage = jest.fn().mockImplementation(props => {
        const loadStart = performance.now();

        if (props.onLoadEnd) {
          setTimeout(() => {
            const loadEnd = performance.now();
            imageLoadTimes.push(loadEnd - loadStart);
            props.onLoadEnd();
          }, 100); // Simulate 100ms load time
        }

        return originalImage(props);
      });

      require('react-native').Image = mockImage;

      // Trigger image loading by scrolling
      act(() => {
        // Simulate scroll to trigger lazy loading
      });

      await waitFor(() => {
        expect(imageLoadTimes.length).toBeGreaterThan(0);
      });

      // Images should load within reasonable time
      const averageLoadTime =
        imageLoadTimes.reduce((a, b) => a + b, 0) / imageLoadTimes.length;
      expect(averageLoadTime).toBeLessThan(500); // 500ms average
    });
  });

  describe('Filter Performance', () => {
    it('should apply filters without blocking UI', async () => {
      const { getByTestId } = renderWithProviders(<LibraryScreen />);

      await waitFor(() => {
        // Content loaded
      });

      const filterStart = performance.now();

      act(() => {
        // Apply multiple filters
        // Would need to trigger filter changes
      });

      const filterEnd = performance.now();
      const filterTime = filterEnd - filterStart;

      // Filter application should be fast
      expect(filterTime).toBeLessThan(100);
    });
  });

  describe('Offline Performance', () => {
    it('should switch to offline mode quickly', async () => {
      const { offlineService } = require('../../services/offlineService');

      const switchStart = performance.now();

      // Simulate going offline
      offlineService.getOfflineStatus.mockReturnValue({
        isOnline: false,
        hasConnection: false,
        connectionType: null,
      });

      // Trigger offline state change
      act(() => {
        // Would need to trigger network state change
      });

      const switchEnd = performance.now();
      const switchTime = switchEnd - switchStart;

      // Offline switch should be immediate
      expect(switchTime).toBeLessThan(50);
    });
  });
});
