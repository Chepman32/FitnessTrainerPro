import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  Pressable,
  StyleSheet,
  Keyboard,
} from 'react-native';

import { useLibrary } from '../../state/LibraryContext';
import { useTheme } from '../../state/ThemeContext';

type SearchBarProps = {
  onFocus?: () => void;
  onBlur?: () => void;
  onSearchResults?: (hasResults: boolean) => void;
};

export const SearchBar: React.FC<SearchBarProps> = ({
  onFocus,
  onBlur,
  onSearchResults: _onSearchResults,
}) => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const { state, actions } = useLibrary();
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<TextInput>(null);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleChangeText = (text: string) => {
    actions.setSearchQuery(text);
  };

  const handleClearSearch = () => {
    actions.setSearchQuery('');
    inputRef.current?.blur();
    Keyboard.dismiss();
  };

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
        <Text style={[
          styles.searchIconText, 
          isDark ? styles.searchIconDark : styles.searchIconLight
        ]}>🔍</Text>

        <TextInput
          ref={inputRef}
          style={[
            styles.searchInput,
            isDark ? styles.searchInputDark : styles.searchInputLight,
          ]}
          placeholder="Find a workout, article..."
          placeholderTextColor={isDark ? "rgba(255, 255, 255, 0.6)" : "rgba(51, 51, 51, 0.6)"}
          value={state.searchQuery}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="never" // We'll use custom clear button
          blurOnSubmit={false}
        />

        {state.searchQuery.length > 0 && (
          <Pressable
            style={styles.clearButton}
            onPress={handleClearSearch}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Text style={[
              styles.clearIconText, 
              isDark ? styles.clearIconDark : styles.clearIconLight
            ]}>✕</Text>
          </Pressable>
        )}
      </View>
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
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  searchContainerLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  searchContainerDark: {
    backgroundColor: '#2A2A2A',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchContainerFocused: {
    borderColor: '#5B9BFF',
    backgroundColor: 'rgba(91, 155, 255, 0.1)',
    shadowColor: '#5B9BFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },

  searchIcon: {
    marginRight: 12,
  },
  searchIconText: {
    fontSize: 20,
    marginRight: 12,
  },
  searchIconLight: {
    color: '#666666',
  },
  searchIconDark: {
    color: '#FFFFFF',
  },

  searchInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '400',
    paddingVertical: 0, // Remove default padding
  },
  searchInputLight: {
    color: '#333333',
  },
  searchInputDark: {
    color: '#FFFFFF',
  },

  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  clearIconText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearIconLight: {
    color: '#666666',
  },
  clearIconDark: {
    color: '#FFFFFF',
  },
});