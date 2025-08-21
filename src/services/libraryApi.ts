import AsyncStorage from '@react-native-async-storage/async-storage';
import { LibrarySection, LibraryFilters, Content } from '../types/library';
import {
  MOCK_LIBRARY_SECTIONS,
  MOCK_PROGRAMS,
  MOCK_CHALLENGES,
  MOCK_WORKOUTS,
  MOCK_ARTICLES,
} from '../data/mockLibraryData';

// Cache configuration
const CACHE_KEYS = {
  LIBRARY_SECTIONS: '@library_sections',
  SEARCH_RESULTS: '@search_results',
  FILTER_PREFERENCES: '@filter_preferences',
};

const CACHE_TTL = {
  LIBRARY_SECTIONS: 24 * 60 * 60 * 1000, // 24 hours
  SEARCH_RESULTS: 60 * 60 * 1000, // 1 hour
};

type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttl: number;
};

// Cache utilities
const setCache = async <T>(
  key: string,
  data: T,
  ttl: number,
): Promise<void> => {
  try {
    const cacheEntry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    await AsyncStorage.setItem(key, JSON.stringify(cacheEntry));
  } catch (error) {
    console.error('Failed to set cache:', error);
  }
};

const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (!cached) return null;

    const cacheEntry: CacheEntry<T> = JSON.parse(cached);
    const isExpired = Date.now() - cacheEntry.timestamp > cacheEntry.ttl;

    if (isExpired) {
      await AsyncStorage.removeItem(key);
      return null;
    }

    return cacheEntry.data;
  } catch (error) {
    console.error('Failed to get cache:', error);
    return null;
  }
};

// API simulation with caching
export class LibraryApiService {
  private static instance: LibraryApiService;

  static getInstance(): LibraryApiService {
    if (!LibraryApiService.instance) {
      LibraryApiService.instance = new LibraryApiService();
    }
    return LibraryApiService.instance;
  }

  // Simulate network delay
  private async simulateNetworkDelay(ms: number = 500): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get library sections (main feed)
  async getLibrarySections(
    filters?: Partial<LibraryFilters>,
    forceRefresh: boolean = false,
  ): Promise<LibrarySection[]> {
    const cacheKey = `${CACHE_KEYS.LIBRARY_SECTIONS}_${JSON.stringify(
      filters || {},
    )}`;

    // Try cache first unless force refresh
    if (!forceRefresh) {
      const cached = await getCache<LibrarySection[]>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Simulate API call
    await this.simulateNetworkDelay();

    // Apply filters to mock data
    let sections = [...MOCK_LIBRARY_SECTIONS];

    if (filters) {
      sections = sections.map(section => ({
        ...section,
        items: this.applyFiltersToContent(section.items, filters),
      }));
    }

    // Cache the result
    await setCache(cacheKey, sections, CACHE_TTL.LIBRARY_SECTIONS);

    return sections;
  }

  // Load more items for a specific section
  async loadMoreSectionItems(
    sectionId: string,
    cursor?: string,
  ): Promise<{ items: Content[]; nextCursor?: string; hasMore: boolean }> {
    await this.simulateNetworkDelay(300);

    // Mock pagination - in real implementation, this would use the cursor
    // For now, return empty results to simulate no more items
    return {
      items: [],
      hasMore: false,
    };
  }

  // Search content
  async searchContent(
    query: string,
    filters?: Partial<LibraryFilters>,
    cursor?: string,
  ): Promise<{ items: Content[]; suggestions: string[]; nextCursor?: string }> {
    const cacheKey = `${CACHE_KEYS.SEARCH_RESULTS}_${query}_${JSON.stringify(
      filters || {},
    )}`;

    // Try cache first
    const cached = await getCache<{ items: Content[]; suggestions: string[] }>(
      cacheKey,
    );
    if (cached && !cursor) {
      return { ...cached, nextCursor: undefined };
    }

    await this.simulateNetworkDelay();

    // Combine all content for search
    const allContent: Content[] = [
      ...MOCK_PROGRAMS,
      ...MOCK_CHALLENGES,
      ...MOCK_WORKOUTS,
      ...MOCK_ARTICLES,
    ];

    // Simple search implementation
    const searchResults = allContent.filter(
      item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())),
    );

    // Apply additional filters
    const filteredResults = filters
      ? this.applyFiltersToContent(searchResults, filters)
      : searchResults;

    // Mock search suggestions
    const suggestions = [
      'push-ups',
      'core workout',
      'beginner program',
      'fat loss',
      'strength training',
    ].filter(suggestion =>
      suggestion.toLowerCase().includes(query.toLowerCase()),
    );

    const result = {
      items: filteredResults,
      suggestions,
    };

    // Cache search results
    await setCache(cacheKey, result, CACHE_TTL.SEARCH_RESULTS);

    return { ...result, nextCursor: undefined };
  }

  // Apply filters to content array
  private applyFiltersToContent(
    content: Content[],
    filters: Partial<LibraryFilters>,
  ): Content[] {
    return content.filter(item => {
      // Content type filter
      if (filters.contentTypes && filters.contentTypes.length > 0) {
        if (!filters.contentTypes.includes(item.type)) return false;
      }

      // Level filter (for programs and workouts)
      if (filters.levels && filters.levels.length > 0) {
        if ('level' in item && !filters.levels.includes(item.level))
          return false;
      }

      // Equipment filter (for programs and workouts)
      if (filters.equipment && filters.equipment.length > 0) {
        if ('equipment' in item) {
          const hasMatchingEquipment = item.equipment.some(eq =>
            filters.equipment!.includes(eq),
          );
          if (!hasMatchingEquipment) return false;
        }
      }

      // Location filter (for programs and workouts)
      if (filters.locations && filters.locations.length > 0) {
        if ('locations' in item) {
          const hasMatchingLocation = item.locations.some(loc =>
            filters.locations!.includes(loc),
          );
          if (!hasMatchingLocation) return false;
        }
      }

      // Goals filter (for programs and workouts)
      if (filters.goals && filters.goals.length > 0) {
        if ('goals' in item) {
          const hasMatchingGoal = item.goals.some(goal =>
            filters.goals!.includes(goal),
          );
          if (!hasMatchingGoal) return false;
        }
      }

      // Duration filter
      if (filters.durationRange) {
        const [minDuration, maxDuration] = filters.durationRange;
        if ('durationMinutes' in item) {
          if (
            item.durationMinutes < minDuration ||
            item.durationMinutes > maxDuration
          ) {
            return false;
          }
        }
      }

      // Program weeks filter
      if (filters.programWeeksRange && item.type === 'program') {
        const [minWeeks, maxWeeks] = filters.programWeeksRange;
        if (item.weeks < minWeeks || item.weeks > maxWeeks) {
          return false;
        }
      }

      return true;
    });
  }

  // Save filter preferences
  async saveFilterPreferences(filters: LibraryFilters): Promise<void> {
    try {
      await AsyncStorage.setItem(
        CACHE_KEYS.FILTER_PREFERENCES,
        JSON.stringify(filters),
      );
    } catch (error) {
      console.error('Failed to save filter preferences:', error);
    }
  }

  // Load filter preferences
  async loadFilterPreferences(): Promise<LibraryFilters | null> {
    try {
      const stored = await AsyncStorage.getItem(CACHE_KEYS.FILTER_PREFERENCES);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load filter preferences:', error);
      return null;
    }
  }

  // Clear all cache
  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(
        key => key.startsWith('@library_') || key.startsWith('@search_'),
      );
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }
}

// Export singleton instance
export const libraryApi = LibraryApiService.getInstance();
