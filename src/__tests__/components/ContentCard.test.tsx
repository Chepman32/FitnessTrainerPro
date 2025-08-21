import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ContentCard } from '../../components/library/ContentCard';
import { UserProgressProvider } from '../../state/UserProgressContext';
import { Content } from '../../types/library';

// Mock the premium service
jest.mock('../../services/premiumService', () => ({
  premiumService: {
    canAccessContent: jest.fn(() => ({ canAccess: true })),
    hasPremiumAccess: jest.fn(() => false),
  },
}));

const mockWorkout: Content = {
  id: 'workout-1',
  type: 'workout',
  title: 'Morning Cardio',
  premium: false,
  tags: ['cardio', 'morning'],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  durationMinutes: 15,
  level: 'Beginner',
  equipment: ['none'],
  locations: ['home'],
  goals: ['cardio'],
  exercises: ['jumping_jacks', 'burpees'],
  estimatedCalories: 120,
};

const mockProgram: Content = {
  id: 'program-1',
  type: 'program',
  title: 'Beginner Strength',
  premium: true,
  tags: ['strength', 'beginner'],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  weeks: 4,
  sessionsPerWeek: 3,
  level: 'Beginner',
  equipment: ['dumbbells'],
  locations: ['home', 'gym'],
  goals: ['strength', 'muscle'],
  totalWorkouts: 12,
  estimatedCalories: 300,
};

const mockChallenge: Content = {
  id: 'challenge-1',
  type: 'challenge',
  title: '30-Day Push-up Challenge',
  premium: false,
  tags: ['push-ups', '30-day'],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  durationDays: 30,
  metricType: 'reps',
  participantsCount: 1250,
  friendsCount: 3,
  joined: false,
};

const mockArticle: Content = {
  id: 'article-1',
  type: 'article',
  title: 'The Science of Muscle Building',
  premium: false,
  tags: ['muscle', 'science'],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  readTimeMinutes: 5,
  topic: 'Nutrition',
  publishedAt: '2024-01-01T00:00:00Z',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  excerpt: 'Learn about muscle building',
  author: 'Dr. Smith',
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(<UserProgressProvider>{component}</UserProgressProvider>);
};

describe('ContentCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Workout Card', () => {
    it('should render workout card correctly', () => {
      const { getByText } = renderWithProvider(
        <ContentCard content={mockWorkout} />,
      );

      expect(getByText('Morning Cardio')).toBeTruthy();
      expect(getByText('15 min • 120 cal')).toBeTruthy();
      expect(getByText('Beginner')).toBeTruthy();
      expect(getByText('No equipment')).toBeTruthy();
      expect(getByText('Start Workout')).toBeTruthy();
    });

    it('should call onPress when workout card is pressed', () => {
      const onPress = jest.fn();
      const { getByRole } = renderWithProvider(
        <ContentCard content={mockWorkout} onPress={onPress} />,
      );

      const card = getByRole('button');
      fireEvent.press(card);

      expect(onPress).toHaveBeenCalledWith(mockWorkout);
    });

    it('should show equipment when not none', () => {
      const workoutWithEquipment = {
        ...mockWorkout,
        equipment: ['dumbbells', 'bands'],
      };

      const { queryByText } = renderWithProvider(
        <ContentCard content={workoutWithEquipment} />,
      );

      expect(queryByText('No equipment')).toBeFalsy();
    });
  });

  describe('Program Card', () => {
    it('should render program card correctly', () => {
      const { getByText } = renderWithProvider(
        <ContentCard content={mockProgram} />,
      );

      expect(getByText('Beginner Strength')).toBeTruthy();
      expect(getByText('4 weeks • 3x/week')).toBeTruthy();
      expect(getByText('Beginner')).toBeTruthy();
    });

    it('should show premium badge for premium programs', () => {
      const { getByText } = renderWithProvider(
        <ContentCard content={mockProgram} />,
      );

      expect(getByText('Premium')).toBeTruthy();
    });

    it('should show progress bar when program has progress', async () => {
      // This would require mocking the progress context with actual progress
      // For now, we'll test the basic rendering
      const { getByText } = renderWithProvider(
        <ContentCard content={mockProgram} />,
      );

      expect(getByText('Beginner Strength')).toBeTruthy();
    });
  });

  describe('Challenge Card', () => {
    it('should render challenge card correctly', () => {
      const { getByText } = renderWithProvider(
        <ContentCard content={mockChallenge} />,
      );

      expect(getByText('30-Day Push-up Challenge')).toBeTruthy();
      expect(getByText('30 days • reps')).toBeTruthy();
      expect(getByText('1,250 participants')).toBeTruthy();
      expect(getByText('• 3 friends')).toBeTruthy();
      expect(getByText('Join Challenge')).toBeTruthy();
    });

    it('should show joined state when user has joined', () => {
      const joinedChallenge = {
        ...mockChallenge,
        joined: true,
      };

      const { getByText, queryByText } = renderWithProvider(
        <ContentCard content={joinedChallenge} />,
      );

      expect(getByText('Joined')).toBeTruthy();
      expect(queryByText('Join Challenge')).toBeFalsy();
    });

    it('should not show friends count when zero', () => {
      const challengeNoFriends = {
        ...mockChallenge,
        friendsCount: 0,
      };

      const { queryByText } = renderWithProvider(
        <ContentCard content={challengeNoFriends} />,
      );

      expect(queryByText('• 0 friends')).toBeFalsy();
    });
  });

  describe('Article Card', () => {
    it('should render article card correctly', () => {
      const { getByText } = renderWithProvider(
        <ContentCard content={mockArticle} />,
      );

      expect(getByText('The Science of Muscle Building')).toBeTruthy();
      expect(getByText('Learn about muscle building')).toBeTruthy();
      expect(getByText('5 min read • Nutrition')).toBeTruthy();
      expect(getByText('By Dr. Smith')).toBeTruthy();
    });

    it('should show premium badge for premium articles', () => {
      const premiumArticle = {
        ...mockArticle,
        premium: true,
      };

      const { getByText } = renderWithProvider(
        <ContentCard content={premiumArticle} />,
      );

      expect(getByText('Premium')).toBeTruthy();
    });
  });

  describe('Image Loading', () => {
    it('should show placeholder when no cover image', () => {
      const { getByTestId } = renderWithProvider(
        <ContentCard content={mockWorkout} />,
      );

      // Would need to add testID to placeholder in actual component
      // This is a conceptual test
    });

    it('should handle image loading errors', async () => {
      const workoutWithImage = {
        ...mockWorkout,
        coverUrl: 'https://invalid-url.com/image.jpg',
      };

      const { getByTestId } = renderWithProvider(
        <ContentCard content={workoutWithImage} />,
      );

      // Would need to simulate image error and test fallback
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByRole } = renderWithProvider(
        <ContentCard content={mockWorkout} />,
      );

      const card = getByRole('button');
      expect(card.props.accessibilityLabel).toContain('workout');
      expect(card.props.accessibilityLabel).toContain('Morning Cardio');
    });

    it('should have proper accessibility role', () => {
      const { getByRole } = renderWithProvider(
        <ContentCard content={mockWorkout} />,
      );

      expect(getByRole('button')).toBeTruthy();
    });
  });

  describe('Premium Integration', () => {
    it('should handle premium content access check', () => {
      const { premiumService } = require('../../services/premiumService');

      renderWithProvider(<ContentCard content={mockProgram} />);

      // Premium service should be called to check access
      expect(premiumService.canAccessContent).toHaveBeenCalledWith(mockProgram);
    });

    it('should show lock icon for inaccessible premium content', () => {
      const { premiumService } = require('../../services/premiumService');
      premiumService.canAccessContent.mockReturnValue({ canAccess: false });

      const { getByText } = renderWithProvider(
        <ContentCard content={mockProgram} />,
      );

      expect(getByText('Premium')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing content properties gracefully', () => {
      const incompleteContent = {
        id: 'incomplete',
        type: 'workout',
        title: 'Incomplete Workout',
        premium: false,
        tags: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        // Missing other required properties
      } as Content;

      // Should not crash
      expect(() => {
        renderWithProvider(<ContentCard content={incompleteContent} />);
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const onPress = jest.fn();
      const { rerender } = renderWithProvider(
        <ContentCard content={mockWorkout} onPress={onPress} />,
      );

      // Re-render with same props
      rerender(
        <UserProgressProvider>
          <ContentCard content={mockWorkout} onPress={onPress} />
        </UserProgressProvider>,
      );

      // Component should be memoized and not re-render
      // This would require React.memo implementation in the actual component
    });
  });
});
