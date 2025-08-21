import AsyncStorage from '@react-native-async-storage/async-storage';
import { LibraryApiService, libraryApi } from '../../services/libraryApi';
import { MOCK_LIBRARY_SECTIONS } from '../../data/mockLibraryData';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
  multiRemove: jest.fn(),
}));

describe('LibraryApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = LibraryApiService.getInstance();
      const instance2 = LibraryApiService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('getLibrarySections', () => {
    it('should return library sections', async () => {
      const sections = await libraryApi.getLibrarySections();

      expect(sections).toBeDefined();
      expect(Array.isArray(sections)).toBe(true);
      expect(sections.length).toBeGreaterThan(0);

      // Check section structure
      const firstSection = sections[0];
      expect(firstSection).toHaveProperty('id');
      expect(firstSection).toHaveProperty('type');
      expect(firstSection).toHaveProperty('title');
      expect(firstSection).toHaveProperty('items');
      expect(firstSection).toHaveProperty('hasMore');
    });

    it('should cache results', async () => {
      // First call
      const sections1 = await libraryApi.getLibrarySections();

      // Second call should use cache
      const sections2 = await libraryApi.getLibrarySections();

      expect(sections1).toEqual(sections2);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should force refresh when requested', async () => {
      // First call to populate cache
      await libraryApi.getLibrarySections();

      // Force refresh should bypass cache
      const sections = await libraryApi.getLibrarySections(undefined, true);

      expect(sections).toBeDefined();
    });

    it('should apply filters', async () => {
      const filters = {
        contentTypes: ['workout'],
        levels: ['Beginner'],
      };

      const sections = await libraryApi.getLibrarySections(filters);

      expect(sections).toBeDefined();
      // In a real implementation, we would verify filtering logic
    });
  });

  describe('loadMoreSectionItems', () => {
    it('should load more items for a section', async () => {
      const result = await libraryApi.loadMoreSectionItems(
        'programs',
        'cursor1',
      );

      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('hasMore');
      expect(Array.isArray(result.items)).toBe(true);
      expect(typeof result.hasMore).toBe('boolean');
    });

    it('should handle pagination cursor', async () => {
      const result = await libraryApi.loadMoreSectionItems(
        'programs',
        'cursor1',
      );

      // Mock implementation returns no more items
      expect(result.hasMore).toBe(false);
      expect(result.items).toEqual([]);
    });
  });

  describe('searchContent', () => {
    it('should search content and return results', async () => {
      const query = 'push ups';
      const result = await libraryApi.searchContent(query);

      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('suggestions');
      expect(Array.isArray(result.items)).toBe(true);
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('should apply filters to search results', async () => {
      const query = 'workout';
      const filters = {
        contentTypes: ['workout'],
        levels: ['Beginner'],
      };

      const result = await libraryApi.searchContent(query, filters);

      expect(result.items).toBeDefined();
      // In a real implementation, we would verify that results match filters
    });

    it('should return search suggestions', async () => {
      const query = 'push';
      const result = await libraryApi.searchContent(query);

      expect(result.suggestions).toBeDefined();
      expect(result.suggestions.length).toBeGreaterThan(0);

      // Suggestions should be related to query
      const hasRelatedSuggestion = result.suggestions.some(suggestion =>
        suggestion.toLowerCase().includes(query.toLowerCase()),
      );
      expect(hasRelatedSuggestion).toBe(true);
    });

    it('should cache search results', async () => {
      const query = 'workout';

      // First search
      await libraryApi.searchContent(query);

      // Second search should use cache
      const result = await libraryApi.searchContent(query);

      expect(result).toBeDefined();
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Filter Application', () => {
    it('should filter by content type', async () => {
      const mockContent = [
        { id: '1', type: 'workout', title: 'Workout 1' },
        { id: '2', type: 'program', title: 'Program 1' },
        { id: '3', type: 'workout', title: 'Workout 2' },
      ];

      // Access private method for testing
      const apiInstance = libraryApi as any;
      const filtered = apiInstance.applyFiltersToContent(mockContent, {
        contentTypes: ['workout'],
      });

      expect(filtered).toHaveLength(2);
      expect(filtered.every((item: any) => item.type === 'workout')).toBe(true);
    });

    it('should filter by level', async () => {
      const mockContent = [
        { id: '1', type: 'workout', level: 'Beginner', title: 'Workout 1' },
        { id: '2', type: 'workout', level: 'Advanced', title: 'Workout 2' },
        { id: '3', type: 'program', level: 'Beginner', title: 'Program 1' },
      ];

      const apiInstance = libraryApi as any;
      const filtered = apiInstance.applyFiltersToContent(mockContent, {
        levels: ['Beginner'],
      });

      expect(filtered).toHaveLength(2);
      expect(filtered.every((item: any) => item.level === 'Beginner')).toBe(
        true,
      );
    });

    it('should filter by equipment', async () => {
      const mockContent = [
        { id: '1', type: 'workout', equipment: ['none'], title: 'Workout 1' },
        {
          id: '2',
          type: 'workout',
          equipment: ['dumbbells'],
          title: 'Workout 2',
        },
        {
          id: '3',
          type: 'workout',
          equipment: ['none', 'bands'],
          title: 'Workout 3',
        },
      ];

      const apiInstance = libraryApi as any;
      const filtered = apiInstance.applyFiltersToContent(mockContent, {
        equipment: ['none'],
      });

      expect(filtered).toHaveLength(2);
      expect(
        filtered.every((item: any) => item.equipment.includes('none')),
      ).toBe(true);
    });

    it('should filter by duration range', async () => {
      const mockContent = [
        { id: '1', type: 'workout', durationMinutes: 5, title: 'Workout 1' },
        { id: '2', type: 'workout', durationMinutes: 15, title: 'Workout 2' },
        { id: '3', type: 'workout', durationMinutes: 25, title: 'Workout 3' },
      ];

      const apiInstance = libraryApi as any;
      const filtered = apiInstance.applyFiltersToContent(mockContent, {
        durationRange: [10, 20],
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].durationMinutes).toBe(15);
    });

    it('should combine multiple filters', async () => {
      const mockContent = [
        {
          id: '1',
          type: 'workout',
          level: 'Beginner',
          equipment: ['none'],
          durationMinutes: 10,
          title: 'Workout 1',
        },
        {
          id: '2',
          type: 'workout',
          level: 'Advanced',
          equipment: ['none'],
          durationMinutes: 10,
          title: 'Workout 2',
        },
        {
          id: '3',
          type: 'program',
          level: 'Beginner',
          equipment: ['none'],
          title: 'Program 1',
        },
      ];

      const apiInstance = libraryApi as any;
      const filtered = apiInstance.applyFiltersToContent(mockContent, {
        contentTypes: ['workout'],
        levels: ['Beginner'],
        equipment: ['none'],
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });
  });

  describe('Filter Preferences', () => {
    it('should save filter preferences', async () => {
      const filters = {
        contentTypes: ['workout'],
        goals: ['fat_loss'],
        levels: ['Beginner'],
      };

      await libraryApi.saveFilterPreferences(filters as any);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@filter_preferences',
        JSON.stringify(filters),
      );
    });

    it('should load filter preferences', async () => {
      const mockFilters = {
        contentTypes: ['workout'],
        goals: ['fat_loss'],
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockFilters),
      );

      const filters = await libraryApi.loadFilterPreferences();

      expect(filters).toEqual(mockFilters);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@filter_preferences');
    });

    it('should handle missing filter preferences', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const filters = await libraryApi.loadFilterPreferences();

      expect(filters).toBeNull();
    });
  });

  describe('Cache Management', () => {
    it('should clear all cache', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([
        '@library_sections_test',
        '@search_results_test',
        '@other_key',
      ]);

      await libraryApi.clearCache();

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        '@library_sections_test',
        '@search_results_test',
      ]);
    });

    it('should handle cache clear errors', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockRejectedValue(
        new Error('Storage error'),
      );

      // Should not throw
      await expect(libraryApi.clearCache()).resolves.toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle storage errors gracefully', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(
        new Error('Storage full'),
      );

      // Should not throw
      const sections = await libraryApi.getLibrarySections();
      expect(sections).toBeDefined();
    });

    it('should handle JSON parse errors', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');

      const filters = await libraryApi.loadFilterPreferences();
      expect(filters).toBeNull();
    });
  });
});
