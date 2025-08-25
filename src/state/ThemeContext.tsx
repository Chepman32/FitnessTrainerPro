import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Theme types
export type ThemeMode = 'system' | 'light' | 'dark';

export type ThemeColors = {
  // Backgrounds
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  // Accent colors
  primary: string;
  primaryText: string;
  secondary: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  
  // Interactive elements
  border: string;
  borderSecondary: string;
  overlay: string;
  
  // Card and surface colors
  card: string;
  surface: string;
  
  // Tab bar specific
  tabBarBackground: string;
  tabBarActive: string;
  tabBarInactive: string;
};

export type Theme = {
  mode: 'light' | 'dark';
  colors: ThemeColors;
};

// Light theme colors
const lightTheme: Theme = {
  mode: 'light',
  colors: {
    // Backgrounds
    background: '#FFFFFF',
    backgroundSecondary: '#F8F9FA',
    backgroundTertiary: '#E9ECEF',
    
    // Text colors
    text: '#000000',
    textSecondary: '#666666',
    textTertiary: '#999999',
    
    // Accent colors
    primary: '#5B9BFF',
    primaryText: '#FFFFFF',
    secondary: '#007AFF',
    
    // Status colors
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF453A',
    
    // Interactive elements
    border: '#E9ECEF',
    borderSecondary: '#DEE2E6',
    overlay: 'rgba(0, 0, 0, 0.5)',
    
    // Card and surface colors
    card: '#FFFFFF',
    surface: '#F8F9FA',
    
    // Tab bar specific
    tabBarBackground: '#0A1224',
    tabBarActive: '#FFFFFF',
    tabBarInactive: 'rgba(255, 255, 255, 0.6)',
  },
};

// Dark theme colors
const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    // Backgrounds
    background: '#060A18',
    backgroundSecondary: '#1A1A1A',
    backgroundTertiary: '#2A2A2A',
    
    // Text colors
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    textTertiary: '#666666',
    
    // Accent colors
    primary: '#5B9BFF',
    primaryText: '#FFFFFF',
    secondary: '#0A84FF',
    
    // Status colors
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
    
    // Interactive elements
    border: '#333333',
    borderSecondary: '#444444',
    overlay: 'rgba(0, 0, 0, 0.7)',
    
    // Card and surface colors
    card: '#1A1A1A',
    surface: '#2A2A2A',
    
    // Tab bar specific
    tabBarBackground: '#060A18',
    tabBarActive: '#FFFFFF',
    tabBarInactive: 'rgba(255, 255, 255, 0.6)',
  },
};

// Theme context
type ThemeContextType = {
  themeMode: ThemeMode;
  theme: Theme;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Storage key
const THEME_STORAGE_KEY = '@fitness_theme_mode';

// Theme provider
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  
  // Determine current theme based on mode
  const getCurrentTheme = (): Theme => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return themeMode === 'dark' ? darkTheme : lightTheme;
  };
  
  const [theme, setTheme] = useState<Theme>(getCurrentTheme());
  
  // Load saved theme mode on mount
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedMode && ['system', 'light', 'dark'].includes(savedMode)) {
          setThemeModeState(savedMode as ThemeMode);
        }
      } catch (error) {
        console.error('Error loading theme mode:', error);
      }
    };
    
    loadThemeMode();
  }, []);
  
  // Update theme when mode or system preference changes
  useEffect(() => {
    const newTheme = getCurrentTheme();
    setTheme(newTheme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeMode, systemColorScheme]);
  
  // Save theme mode to storage
  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  };
  
  // Toggle between light and dark (skipping system)
  const toggleTheme = () => {
    const currentActualMode = getCurrentTheme().mode;
    setThemeMode(currentActualMode === 'light' ? 'dark' : 'light');
  };
  
  const value: ThemeContextType = {
    themeMode,
    theme,
    setThemeMode,
    toggleTheme,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Utility hook for backwards compatibility
export const useAppColorScheme = () => {
  const { theme } = useTheme();
  return {
    isDark: theme.mode === 'dark',
    colors: theme.colors,
  };
};