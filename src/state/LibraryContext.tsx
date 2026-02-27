import React, {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useCallback,
} from 'react';
import {
  LibraryState,
  LibraryActions,
  LibraryFilters,
  LibrarySection,
  DEFAULT_FILTERS,
} from '../types/library';
import { remoteImageCacheService } from '../services/remoteImageCacheService';

// Action types
type LibraryAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SECTIONS'; payload: LibrarySection[] }
  | {
      type: 'UPDATE_SECTION';
      payload: {
        sectionId: string;
        items: any[];
        hasMore: boolean;
        nextCursor?: string;
      };
    }
  | { type: 'SET_FILTERS'; payload: Partial<LibraryFilters> }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_LAST_REFRESH'; payload: string };

// Initial state
const initialState: LibraryState = {
  sections: [],
  filters: DEFAULT_FILTERS,
  searchQuery: '',
  isLoading: false,
  error: null,
  lastRefresh: null,
};

// Reducer
function libraryReducer(
  state: LibraryState,
  action: LibraryAction,
): LibraryState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'SET_SECTIONS':
      return {
        ...state,
        sections: action.payload,
        isLoading: false,
        error: null,
      };

    case 'UPDATE_SECTION':
      return {
        ...state,
        sections: state.sections.map(section =>
          section.id === action.payload.sectionId
            ? {
                ...section,
                items: [...section.items, ...action.payload.items],
                hasMore: action.payload.hasMore,
                nextCursor: action.payload.nextCursor,
              }
            : section,
        ),
      };

    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        sections: [], // Clear sections when filters change
      };

    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
        sections: action.payload !== state.searchQuery ? [] : state.sections, // Clear sections if query changed
      };

    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: DEFAULT_FILTERS,
        searchQuery: '',
        sections: [],
      };

    case 'SET_LAST_REFRESH':
      return { ...state, lastRefresh: action.payload };

    default:
      return state;
  }
}

// Context
const LibraryContext = createContext<{
  state: LibraryState;
  actions: LibraryActions;
}>({
  state: initialState,
  actions: {
    updateFilters: () => {},
    setSearchQuery: () => {},
    refreshLibrary: async (_forceRefresh?: boolean) => {},
    loadMoreSection: async () => {},
    clearFilters: () => {},
  },
});

// Provider component
export const LibraryProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(libraryReducer, initialState);

  // Actions
  const updateFilters = useCallback((filters: Partial<LibraryFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, []);

  const refreshLibrary = useCallback(async (forceRefresh: boolean = true) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Import the API service
      const { libraryApi } = await import('../services/libraryApi');

      // Get library sections with current filters
      const sections = await libraryApi.getLibrarySections(state.filters, forceRefresh);

      // Warm native image cache in background for smoother repeat loads.
      void remoteImageCacheService.prefetchSections(sections);

      dispatch({ type: 'SET_SECTIONS', payload: sections });
      dispatch({ type: 'SET_LAST_REFRESH', payload: new Date().toISOString() });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to load library content',
      });
    }
  }, [state.filters]);

  const loadMoreSection = useCallback(
    async (sectionId: string) => {
      try {
        const section = state.sections.find(s => s.id === sectionId);
        if (!section || !section.hasMore) return;

        // Import the API service
        const { libraryApi } = await import('../services/libraryApi');

        // Load more items for the section
        const result = await libraryApi.loadMoreSectionItems(
          sectionId,
          section.nextCursor,
        );

        void remoteImageCacheService.prefetchContentItems(result.items);

        dispatch({
          type: 'UPDATE_SECTION',
          payload: {
            sectionId,
            items: result.items,
            hasMore: result.hasMore,
            nextCursor: result.nextCursor,
          },
        });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load more content' });
      }
    },
    [state.sections],
  );

  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, []);

  const actions: LibraryActions = useMemo(
    () => ({
      updateFilters,
      setSearchQuery,
      refreshLibrary,
      loadMoreSection,
      clearFilters,
    }),
    [
      updateFilters,
      setSearchQuery,
      refreshLibrary,
      loadMoreSection,
      clearFilters,
    ],
  );

  const value = useMemo(
    () => ({
      state,
      actions,
    }),
    [state, actions],
  );

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  );
};

// Hook
export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
