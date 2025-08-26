import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BackButton } from '../../components/BackButton';
import { Content } from '../../types/library';
import { useLibrary } from '../../state/LibraryContext';
import { libraryApi } from '../../services/libraryApi';
import { ContentCard } from './ContentCard';
import { SearchBar } from './SearchBar';
import { FilterBar } from './FilterBar';

type SearchResultsScreenProps = {
  onContentPress?: (content: Content) => void;
  onBack?: () => void;
};

export const SearchResultsScreen: React.FC<SearchResultsScreenProps> = ({
  onContentPress,
  onBack,
}) => {
  const isDark = useColorScheme() === 'dark';
  const { state } = useLibrary();
  const { searchQuery, filters } = state;

  const [searchResults, setSearchResults] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();

  // Perform search when query or filters change
  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch(true);
    } else {
      setSearchResults([]);
      setHasMore(false);
      setNextCursor(undefined);
    }
  }, [searchQuery, filters]);

  const performSearch = useCallback(
    async (isNewSearch: boolean = false) => {
      if (!searchQuery.trim()) return;

      try {
        setIsLoading(true);
        setError(null);

        const cursor = isNewSearch ? undefined : nextCursor;
        const result = await libraryApi.searchContent(
          searchQuery,
          filters,
          cursor,
        );

        if (isNewSearch) {
          setSearchResults(result.items);
        } else {
          setSearchResults(prev => [...prev, ...result.items]);
        }

        setHasMore(!!result.nextCursor);
        setNextCursor(result.nextCursor);
      } catch (err) {
        setError('Failed to search content');
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [searchQuery, filters, nextCursor],
  );

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      performSearch(false);
    }
  }, [hasMore, isLoading, performSearch]);

  const handleRetry = useCallback(() => {
    performSearch(true);
  }, [performSearch]);

  const handleContentPress = useCallback(
    (content: Content) => {
      onContentPress?.(content);
    },
    [onContentPress],
  );

  const renderSearchResult = useCallback(
    ({ item, index }: { item: Content; index: number }) => (
      <View style={styles.resultItem}>
        <ContentCard
          content={item}
          onPress={handleContentPress}
          style={styles.resultCard}
        />
      </View>
    ),
    [handleContentPress],
  );

  const renderHeader = () => (
    <View>
      <View style={styles.headerContainer}>
        <BackButton onPress={onBack || (() => {})} />
        <View style={styles.searchContainer}>
          <SearchBar />
        </View>
      </View>
      <FilterBar />

      {searchQuery.trim() && (
        <View style={styles.resultsHeader}>
          <Text
            style={[styles.resultsTitle, { color: isDark ? '#FFF' : '#000' }]}
          >
            Results for "{searchQuery}"
          </Text>
          <Text
            style={[styles.resultsCount, { color: isDark ? '#AAA' : '#666' }]}
          >
            {searchResults.length}{' '}
            {searchResults.length === 1 ? 'result' : 'results'}
          </Text>
        </View>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!isLoading) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#5B9BFF" />
        <Text style={[styles.loadingText, { color: isDark ? '#AAA' : '#666' }]}>
          Loading more results...
        </Text>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (isLoading) return null;

    if (!searchQuery.trim()) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={64} color={isDark ? '#333' : '#CCC'} />
          <Text
            style={[styles.emptyTitle, { color: isDark ? '#FFF' : '#000' }]}
          >
            Search the Library
          </Text>
          <Text
            style={[styles.emptyMessage, { color: isDark ? '#AAA' : '#666' }]}
          >
            Find workouts, programs, challenges, and articles
          </Text>
        </View>
      );
    }

    if (searchResults.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={64} color={isDark ? '#333' : '#CCC'} />
          <Text
            style={[styles.emptyTitle, { color: isDark ? '#FFF' : '#000' }]}
          >
            No results found
          </Text>
          <Text
            style={[styles.emptyMessage, { color: isDark ? '#AAA' : '#666' }]}
          >
            Try adjusting your search or filters
          </Text>
        </View>
      );
    }

    return null;
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <View style={styles.errorContainer}>
        <Ionicons
          name="alert-circle"
          size={48}
          color={isDark ? '#FF6B6B' : '#DC2626'}
        />
        <Text
          style={[styles.errorTitle, { color: isDark ? '#FF6B6B' : '#DC2626' }]}
        >
          Search Error
        </Text>
        <Text
          style={[styles.errorMessage, { color: isDark ? '#AAA' : '#666' }]}
        >
          {error}
        </Text>
        <Pressable
          style={styles.retryButton}
          onPress={handleRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry search"
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
      </View>
    );
  };

  const backgroundColor = isDark ? '#000000' : '#FFFFFF';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {error ? (
        <>
          {renderHeader()}
          {renderError()}
        </>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item, index) => `${item.id}_${index}`}
          renderItem={renderSearchResult}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmptyState}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          numColumns={2}
          columnWrapperStyle={styles.row}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={6}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  searchContainer: {
    flex: 1,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 32,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  resultItem: {
    flex: 1,
    maxWidth: '48%',
    marginVertical: 8,
  },
  resultCard: {
    width: '100%',
    marginRight: 0,
  },
  loadingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#5B9BFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
