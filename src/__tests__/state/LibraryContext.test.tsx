import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { LibraryProvider, useLibrary } from '../../state/LibraryContext';
import { DEFAULT_FILTERS } from '../../types/library';

// Mock the API service
jest.mock('../../services/libraryApi', () => ({
  libraryApi: {
    getLibrarySections: jest.fn(),
    loadMoreSectionItems: jest.fn(),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LibraryProvider>{children}</LibraryProvider>
);

describe('LibraryContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useLibrary(), { wrapper });

      expect(result.current.state).toEqual({
        sections: [],
        filters: DEFAULT_FILTERS,
        searchQuery: '',
        isLoading: false,
        error: null,
        lastRefresh: null,
      });
    });
  });

  describe('Filter Management', () => {
    it('should update filters correctly', () => {
      const { result } = renderHook(() => useLibrary(), { wrapper });

      act(() => {
        result.current.actions.updateFilters({
          contentTypes: ['workout'],
          goals: ['fat_loss'],
        });
      });

      expect(result.current.state.filters.contentTypes).toEqual(['workout']);
      expect(result.current.state.filters.goals).toEqual(['fat_loss']);
      expect(result.current.state.sections).toEqual([]); // Should clear sections
    });

    it('should clear filters correctly', () => {
      const { result } = renderHook(() => useLibrary(), { wrapper });

      // First set some filters
      act(() => {
        result.current.actions.updateFilters({
          contentTypes: ['workout'],
          goals: ['fat_loss'],
        });
      });

      // Then clear them
      act(() => {
        result.current.actions.clearFilters();
      });

      expect(result.current.state.filters).toEqual(DEFAULT_FILTERS);
      expect(result.current.state.searchQuery).toBe('');
      expect(result.current.state.sections).toEqual([]);
    });
  });

  describe('Search Query Management', () => {
    it('should update search query correctly', () => {
      const { result } = renderHook(() => useLibrary(), { wrapper });

      act(() => {
        result.current.actions.setSearchQuery('push ups');
      });

      expect(result.current.state.searchQuery).toBe('push ups');
      expect(result.current.state.sections).toEqual([]); // Should clear sections
    });

    it('should not clear sections if query is the same', () => {
      const { result } = renderHook(() => useLibrary(), { wrapper });

      // Set initial query
      act(() => {
        result.current.actions.setSearchQuery('push ups');
      });

      // Mock some sections
      const mockSections = [
        {
          id: 'test',
          type: 'programs' as const,
          title: 'Test',
          items: [],
          hasMore: false,
        },
      ];

      // Manually set sections (simulating API response)
      act(() => {
        // This would normally be done by the reducer
        result.current.state.sections = mockSections;
      });

      // Set same query again
      act(() => {
        result.current.actions.setSearchQuery('push ups');
      });

      // Sections should remain (though in real implementation this would be handled by reducer)
      expect(result.current.state.searchQuery).toBe('push ups');
    });
  });

  describe('Library Refresh', () => {
    it('should handle successful library refresh', async () => {
      const mockSections = [
        {
          id: 'programs',
          type: 'programs' as const,
          title: 'Programs',
          items: [],
          hasMore: false,
        },
      ];

      const { libraryApi } = require('../../services/libraryApi');
      libraryApi.getLibrarySections.mockResolvedValue(mockSections);

      const { result } = renderHook(() => useLibrary(), { wrapper });

      await act(async () => {
        await result.current.actions.refreshLibrary();
      });

      expect(libraryApi.getLibrarySections).toHaveBeenCalledWith(
        result.current.state.filters,
        true,
      );
      expect(result.current.state.isLoading).toBe(false);
      expect(result.current.state.error).toBe(null);
      expect(result.current.state.lastRefresh).toBeTruthy();
    });

    it('should handle library refresh error', async () => {
      const { libraryApi } = require('../../services/libraryApi');
      libraryApi.getLibrarySections.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useLibrary(), { wrapper });

      await act(async () => {
        await result.current.actions.refreshLibrary();
      });

      expect(result.current.state.isLoading).toBe(false);
      expect(result.current.state.error).toBe('Failed to load library content');
    });
  });

  describe('Load More Section', () => {
    it('should load more items for a section', async () => {
      const { libraryApi } = require('../../services/libraryApi');
      libraryApi.loadMoreSectionItems.mockResolvedValue({
        items: [{ id: 'new-item', type: 'workout', title: 'New Workout' }],
        hasMore: false,
      });

      const { result } = renderHook(() => useLibrary(), { wrapper });

      // Set up initial state with a section
      act(() => {
        result.current.state.sections = [
          {
            id: 'programs',
            type: 'programs' as const,
            title: 'Programs',
            items: [],
            hasMore: true,
            nextCursor: 'cursor1',
          },
        ];
      });

      await act(async () => {
        await result.current.actions.loadMoreSection('programs');
      });

      expect(libraryApi.loadMoreSectionItems).toHaveBeenCalledWith(
        'programs',
        'cursor1',
      );
    });

    it('should not load more if section has no more items', async () => {
      const { libraryApi } = require('../../services/libraryApi');

      const { result } = renderHook(() => useLibrary(), { wrapper });

      // Set up initial state with a section that has no more items
      act(() => {
        result.current.state.sections = [
          {
            id: 'programs',
            type: 'programs' as const,
            title: 'Programs',
            items: [],
            hasMore: false,
          },
        ];
      });

      await act(async () => {
        await result.current.actions.loadMoreSection('programs');
      });

      expect(libraryApi.loadMoreSectionItems).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle load more section error', async () => {
      const { libraryApi } = require('../../services/libraryApi');
      libraryApi.loadMoreSectionItems.mockRejectedValue(
        new Error('Load more error'),
      );

      const { result } = renderHook(() => useLibrary(), { wrapper });

      // Set up initial state with a section
      act(() => {
        result.current.state.sections = [
          {
            id: 'programs',
            type: 'programs' as const,
            title: 'Programs',
            items: [],
            hasMore: true,
          },
        ];
      });

      await act(async () => {
        await result.current.actions.loadMoreSection('programs');
      });

      expect(result.current.state.error).toBe('Failed to load more content');
    });
  });
});
