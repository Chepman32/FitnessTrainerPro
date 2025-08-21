import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import { useCallback, useRef } from 'react';
import { Content, LibrarySection } from '../types/library';
import {
  LibraryNavigationUtils,
  NavigationAnalytics,
} from '../navigation/navigationUtils';
import { usePremium } from './usePremium';
import { useUserProgress } from '../state/UserProgressContext';

// Hook for library navigation functionality
export const useLibraryNavigation = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { canAccessContent, canStartWorkout, canStartProgram } = usePremium();
  const { actions: progressActions } = useUserProgress();
  const screenViewTracked = useRef(false);

  // Track screen views
  useFocusEffect(
    useCallback(() => {
      if (!screenViewTracked.current) {
        NavigationAnalytics.trackScreenView(route.name, route.params);
        screenViewTracked.current = true;
      }

      return () => {
        screenViewTracked.current = false;
      };
    }, [route.name, route.params]),
  );

  // Navigate to content with premium and quota checks
  const navigateToContent = useCallback(
    async (content: Content, source?: string) => {
      try {
        // Check content access
        const accessCheck = canAccessContent(content);

        if (!accessCheck.canAccess) {
          // Handle premium content - could show premium gate here
          console.log('Premium content access required');
          // For now, still navigate to show the premium gate in the detail screen
        }

        // Check usage limits for workouts
        if (content.type === 'workout') {
          const workoutCheck = canStartWorkout();
          if (!workoutCheck.canStart) {
            console.log('Workout quota exceeded');
            // Could show quota exceeded modal here
          }
        }

        // Check usage limits for programs
        if (content.type === 'program') {
          const programCheck = canStartProgram();
          if (!programCheck.canStart) {
            console.log('Program quota exceeded');
            // Could show quota exceeded modal here
          }
        }

        // Track navigation
        NavigationAnalytics.trackNavigation(
          'navigate_to_content',
          route.name,
          `${content.type}_detail`,
          { contentId: content.id, source },
        );

        // Navigate based on content type
        switch (content.type) {
          case 'program':
            navigation.navigate(
              'ProgramDetail' as never,
              {
                programId: content.id,
                content,
              } as never,
            );
            break;

          case 'challenge':
            navigation.navigate(
              'ChallengeDetail' as never,
              {
                challengeId: content.id,
                content,
              } as never,
            );
            break;

          case 'article':
            navigation.navigate(
              'ArticleDetail' as never,
              {
                articleId: content.id,
                content,
              } as never,
            );
            break;

          case 'workout':
            navigation.navigate(
              'WorkoutPlayer' as never,
              {
                workoutId: content.id,
                content,
              } as never,
            );
            break;

          default:
            navigation.navigate(
              'ContentDetail' as never,
              {
                content,
                source,
              } as never,
            );
        }

        // Track content interaction
        NavigationAnalytics.trackContentInteraction('view', content, source);
      } catch (error) {
        console.error('Failed to navigate to content:', error);
      }
    },
    [
      navigation,
      route.name,
      canAccessContent,
      canStartWorkout,
      canStartProgram,
    ],
  );

  // Navigate to see all section
  const navigateToSeeAll = useCallback(
    (section: LibrarySection) => {
      NavigationAnalytics.trackNavigation(
        'navigate_to_see_all',
        route.name,
        'see_all_section',
        { sectionId: section.id, sectionTitle: section.title },
      );

      navigation.navigate('SeeAllSection' as never, { section } as never);
    },
    [navigation, route.name],
  );

  // Navigate to search results
  const navigateToSearch = useCallback(
    (query?: string, filters?: any) => {
      NavigationAnalytics.trackNavigation(
        'navigate_to_search',
        route.name,
        'search_results',
        { query, filters },
      );

      navigation.navigate(
        'SearchResults' as never,
        { query, filters } as never,
      );
    },
    [navigation, route.name],
  );

  // Continue program from progress
  const continueProgram = useCallback(
    async (programId: string, content: Content) => {
      try {
        const progress = progressActions.getProgress(programId);

        if (progress) {
          // Track continue action
          NavigationAnalytics.trackContentInteraction(
            'continue',
            content,
            'library',
          );

          // Navigate to program detail with continue flag
          navigation.navigate(
            'ProgramDetail' as never,
            {
              programId,
              content,
              shouldContinue: true,
              currentWeek: progress.currentWeek,
              currentSession: progress.currentSession,
            } as never,
          );
        } else {
          // No progress found, navigate normally
          navigateToContent(content, 'continue');
        }
      } catch (error) {
        console.error('Failed to continue program:', error);
        // Fallback to normal navigation
        navigateToContent(content, 'continue');
      }
    },
    [navigation, progressActions, navigateToContent],
  );

  // Start workout with usage tracking
  const startWorkout = useCallback(
    async (content: Content, fromProgram?: boolean, programId?: string) => {
      try {
        // Check if user can start workout
        const workoutCheck = canStartWorkout();

        if (!workoutCheck.canStart) {
          console.log('Cannot start workout:', workoutCheck.reason);
          // Could show quota exceeded modal
          return false;
        }

        // Track workout start
        NavigationAnalytics.trackContentInteraction(
          'start',
          content,
          fromProgram ? 'program' : 'library',
        );

        // Navigate to workout player
        navigation.navigate(
          'WorkoutPlayer' as never,
          {
            workoutId: content.id,
            content,
            fromProgram,
            programId,
          } as never,
        );

        return true;
      } catch (error) {
        console.error('Failed to start workout:', error);
        return false;
      }
    },
    [navigation, canStartWorkout],
  );

  // Join challenge
  const joinChallenge = useCallback(
    async (content: Content) => {
      try {
        // Track challenge join
        NavigationAnalytics.trackContentInteraction(
          'start',
          content,
          'library',
        );

        // Navigate to challenge detail with join flag
        navigation.navigate(
          'ChallengeDetail' as never,
          {
            challengeId: content.id,
            content,
            shouldJoin: true,
          } as never,
        );

        return true;
      } catch (error) {
        console.error('Failed to join challenge:', error);
        return false;
      }
    },
    [navigation],
  );

  // Go back with analytics
  const goBack = useCallback(() => {
    NavigationAnalytics.trackNavigation(
      'go_back',
      route.name,
      'previous_screen',
    );
    navigation.goBack();
  }, [navigation, route.name]);

  // Navigate to library main
  const goToLibraryMain = useCallback(() => {
    NavigationAnalytics.trackNavigation(
      'navigate_to_main',
      route.name,
      'library_main',
    );
    LibraryNavigationUtils.navigateToLibraryMain();
  }, [route.name]);

  // Reset to library
  const resetToLibrary = useCallback(() => {
    NavigationAnalytics.trackNavigation(
      'reset_to_library',
      route.name,
      'library_main',
    );
    LibraryNavigationUtils.resetToLibrary();
  }, [route.name]);

  // Get navigation state info
  const getNavigationInfo = useCallback(() => {
    return {
      currentRoute: route.name,
      params: route.params,
      canGoBack: navigation.canGoBack(),
    };
  }, [route.name, route.params, navigation]);

  return {
    // Navigation actions
    navigateToContent,
    navigateToSeeAll,
    navigateToSearch,
    continueProgram,
    startWorkout,
    joinChallenge,
    goBack,
    goToLibraryMain,
    resetToLibrary,

    // Navigation state
    getNavigationInfo,
    currentRoute: route.name,
    routeParams: route.params,
    canGoBack: navigation.canGoBack(),
  };
};

// Hook for handling deep links in library screens
export const useLibraryDeepLinks = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Handle incoming deep link
  const handleDeepLink = useCallback(
    (url: string) => {
      try {
        // Parse the URL and navigate accordingly
        const urlObj = new URL(url);
        const pathSegments = urlObj.pathname.split('/').filter(Boolean);

        if (pathSegments[0] === 'library') {
          // Handle library-specific deep links
          switch (pathSegments[1]) {
            case 'search':
              const query = urlObj.searchParams.get('q');
              navigation.navigate('SearchResults' as never, { query } as never);
              break;

            case 'content':
              if (pathSegments[2]) {
                // Would fetch content and navigate
                console.log('Deep link to content:', pathSegments[2]);
              }
              break;

            default:
              navigation.navigate('LibraryMain' as never);
          }

          return true;
        }

        return false;
      } catch (error) {
        console.error('Failed to handle deep link:', error);
        return false;
      }
    },
    [navigation],
  );

  // Generate shareable link for content
  const generateContentLink = useCallback((content: Content): string => {
    const baseUrl = 'https://app.fitness.com'; // Would be actual app URL
    return `${baseUrl}/library/${content.type}/${content.id}`;
  }, []);

  // Generate shareable link for search
  const generateSearchLink = useCallback(
    (query: string, filters?: any): string => {
      const baseUrl = 'https://app.fitness.com';
      const params = new URLSearchParams();
      params.set('q', query);

      if (filters) {
        params.set('filters', JSON.stringify(filters));
      }

      return `${baseUrl}/library/search?${params.toString()}`;
    },
    [],
  );

  return {
    handleDeepLink,
    generateContentLink,
    generateSearchLink,
  };
};

// Hook for navigation-aware component lifecycle
export const useNavigationLifecycle = (callbacks: {
  onFocus?: () => void;
  onBlur?: () => void;
  onBeforeRemove?: () => void;
}) => {
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      callbacks.onFocus?.();

      return () => {
        callbacks.onBlur?.();
      };
    }, [callbacks]),
  );

  // Handle before remove (e.g., unsaved changes)
  React.useEffect(() => {
    if (callbacks.onBeforeRemove) {
      const unsubscribe = navigation.addListener('beforeRemove', e => {
        callbacks.onBeforeRemove?.();
      });

      return unsubscribe;
    }
  }, [navigation, callbacks.onBeforeRemove]);
};

// Import React for useEffect
import React from 'react';
