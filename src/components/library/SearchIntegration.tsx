import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLibrary } from '../../state/LibraryContext';
import { libraryApi } from '../../services/libraryApi';
import { Content } from '../../types/library';
import { SearchResultsScreen } from './SearchResultsScreen';
import { LibraryScreen } from '../../screens/LibraryScreen';

type SearchIntegrationProps = {
  onContentPress?: (content: Content) => void;
  onNavigateToDetail?: (content: Content) => void;
};

export const SearchIntegration: React.FC<SearchIntegrationProps> = ({
  onContentPress,
  onNavigateToDetail,
}) => {
  const { state } = useLibrary();
  const { searchQuery } = state;
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Show search results when there's a search query
  useEffect(() => {
    setShowSearchResults(searchQuery.trim().length > 0);
  }, [searchQuery]);

  const handleContentPress = useCallback(
    (content: Content) => {
      // Handle content press - could navigate to detail screen or start workout
      onContentPress?.(content);
      onNavigateToDetail?.(content);
    },
    [onContentPress, onNavigateToDetail],
  );

  const handleBackFromSearch = useCallback(() => {
    setShowSearchResults(false);
  }, []);

  if (showSearchResults) {
    return (
      <SearchResultsScreen
        onContentPress={handleContentPress}
        onBack={handleBackFromSearch}
      />
    );
  }

  return (
    <LibraryScreen
      onContentPress={handleContentPress}
      onSeeAllPress={section => {
        // Handle see all press - could navigate to dedicated section screen
        console.log('See all pressed for section:', section.title);
      }}
    />
  );
};

// Enhanced search utilities
export class SearchUtils {
  private static searchHistory: string[] = [];
  private static readonly MAX_HISTORY = 10;

  static addToHistory(query: string) {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed || this.searchHistory.includes(trimmed)) return;

    this.searchHistory = [
      trimmed,
      ...this.searchHistory.slice(0, this.MAX_HISTORY - 1),
    ];
  }

  static getHistory(): string[] {
    return [...this.searchHistory];
  }

  static clearHistory() {
    this.searchHistory = [];
  }

  static async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      const result = await libraryApi.searchContent(query);
      return result.suggestions;
    } catch (error) {
      console.error('Failed to get search suggestions:', error);
      return [];
    }
  }

  // Advanced search with filters
  static async performAdvancedSearch(
    query: string,
    filters: {
      contentTypes?: string[];
      goals?: string[];
      levels?: string[];
      locations?: string[];
      equipment?: string[];
      durationRange?: [number, number];
    },
  ): Promise<{ items: Content[]; totalCount: number }> {
    try {
      const result = await libraryApi.searchContent(query, filters);
      return {
        items: result.items,
        totalCount: result.items.length, // In real API, this would come from server
      };
    } catch (error) {
      console.error('Advanced search failed:', error);
      return { items: [], totalCount: 0 };
    }
  }

  // Search analytics
  static trackSearch(query: string, resultCount: number, filters?: any) {
    // In a real app, this would send analytics events
    console.log('Search tracked:', {
      query,
      resultCount,
      filters,
      timestamp: new Date().toISOString(),
    });
  }

  // Search result ranking
  static rankSearchResults(results: Content[], query: string): Content[] {
    const queryLower = query.toLowerCase();

    return results.sort((a, b) => {
      // Exact title matches first
      const aExactTitle = a.title.toLowerCase() === queryLower;
      const bExactTitle = b.title.toLowerCase() === queryLower;
      if (aExactTitle && !bExactTitle) return -1;
      if (!aExactTitle && bExactTitle) return 1;

      // Title starts with query
      const aTitleStarts = a.title.toLowerCase().startsWith(queryLower);
      const bTitleStarts = b.title.toLowerCase().startsWith(queryLower);
      if (aTitleStarts && !bTitleStarts) return -1;
      if (!aTitleStarts && bTitleStarts) return 1;

      // Title contains query
      const aTitleContains = a.title.toLowerCase().includes(queryLower);
      const bTitleContains = b.title.toLowerCase().includes(queryLower);
      if (aTitleContains && !bTitleContains) return -1;
      if (!aTitleContains && bTitleContains) return 1;

      // Tag matches
      const aTagMatch = a.tags.some(tag =>
        tag.toLowerCase().includes(queryLower),
      );
      const bTagMatch = b.tags.some(tag =>
        tag.toLowerCase().includes(queryLower),
      );
      if (aTagMatch && !bTagMatch) return -1;
      if (!aTagMatch && bTagMatch) return 1;

      // Premium content lower priority for free users
      if (!a.premium && b.premium) return -1;
      if (a.premium && !b.premium) return 1;

      // Default to creation date (newer first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
