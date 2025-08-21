import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  TextInput,
  Text,
  Pressable,
  StyleSheet,
  useColorScheme,
  Animated,
  FlatList,
  InteractionManager,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useLibrary } from '../../state/LibraryContext';
import {
  useDebounce,
  useThrottle,
  usePerformanceMonitor,
  useBatchedUpdates,
} from '../../utils/performance';

type SearchSuggestion = {
  id: string;
  text: string;
  type: 'suggestion' | 'recent';
};

export const OptimizedSearchBar = React.memo(() => {
  const isDark = useColorScheme() === 'dark';
  const { state, actions } = useLibrary();
  const { searchQuery } = state;

  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const suggestionsHeight = useRef(new Animated.Value(0)).current;
  const searchController = useRef<AbortController | null>(null);

  const { measureRender } = usePerformanceMonitor('OptimizedSearchBar');
  const batchUpdate = useBatchedUpdates();

  // Debounced search query to reduce API calls
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Throttled search function to prevent excessive API calls
  const throttledSearch = useThrottle(
    useCallback(
      async (query: string) => {
        if (!query.trim()) {
          setSuggestions([]);
          setIsSearching(false);
          return;
        }

        // Cancel previous search
        if (searchController.current) {
          searchController.current.abort();
        }

        searchController.current = new AbortController();

        try {
          setIsSearching(true);

          // Simulate API call with abort signal
          const { libraryApi } = await import('../../services/libraryApi');
          const result = await libraryApi.searchContent(query, state.filters);

          // Check if request was aborted
          if (searchController.current?.signal.aborted) {
            return;
          }

          const searchSuggestions: SearchSuggestion[] = result.suggestions.map(
            (text, index) => ({
              id: `suggestion_${index}`,
              text,
              type: 'suggestion' as const,
            }),
          );

          batchUpdate(() => {
            setSuggestions(searchSuggestions);
            setIsSearching(false);
          });
        } catch (error) {
          if (!searchController.current?.signal.aborted) {
            console.error('Search failed:', error);
            setSuggestions([]);
            setIsSearching(false);
          }
        }
      },
      [state.filters, batchUpdate],
    ),
    500, // 500ms throttle
  );

  // Effect for debounced search
  React.useEffect(() => {
    if (debouncedQuery !== searchQuery) return; // Only search when debounce is complete

    InteractionManager.runAfterInteractions(() => {
      throttledSearch(debouncedQuery);
    });
  }, [debouncedQuery, throttledSearch]);

  // Animate suggestions visibility
  React.useEffect(() => {
    const shouldShow =
      isFocused && (suggestions.length > 0 || recentSearches.length > 0);

    Animated.timing(suggestionsHeight, {
      toValue: shouldShow ? 200 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, suggestions.length, recentSearches.length, suggestionsHeight]);

  // Memoized handlers
  const handleSearchChange = useCallback(
    (text: string) => {
      actions.setSearchQuery(text);
    },
    [actions],
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    // Load recent searches when focused
    InteractionManager.runAfterInteractions(() => {
      setRecentSearches(['push ups', 'core workout', 'beginner']); // Mock data
    });
  }, []);

  const handleBlur = useCallback(() => {
    // Delay blur to allow suggestion taps
    setTimeout(() => setIsFocused(false), 150);
  }, []);

  const handleClearSearch = useCallback(() => {
    actions.setSearchQuery('');
    inputRef.current?.focus();
  }, [actions]);

  const handleSearchSubmit = useCallback(() => {
    if (searchQuery.trim()) {
      // Save to recent searches
      setRecentSearches(prev => {
        const newRecent = [
          searchQuery,
          ...prev.filter(s => s !== searchQuery),
        ].slice(0, 5);
        return newRecent;
      });

      setIsFocused(false);
      inputRef.current?.blur();
      actions.refreshLibrary();
    }
  }, [searchQuery, actions]);

  const handleSuggestionPress = useCallback(
    (suggestion: SearchSuggestion) => {
      actions.setSearchQuery(suggestion.text);

      // Save to recent searches
      setRecentSearches(prev => {
        const newRecent = [
          suggestion.text,
          ...prev.filter(s => s !== suggestion.text),
        ].slice(0, 5);
        return newRecent;
      });

      setIsFocused(false);
      inputRef.current?.blur();
      actions.refreshLibrary();
    },
    [actions],
  );

  // Memoized suggestion renderer
  const renderSuggestion = useCallback(
    ({ item }: { item: SearchSuggestion }) => (
      <Pressable
        style={[
          styles.suggestionItem,
          { backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB' },
        ]}
        onPress={() => handleSuggestionPress(item)}
        accessibilityRole="button"
        accessibilityLabel={`Search for ${item.text}`}
      >
        <Ionicons
          name={item.type === 'recent' ? 'time' : 'search'}
          size={16}
          color={isDark ? '#AAA' : '#666'}
          style={styles.suggestionIcon}
        />
        <Text
          style={[styles.suggestionText, { color: isDark ? '#FFF' : '#000' }]}
        >
          {item.text}
        </Text>
        {item.type === 'recent' && (
          <Ionicons
            name="arrow-up-left"
            size={14}
            color={isDark ? '#666' : '#999'}
          />
        )}
      </Pressable>
    ),
    [isDark, handleSuggestionPress],
  );

  // Memoized key extractor
  const keyExtractor = useCallback((item: SearchSuggestion) => item.id, []);

  // Memoized combined suggestions
  const combinedSuggestions = useMemo(
    (): SearchSuggestion[] => [
      ...suggestions,
      ...recentSearches.map((search, index) => ({
        id: `recent_${index}`,
        text: search,
        type: 'recent' as const,
      })),
    ],
    [suggestions, recentSearches],
  );

  // Memoized styles
  const searchContainerStyle = useMemo(
    () => [
      styles.searchContainer,
      {
        backgroundColor: isDark ? '#1A1A1A' : '#F3F4F6',
        borderColor: isFocused ? '#5B9BFF' : 'transparent',
      },
    ],
    [isDark, isFocused],
  );

  const searchInputStyle = useMemo(
    () => [styles.searchInput, { color: isDark ? '#FFF' : '#000' }],
    [isDark],
  );

  const suggestionsContainerStyle = useMemo(
    () => [
      styles.suggestionsContainer,
      {
        backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
        borderColor: isDark ? '#333' : '#E5E7EB',
      },
    ],
    [isDark],
  );

  return (
    <View style={styles.container}>
      <View style={searchContainerStyle}>
        <Ionicons
          name="search"
          size={20}
          color={isDark ? '#AAA' : '#666'}
          style={styles.searchIcon}
        />

        <TextInput
          ref={inputRef}
          style={searchInputStyle}
          placeholder="Find a workout, article..."
          placeholderTextColor={isDark ? '#666' : '#999'}
          value={searchQuery}
          onChangeText={handleSearchChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          accessibilityLabel="Search workouts and articles"
          // Performance optimizations
          autoCompleteType="off"
          textContentType="none"
          keyboardType="default"
          blurOnSubmit={true}
        />

        {searchQuery.length > 0 && (
          <Pressable
            style={styles.clearButton}
            onPress={handleClearSearch}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={isDark ? '#666' : '#999'}
            />
          </Pressable>
        )}

        {isSearching && (
          <View style={styles.loadingIndicator}>
            <Ionicons
              name="hourglass"
              size={16}
              color={isDark ? '#666' : '#999'}
            />
          </View>
        )}
      </View>

      {/* Optimized Suggestions Dropdown */}
      <Animated.View
        style={[suggestionsContainerStyle, { height: suggestionsHeight }]}
      >
        {combinedSuggestions.length > 0 ? (
          <FlatList
            data={combinedSuggestions}
            keyExtractor={keyExtractor}
            renderItem={renderSuggestion}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={styles.suggestionsList}
            // Performance optimizations
            removeClippedSubviews={true}
            maxToRenderPerBatch={5}
            windowSize={3}
            initialNumToRender={5}
            getItemLayout={(data, index) => ({
              length: 48, // Approximate item height
              offset: 48 * index,
              index,
            })}
          />
        ) : (
          isFocused &&
          !isSearching && (
            <View style={styles.noSuggestionsContainer}>
              <Text
                style={[
                  styles.noSuggestionsText,
                  { color: isDark ? '#666' : '#999' },
                ]}
              >
                Start typing to search workouts, programs, and articles
              </Text>
            </View>
          )
        )}
      </Animated.View>
    </View>
  );
});

OptimizedSearchBar.displayName = 'OptimizedSearchBar';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  loadingIndicator: {
    marginLeft: 8,
    padding: 4,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 16,
    right: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    minHeight: 48,
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
  },
  noSuggestionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  noSuggestionsText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
