import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Article } from '../types/library';

// Types
type FavoriteItem = {
  id: string;
  type: 'article' | 'workout' | 'program' | 'challenge';
  title: string;
  favorited_at: string;
  data: Article; // For now, we'll focus on articles
};

type FavoritesState = {
  favorites: FavoriteItem[];
  isLoading: boolean;
  error: string | null;
};

type FavoritesAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FAVORITES'; payload: FavoriteItem[] }
  | { type: 'ADD_FAVORITE'; payload: FavoriteItem }
  | { type: 'REMOVE_FAVORITE'; payload: string }
  | { type: 'CLEAR_FAVORITES' };

type FavoritesContextType = {
  state: FavoritesState;
  actions: {
    addFavorite: (item: Article) => Promise<void>;
    removeFavorite: (itemId: string) => Promise<void>;
    isFavorited: (itemId: string) => boolean;
    loadFavorites: () => Promise<void>;
    clearAllFavorites: () => Promise<void>;
  };
};

// Constants
const STORAGE_KEY = '@fitness_favorites';

// Initial state
const initialState: FavoritesState = {
  favorites: [],
  isLoading: false,
  error: null,
};

// Reducer
const favoritesReducer = (state: FavoritesState, action: FavoritesAction): FavoritesState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_FAVORITES':
      return { ...state, favorites: action.payload, isLoading: false, error: null };
    case 'ADD_FAVORITE':
      return { 
        ...state, 
        favorites: [...state.favorites, action.payload],
        error: null 
      };
    case 'REMOVE_FAVORITE':
      return { 
        ...state, 
        favorites: state.favorites.filter(item => item.id !== action.payload),
        error: null 
      };
    case 'CLEAR_FAVORITES':
      return { ...state, favorites: [], error: null };
    default:
      return state;
  }
};

// Context
const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// Provider component
export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(favoritesReducer, initialState);

  // Load favorites from storage on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  // Save to AsyncStorage
  const saveFavoritesToStorage = async (favorites: FavoriteItem[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites to storage:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save favorites' });
    }
  };

  // Load from AsyncStorage
  const loadFavorites = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const storedFavorites = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (storedFavorites) {
        const favorites: FavoriteItem[] = JSON.parse(storedFavorites);
        dispatch({ type: 'SET_FAVORITES', payload: favorites });
      } else {
        dispatch({ type: 'SET_FAVORITES', payload: [] });
      }
    } catch (error) {
      console.error('Error loading favorites from storage:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load favorites' });
    }
  };

  // Add favorite
  const addFavorite = async (item: Article) => {
    try {
      const favoriteItem: FavoriteItem = {
        id: item.id,
        type: item.type,
        title: item.title,
        favorited_at: new Date().toISOString(),
        data: item,
      };

      // Check if already favorited
      const alreadyFavorited = state.favorites.some(fav => fav.id === item.id);
      if (alreadyFavorited) {
        return;
      }

      dispatch({ type: 'ADD_FAVORITE', payload: favoriteItem });
      
      // Save to storage
      const updatedFavorites = [...state.favorites, favoriteItem];
      await saveFavoritesToStorage(updatedFavorites);
      
      console.log(`Added "${item.title}" to favorites`);
    } catch (error) {
      console.error('Error adding favorite:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add favorite' });
    }
  };

  // Remove favorite
  const removeFavorite = async (itemId: string) => {
    try {
      const itemToRemove = state.favorites.find(fav => fav.id === itemId);
      
      dispatch({ type: 'REMOVE_FAVORITE', payload: itemId });
      
      // Save to storage
      const updatedFavorites = state.favorites.filter(fav => fav.id !== itemId);
      await saveFavoritesToStorage(updatedFavorites);
      
      if (itemToRemove) {
        console.log(`Removed "${itemToRemove.title}" from favorites`);
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove favorite' });
    }
  };

  // Check if item is favorited
  const isFavorited = (itemId: string): boolean => {
    return state.favorites.some(fav => fav.id === itemId);
  };

  // Clear all favorites
  const clearAllFavorites = async () => {
    try {
      dispatch({ type: 'CLEAR_FAVORITES' });
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('Cleared all favorites');
    } catch (error) {
      console.error('Error clearing favorites:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clear favorites' });
    }
  };

  const actions = {
    addFavorite,
    removeFavorite,
    isFavorited,
    loadFavorites,
    clearAllFavorites,
  };

  return (
    <FavoritesContext.Provider value={{ state, actions }}>
      {children}
    </FavoritesContext.Provider>
  );
};

// Hook to use favorites context
export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

// Export types for use in other components
export type { FavoriteItem, FavoritesState };
