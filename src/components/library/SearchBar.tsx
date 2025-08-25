import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  FlatList,
  Keyboard,
} from 'react-native';
// Try with direct import
import Icon from 'react-native-vector-icons/Ionicons';
import { useLibrary } from '../../state/LibraryContext';
import { useTheme } from '../../state/ThemeContext';
import { libraryApi } from '../../services/libraryApi';
import {
  AccessibilityUtils,
  useAccessibility,
} from '../../utils/accessibility';

type SearchSuggestion = {
  id: string;
  text: string;
  type: 'suggestion' | 'recent';
};

type SearchBarProps = {
  onFocus?: () => void;
  onBlur?: () => void;
  onSearchResults?: (hasResults: boolean) => void;
};

export const SearchBar: React.FC<SearchBarProps> = ({
  onFocus,
  onBlur,
  onSearchResults,
}) => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const { state, actions } = useLibrary();
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const animatedHeight = useRef(new Animated.Value(0)).current;

  // Load recent searches on mount
  useEffect(() => {
    loadRecentSearches();
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (state.searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(state.searchQuery);
      }, 300);
    } else {
      setSuggestions([]);
      onSearchResults?.(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [state.searchQuery]);

  // Handle suggestions visibility animation
  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: showSuggestions ? 200 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [showSuggestions]);

  const loadRecentSearches = async () => {
    try {
      // In a real app, this would load from AsyncStorage
      const mockRecentSearches = [
        'push ups',
        'core workout',
        'beginner program',
      ];
      setRecentSearches(mockRecentSearches);
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  };

  const saveRecentSearch = async (query: string) => {
    try {
      const trimmedQuery = query.trim().toLowerCase();
      if (!trimmedQuery || recentSearches.includes(trimmedQuery)) return;

      const updatedRecent = [trimmedQuery, ...recentSearches.slice(0, 4)];
      setRecentSearches(updatedRecent);

      // In a real app, this would save to AsyncStorage
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  };

  const performSearch = useCallback(
    async (query: string) => {
      try {
        const result = await libraryApi.searchContent(query, state.filters);

        // Update suggestions
        const searchSuggestions: SearchSuggestion[] = result.suggestions.map(
          suggestion => ({
            id: `suggestion_${suggestion}`,
            text: suggestion,
            type: 'suggestion',
          }),
        );

        setSuggestions(searchSuggestions);
        onSearchResults?.(result.items.length > 0);

        // Save to recent searches if query has results
        if (result.items.length > 0) {
          saveRecentSearch(query);
        }
      } catch (error) {
        console.error('Search failed:', error);
        setSuggestions([]);
        onSearchResults?.(false);
      }
    },
    [state.filters, onSearchResults],
  );

  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
    onFocus?.();

    // Show recent searches if no current query
    if (!state.searchQuery.trim()) {
      const recentSuggestions: SearchSuggestion[] = recentSearches.map(
        search => ({
          id: `recent_${search}`,
          text: search,
          type: 'recent',
        }),
      );
      setSuggestions(recentSuggestions);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow for suggestion taps
    setTimeout(() => {
      setShowSuggestions(false);
    }, 150);
    onBlur?.();
  };

  const handleChangeText = (text: string) => {
    actions.setSearchQuery(text);
  };

  const handleClearSearch = () => {
    actions.setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.blur();
    Keyboard.dismiss();
  };

  const handleSuggestionPress = (suggestion: SearchSuggestion) => {
    actions.setSearchQuery(suggestion.text);
    setShowSuggestions(false);
    inputRef.current?.blur();
    Keyboard.dismiss();
  };

  const renderSuggestion = ({ item }: { item: SearchSuggestion }) => (
    <Pressable
      style={[styles.suggestionItem, isDark && styles.suggestionItemDark]}
      onPress={() => handleSuggestionPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`Search for ${item.text}`}
    >
      <Text style={styles.suggestionIconText}>
        {item.type === 'recent' ? '🕒' : '🔍'}
      </Text>
      <Text
        style={[styles.suggestionText, isDark && styles.suggestionTextDark]}
      >
        {item.text}
      </Text>
      {item.type === 'recent' && (
        <Text style={styles.suggestionArrowText}>↗</Text>
      )}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View
        style={[
          styles.searchContainer,
          isDark ? styles.searchContainerDark : styles.searchContainerLight,
          isFocused && styles.searchContainerFocused,
        ]}
      >
        <Text style={styles.searchIconText}>🔍</Text>

        <TextInput
          ref={inputRef}
          style={[
            styles.searchInput,
            isDark ? styles.searchInputDark : styles.searchInputLight,
          ]}
          placeholder="Find a workout, article..."
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          value={state.searchQuery}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="never" // We'll use custom clear button
        />

        {state.searchQuery.length > 0 && (
          <Pressable
            style={styles.clearButton}
            onPress={handleClearSearch}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Text style={styles.clearIconText}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Search Suggestions */}
      <Animated.View
        style={[
          styles.suggestionsContainer,
          isDark && styles.suggestionsContainerDark,
          { height: animatedHeight },
        ]}
      >
        {showSuggestions && suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            keyExtractor={item => item.id}
            renderItem={renderSuggestion}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              <View style={styles.suggestionsHeader}>
                <Text
                  style={[
                    styles.suggestionsHeaderText,
                    isDark && styles.suggestionsHeaderTextDark,
                  ]}
                >
                  {suggestions[0]?.type === 'recent'
                    ? 'Recent Searches'
                    : 'Suggestions'}
                </Text>
              </View>
            }
          />
        )}

        {showSuggestions &&
          suggestions.length === 0 &&
          state.searchQuery.trim() && (
            <View style={styles.noSuggestionsContainer}>
              <Text
                style={[
                  styles.noSuggestionsText,
                  isDark && styles.noSuggestionsTextDark,
                ]}
              >
                No suggestions found
              </Text>
            </View>
          )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 0,
    marginVertical: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchContainerLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'transparent',
  },
  searchContainerDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'transparent',
  },
  searchContainerFocused: {
    borderColor: '#5B9BFF',
    shadowColor: '#5B9BFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  searchIcon: {
    marginRight: 12,
  },
  searchIconText: {
    fontSize: 20,
    marginRight: 12,
  },

  searchInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '400',
    paddingVertical: 0, // Remove default padding
    color: '#FFFFFF',
  },
  searchInputLight: {
    color: '#FFFFFF',
  },
  searchInputDark: {
    color: '#FFFFFF',
  },

  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  clearIconText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 16,
    right: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  suggestionsContainerDark: {
    backgroundColor: '#2A2A2A',
  },

  suggestionsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  suggestionsHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  suggestionsHeaderTextDark: {
    color: '#CCCCCC',
  },

  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  suggestionItemDark: {
    backgroundColor: '#2A2A2A',
  },

  suggestionIcon: {
    marginRight: 12,
  },
  suggestionIconText: {
    fontSize: 14,
    marginRight: 12,
  },

  suggestionText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  suggestionTextDark: {
    color: '#FFFFFF',
  },

  suggestionAction: {
    marginLeft: 8,
  },
  suggestionArrowText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginLeft: 8,
  },

  noSuggestionsContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  noSuggestionsText: {
    fontSize: 14,
    color: '#666666',
  },
  noSuggestionsTextDark: {
    color: '#CCCCCC',
  },
});
