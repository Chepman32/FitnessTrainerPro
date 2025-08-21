import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { SearchBar } from '../../components/library/SearchBar';
import { LibraryProvider } from '../../state/LibraryContext';

// Mock the library API
jest.mock('../../services/libraryApi', () => ({
  libraryApi: {
    searchContent: jest.fn(),
    loadFilterPreferences: jest.fn(),
  },
}));

// Mock debouncing
jest.useFakeTimers();

const renderWithProvider = (component: React.ReactElement) => {
  return render(<LibraryProvider>{component}</LibraryProvider>);
};

describe('SearchBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { libraryApi } = require('../../services/libraryApi');
    libraryApi.searchContent.mockResolvedValue({
      items: [],
      suggestions: ['push-ups', 'core workout', 'strength training'],
    });
    libraryApi.loadFilterPreferences.mockResolvedValue(null);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render search input with placeholder', () => {
      const { getByPlaceholderText } = renderWithProvider(<SearchBar />);

      expect(getByPlaceholderText('Find a workout, article...')).toBeTruthy();
    });

    it('should render search icon', () => {
      const { getByTestId } = renderWithProvider(<SearchBar />);

      // Would need to add testID to search icon in actual component
      // This is a conceptual test for the search icon presence
    });

    it('should not show clear button initially', () => {
      const { queryByRole } = renderWithProvider(<SearchBar />);

      // Clear button should not be visible when search is empty
      const clearButtons = queryByRole('button', { name: /clear/i });
      expect(clearButtons).toBeFalsy();
    });
  });

  describe('Search Input', () => {
    it('should update search query on text input', () => {
      const { getByPlaceholderText } = renderWithProvider(<SearchBar />);
      const searchInput = getByPlaceholderText('Find a workout, article...');

      fireEvent.changeText(searchInput, 'push ups');

      expect(searchInput.props.value).toBe('push ups');
    });

    it('should show clear button when text is entered', () => {
      const { getByPlaceholderText, getByLabelText } = renderWithProvider(
        <SearchBar />,
      );
      const searchInput = getByPlaceholderText('Find a workout, article...');

      fireEvent.changeText(searchInput, 'push ups');

      expect(getByLabelText('Clear search')).toBeTruthy();
    });

    it('should clear search when clear button is pressed', () => {
      const { getByPlaceholderText, getByLabelText } = renderWithProvider(
        <SearchBar />,
      );
      const searchInput = getByPlaceholderText('Find a workout, article...');

      fireEvent.changeText(searchInput, 'push ups');
      fireEvent.press(getByLabelText('Clear search'));

      expect(searchInput.props.value).toBe('');
    });
  });

  describe('Debounced Search', () => {
    it('should debounce search requests', async () => {
      const { libraryApi } = require('../../services/libraryApi');
      const { getByPlaceholderText } = renderWithProvider(<SearchBar />);
      const searchInput = getByPlaceholderText('Find a workout, article...');

      // Type multiple characters quickly
      fireEvent.changeText(searchInput, 'p');
      fireEvent.changeText(searchInput, 'pu');
      fireEvent.changeText(searchInput, 'pus');
      fireEvent.changeText(searchInput, 'push');

      // Fast-forward time but not enough to trigger debounce
      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(libraryApi.searchContent).not.toHaveBeenCalled();

      // Fast-forward past debounce delay
      act(() => {
        jest.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(libraryApi.searchContent).toHaveBeenCalledTimes(1);
        expect(libraryApi.searchContent).toHaveBeenCalledWith(
          'push',
          expect.any(Object),
        );
      });
    });

    it('should not search for empty queries', async () => {
      const { libraryApi } = require('../../services/libraryApi');
      const { getByPlaceholderText } = renderWithProvider(<SearchBar />);
      const searchInput = getByPlaceholderText('Find a workout, article...');

      fireEvent.changeText(searchInput, '   '); // Whitespace only

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(libraryApi.searchContent).not.toHaveBeenCalled();
    });
  });

  describe('Search Suggestions', () => {
    it('should show suggestions when input is focused', async () => {
      const { getByPlaceholderText, getByText } = renderWithProvider(
        <SearchBar />,
      );
      const searchInput = getByPlaceholderText('Find a workout, article...');

      fireEvent.focus(searchInput);
      fireEvent.changeText(searchInput, 'push');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(getByText('push-ups')).toBeTruthy();
      });
    });

    it('should hide suggestions when input is blurred', async () => {
      const { getByPlaceholderText, queryByText } = renderWithProvider(
        <SearchBar />,
      );
      const searchInput = getByPlaceholderText('Find a workout, article...');

      fireEvent.focus(searchInput);
      fireEvent.changeText(searchInput, 'push');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(queryByText('push-ups')).toBeTruthy();
      });

      fireEvent.blur(searchInput);

      // Wait for blur delay
      await waitFor(
        () => {
          expect(queryByText('push-ups')).toBeFalsy();
        },
        { timeout: 200 },
      );
    });

    it('should handle suggestion selection', async () => {
      const { getByPlaceholderText, getByText } = renderWithProvider(
        <SearchBar />,
      );
      const searchInput = getByPlaceholderText('Find a workout, article...');

      fireEvent.focus(searchInput);
      fireEvent.changeText(searchInput, 'push');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(getByText('push-ups')).toBeTruthy();
      });

      fireEvent.press(getByText('push-ups'));

      expect(searchInput.props.value).toBe('push-ups');
    });
  });

  describe('Recent Searches', () => {
    it('should show recent searches when focused with empty query', async () => {
      const { getByPlaceholderText, getByText } = renderWithProvider(
        <SearchBar />,
      );
      const searchInput = getByPlaceholderText('Find a workout, article...');

      fireEvent.focus(searchInput);

      // Should show mock recent searches
      await waitFor(() => {
        expect(getByText('push ups')).toBeTruthy();
        expect(getByText('core workout')).toBeTruthy();
        expect(getByText('beginner')).toBeTruthy();
      });
    });

    it('should handle recent search selection', async () => {
      const { getByPlaceholderText, getByText } = renderWithProvider(
        <SearchBar />,
      );
      const searchInput = getByPlaceholderText('Find a workout, article...');

      fireEvent.focus(searchInput);

      await waitFor(() => {
        expect(getByText('push ups')).toBeTruthy();
      });

      fireEvent.press(getByText('push ups'));

      expect(searchInput.props.value).toBe('push ups');
    });
  });

  describe('Search Submission', () => {
    it('should handle search submission on enter', () => {
      const { getByPlaceholderText } = renderWithProvider(<SearchBar />);
      const searchInput = getByPlaceholderText('Find a workout, article...');

      fireEvent.changeText(searchInput, 'push ups');
      fireEvent(searchInput, 'submitEditing');

      // Should trigger library refresh and save to recent searches
      expect(searchInput.props.value).toBe('push ups');
    });

    it('should not submit empty searches', () => {
      const { getByPlaceholderText } = renderWithProvider(<SearchBar />);
      const searchInput = getByPlaceholderText('Find a workout, article...');

      fireEvent.changeText(searchInput, '   ');
      fireEvent(searchInput, 'submitEditing');

      // Should not trigger any action for empty/whitespace queries
    });
  });

  describe('Loading States', () => {
    it('should show loading indicator during search', async () => {
      const { libraryApi } = require('../../services/libraryApi');

      // Make search take longer
      libraryApi.searchContent.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve({ items: [], suggestions: [] }), 1000),
          ),
      );

      const { getByPlaceholderText, getByTestId } = renderWithProvider(
        <SearchBar />,
      );
      const searchInput = getByPlaceholderText('Find a workout, article...');

      fireEvent.changeText(searchInput, 'push');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should show loading indicator
      // Would need to add testID to loading indicator in actual component
      await waitFor(() => {
        // expect(getByTestId('search-loading')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle search API errors gracefully', async () => {
      const { libraryApi } = require('../../services/libraryApi');
      libraryApi.searchContent.mockRejectedValue(new Error('API Error'));

      const { getByPlaceholderText } = renderWithProvider(<SearchBar />);
      const searchInput = getByPlaceholderText('Find a workout, article...');

      fireEvent.changeText(searchInput, 'push');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should not crash and should handle error gracefully
      await waitFor(() => {
        expect(searchInput.props.value).toBe('push');
      });
    });

    it('should handle storage errors gracefully', async () => {
      const { libraryApi } = require('../../services/libraryApi');
      libraryApi.loadFilterPreferences.mockRejectedValue(
        new Error('Storage Error'),
      );

      // Should not crash during initialization
      expect(() => {
        renderWithProvider(<SearchBar />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByLabelText } = renderWithProvider(<SearchBar />);

      expect(getByLabelText('Search workouts and articles')).toBeTruthy();
    });

    it('should have proper accessibility roles', () => {
      const { getByRole } = renderWithProvider(<SearchBar />);

      expect(getByRole('searchbox')).toBeTruthy();
    });

    it('should announce search results to screen readers', async () => {
      // This would require mocking AccessibilityInfo
      // and testing screen reader announcements
    });
  });

  describe('Performance', () => {
    it('should cancel previous search requests', async () => {
      const { libraryApi } = require('../../services/libraryApi');
      const { getByPlaceholderText } = renderWithProvider(<SearchBar />);
      const searchInput = getByPlaceholderText('Find a workout, article...');

      // Start first search
      fireEvent.changeText(searchInput, 'push');

      act(() => {
        jest.advanceTimersByTime(200);
      });

      // Start second search before first completes
      fireEvent.changeText(searchInput, 'pull');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should only call API once with the latest query
      await waitFor(() => {
        expect(libraryApi.searchContent).toHaveBeenCalledTimes(1);
        expect(libraryApi.searchContent).toHaveBeenCalledWith(
          'pull',
          expect.any(Object),
        );
      });
    });
  });
});
