import {
  NavigationContainerRef,
  CommonActions,
} from '@react-navigation/native';
import { Content, LibrarySection } from '../types/library';
import { LibraryStackParamList } from './LibraryNavigator';

// Navigation utilities for the Library feature
export class LibraryNavigationUtils {
  private static navigationRef: React.RefObject<
    NavigationContainerRef<any>
  > | null = null;

  // Set navigation reference
  static setNavigationRef(ref: React.RefObject<NavigationContainerRef<any>>) {
    this.navigationRef = ref;
  }

  // Navigate to content based on type
  static navigateToContent(
    content: Content,
    source?: 'library' | 'search' | 'continue',
  ) {
    if (!this.navigationRef?.current) return;

    const navigation = this.navigationRef.current;

    switch (content.type) {
      case 'program':
        navigation.navigate('Library', {
          screen: 'ProgramDetail',
          params: {
            programId: content.id,
            content,
          },
        });
        break;

      case 'challenge':
        navigation.navigate('Library', {
          screen: 'ChallengeDetail',
          params: {
            challengeId: content.id,
            content,
          },
        });
        break;

      case 'article':
        navigation.navigate('Library', {
          screen: 'ArticleDetail',
          params: {
            articleId: content.id,
            content,
          },
        });
        break;

      case 'workout':
        navigation.navigate('Library', {
          screen: 'WorkoutPlayer',
          params: {
            workoutId: content.id,
            content,
          },
        });
        break;

      default:
        navigation.navigate('Library', {
          screen: 'ContentDetail',
          params: {
            content,
            source,
          },
        });
    }
  }

  // Navigate to search results
  static navigateToSearch(query?: string, filters?: any) {
    if (!this.navigationRef?.current) return;

    this.navigationRef.current.navigate('Library', {
      screen: 'SearchResults',
      params: {
        query,
        filters,
      },
    });
  }

  // Navigate to see all section
  static navigateToSeeAll(section: LibrarySection) {
    if (!this.navigationRef?.current) return;

    this.navigationRef.current.navigate('Library', {
      screen: 'SeeAllSection',
      params: {
        section,
      },
    });
  }

  // Navigate back to library main
  static navigateToLibraryMain() {
    if (!this.navigationRef?.current) return;

    this.navigationRef.current.navigate('Library', {
      screen: 'LibraryMain',
    });
  }

  // Start workout from program
  static startWorkoutFromProgram(
    workout: Content,
    programId: string,
    sessionNumber?: number,
  ) {
    if (!this.navigationRef?.current) return;

    this.navigationRef.current.navigate('Library', {
      screen: 'WorkoutPlayer',
      params: {
        workoutId: workout.id,
        content: workout,
        fromProgram: true,
        programId,
        sessionNumber,
      },
    });
  }

  // Continue program from where user left off
  static continueProgram(programId: string, content: Content) {
    if (!this.navigationRef?.current) return;

    this.navigationRef.current.navigate('Library', {
      screen: 'ProgramDetail',
      params: {
        programId,
        content,
        shouldContinue: true,
      },
    });
  }

  // Join challenge
  static joinChallenge(challengeId: string, content: Content) {
    if (!this.navigationRef?.current) return;

    this.navigationRef.current.navigate('Library', {
      screen: 'ChallengeDetail',
      params: {
        challengeId,
        content,
        shouldJoin: true,
      },
    });
  }

  // Reset navigation stack to library
  static resetToLibrary() {
    if (!this.navigationRef?.current) return;

    this.navigationRef.current.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'Library',
            params: {
              screen: 'LibraryMain',
            },
          },
        ],
      }),
    );
  }

  // Get current route name
  static getCurrentRouteName(): string | undefined {
    if (!this.navigationRef?.current) return undefined;

    return this.navigationRef.current.getCurrentRoute()?.name;
  }

  // Check if currently in library
  static isInLibrary(): boolean {
    const routeName = this.getCurrentRouteName();
    return routeName?.startsWith('Library') ?? false;
  }
}

// Deep linking configuration
export const libraryLinkingConfig = {
  screens: {
    Library: {
      screens: {
        LibraryMain: 'library',
        SearchResults: 'library/search',
        SeeAllSection: 'library/section/:sectionId',
        ContentDetail: 'library/content/:contentId',
        ProgramDetail: 'library/program/:programId',
        ChallengeDetail: 'library/challenge/:challengeId',
        ArticleDetail: 'library/article/:articleId',
        WorkoutPlayer: 'library/workout/:workoutId',
      },
    },
  },
};

// Deep link handlers
export class DeepLinkHandler {
  // Handle deep link to content
  static async handleContentLink(contentId: string, contentType?: string) {
    try {
      // In a real app, this would fetch content details from API
      // For now, we'll create a mock content object
      const mockContent: Content = {
        id: contentId,
        type: (contentType as any) || 'workout',
        title: `Content ${contentId}`,
        premium: false,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      LibraryNavigationUtils.navigateToContent(mockContent, 'library');
    } catch (error) {
      console.error('Failed to handle content deep link:', error);
      // Fallback to library main
      LibraryNavigationUtils.navigateToLibraryMain();
    }
  }

  // Handle deep link to search
  static handleSearchLink(query?: string) {
    LibraryNavigationUtils.navigateToSearch(query);
  }

  // Handle deep link to section
  static async handleSectionLink(sectionId: string) {
    try {
      // In a real app, this would fetch section details from API
      const mockSection: LibrarySection = {
        id: sectionId,
        type: 'programs',
        title: `Section ${sectionId}`,
        items: [],
        hasMore: false,
      };

      LibraryNavigationUtils.navigateToSeeAll(mockSection);
    } catch (error) {
      console.error('Failed to handle section deep link:', error);
      LibraryNavigationUtils.navigateToLibraryMain();
    }
  }

  // Parse and handle any library deep link
  static handleLibraryDeepLink(url: string) {
    try {
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/').filter(Boolean);

      if (pathSegments[0] !== 'library') return false;

      switch (pathSegments[1]) {
        case 'search':
          const query = urlObj.searchParams.get('q');
          this.handleSearchLink(query || undefined);
          return true;

        case 'content':
          if (pathSegments[2]) {
            const contentType = urlObj.searchParams.get('type');
            this.handleContentLink(pathSegments[2], contentType || undefined);
            return true;
          }
          break;

        case 'program':
          if (pathSegments[2]) {
            this.handleContentLink(pathSegments[2], 'program');
            return true;
          }
          break;

        case 'challenge':
          if (pathSegments[2]) {
            this.handleContentLink(pathSegments[2], 'challenge');
            return true;
          }
          break;

        case 'article':
          if (pathSegments[2]) {
            this.handleContentLink(pathSegments[2], 'article');
            return true;
          }
          break;

        case 'workout':
          if (pathSegments[2]) {
            this.handleContentLink(pathSegments[2], 'workout');
            return true;
          }
          break;

        case 'section':
          if (pathSegments[2]) {
            this.handleSectionLink(pathSegments[2]);
            return true;
          }
          break;

        default:
          // Default to library main
          LibraryNavigationUtils.navigateToLibraryMain();
          return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to parse library deep link:', error);
      return false;
    }
  }
}

// Navigation analytics
export class NavigationAnalytics {
  // Track screen views
  static trackScreenView(screenName: string, params?: any) {
    console.log('Screen view:', screenName, params);
    // In a real app, this would send to analytics service
  }

  // Track navigation actions
  static trackNavigation(
    action: string,
    from: string,
    to: string,
    params?: any,
  ) {
    console.log('Navigation:', { action, from, to, params });
    // In a real app, this would send to analytics service
  }

  // Track content interactions
  static trackContentInteraction(
    action: 'view' | 'start' | 'continue' | 'complete',
    content: Content,
    source?: string,
  ) {
    console.log('Content interaction:', {
      action,
      contentId: content.id,
      contentType: content.type,
      contentTitle: content.title,
      source,
    });
    // In a real app, this would send to analytics service
  }

  // Track search interactions
  static trackSearchInteraction(
    query: string,
    resultCount: number,
    filters?: any,
  ) {
    console.log('Search interaction:', {
      query,
      resultCount,
      filters,
    });
    // In a real app, this would send to analytics service
  }
}

// Navigation state persistence
export class NavigationPersistence {
  private static readonly STORAGE_KEY = '@navigation_state';

  // Save navigation state
  static async saveState(state: any) {
    try {
      const stateString = JSON.stringify(state);
      // In a real app, this would use AsyncStorage
      console.log('Saving navigation state:', stateString);
    } catch (error) {
      console.error('Failed to save navigation state:', error);
    }
  }

  // Restore navigation state
  static async restoreState(): Promise<any | null> {
    try {
      // In a real app, this would use AsyncStorage
      console.log('Restoring navigation state');
      return null; // Return null for fresh start
    } catch (error) {
      console.error('Failed to restore navigation state:', error);
      return null;
    }
  }
}
