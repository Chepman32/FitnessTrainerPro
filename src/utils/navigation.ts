import { Linking } from 'react-native';
import { Content } from '../types/library';

// Deep linking utilities for the Library Screen
export class NavigationUtils {
  // Generate deep link for content
  static generateContentLink(content: Content): string {
    const baseUrl = 'fitnessapp://library';

    switch (content.type) {
      case 'program':
        return `${baseUrl}/program/${content.id}`;
      case 'challenge':
        return `${baseUrl}/challenge/${content.id}`;
      case 'workout':
        return `${baseUrl}/workout/${content.id}`;
      case 'article':
        return `${baseUrl}/article/${content.id}`;
      default:
        return `${baseUrl}/content/${content.id}`;
    }
  }

  // Generate search deep link
  static generateSearchLink(query: string, filters?: any): string {
    const baseUrl = 'fitnessapp://library/search';
    const params = new URLSearchParams();

    if (query) {
      params.append('q', query);
    }

    if (filters) {
      // Serialize filters as JSON
      params.append('filters', JSON.stringify(filters));
    }

    return `${baseUrl}?${params.toString()}`;
  }

  // Generate section deep link
  static generateSectionLink(sectionId: string): string {
    return `fitnessapp://library/section/${sectionId}`;
  }

  // Parse deep link URL
  static parseDeepLink(url: string): {
    screen: string;
    params: any;
  } | null {
    try {
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/').filter(Boolean);

      if (urlObj.protocol !== 'fitnessapp:' || pathSegments[0] !== 'library') {
        return null;
      }

      // Handle different deep link patterns
      if (pathSegments.length === 1) {
        // fitnessapp://library
        return { screen: 'LibraryHome', params: {} };
      }

      if (pathSegments[1] === 'search') {
        // fitnessapp://library/search?q=query&filters={}
        const query = urlObj.searchParams.get('q') || '';
        const filtersStr = urlObj.searchParams.get('filters');
        const filters = filtersStr ? JSON.parse(filtersStr) : undefined;

        return {
          screen: 'SearchResults',
          params: { query, filters },
        };
      }

      if (pathSegments[1] === 'section' && pathSegments[2]) {
        // fitnessapp://library/section/sectionId
        return {
          screen: 'SectionView',
          params: { sectionId: pathSegments[2] },
        };
      }

      if (pathSegments[1] === 'program' && pathSegments[2]) {
        // fitnessapp://library/program/programId
        return {
          screen: 'ProgramDetail',
          params: { programId: pathSegments[2] },
        };
      }

      if (pathSegments[1] === 'challenge' && pathSegments[2]) {
        // fitnessapp://library/challenge/challengeId
        return {
          screen: 'ChallengeDetail',
          params: { challengeId: pathSegments[2] },
        };
      }

      if (pathSegments[1] === 'workout' && pathSegments[2]) {
        // fitnessapp://library/workout/workoutId
        return {
          screen: 'WorkoutPlayer',
          params: { workoutId: pathSegments[2] },
        };
      }

      if (pathSegments[1] === 'article' && pathSegments[2]) {
        // fitnessapp://library/article/articleId
        return {
          screen: 'ArticleDetail',
          params: { articleId: pathSegments[2] },
        };
      }

      if (pathSegments[1] === 'content' && pathSegments[2]) {
        // fitnessapp://library/content/contentId
        return {
          screen: 'ContentDetail',
          params: { contentId: pathSegments[2] },
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to parse deep link:', error);
      return null;
    }
  }

  // Handle deep link navigation
  static async handleDeepLink(url: string, navigation: any): Promise<boolean> {
    const parsed = this.parseDeepLink(url);

    if (!parsed) {
      return false;
    }

    try {
      // Navigate to the appropriate screen
      navigation.navigate(parsed.screen, parsed.params);
      return true;
    } catch (error) {
      console.error('Failed to navigate from deep link:', error);
      return false;
    }
  }

  // Share content
  static async shareContent(content: Content): Promise<boolean> {
    try {
      const link = this.generateContentLink(content);
      const message = `Check out this ${content.type}: ${content.title}\n${link}`;

      // In a real app, you would use React Native's Share API
      // For now, we'll just copy to clipboard or use a sharing library
      console.log('Sharing content:', message);

      return true;
    } catch (error) {
      console.error('Failed to share content:', error);
      return false;
    }
  }

  // Open external links
  static async openExternalLink(url: string): Promise<boolean> {
    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
        return true;
      } else {
        console.warn('Cannot open URL:', url);
        return false;
      }
    } catch (error) {
      console.error('Failed to open external link:', error);
      return false;
    }
  }

  // Get navigation state for analytics
  static getNavigationState(navigation: any): {
    currentScreen: string;
    previousScreen?: string;
    params?: any;
  } {
    const state = navigation.getState();
    const currentRoute = state.routes[state.index];
    const previousRoute = state.routes[state.index - 1];

    return {
      currentScreen: currentRoute.name,
      previousScreen: previousRoute?.name,
      params: currentRoute.params,
    };
  }

  // Track navigation events for analytics
  static trackNavigation(
    from: string,
    to: string,
    params?: any,
    source?: 'user' | 'deeplink' | 'notification',
  ): void {
    // In a real app, this would send analytics events
    console.log('Navigation tracked:', {
      from,
      to,
      params,
      source,
      timestamp: new Date().toISOString(),
    });
  }

  // Generate breadcrumb navigation
  static generateBreadcrumb(navigationState: any): Array<{
    title: string;
    screen: string;
    params?: any;
  }> {
    const breadcrumb: Array<{ title: string; screen: string; params?: any }> =
      [];

    if (!navigationState || !navigationState.routes) {
      return breadcrumb;
    }

    // Build breadcrumb from navigation history
    navigationState.routes.forEach((route: any) => {
      let title = route.name;

      // Customize titles based on screen and params
      switch (route.name) {
        case 'LibraryHome':
          title = 'Library';
          break;
        case 'SearchResults':
          title = route.params?.query
            ? `Search: ${route.params.query}`
            : 'Search Results';
          break;
        case 'ContentDetail':
          title = route.params?.content?.title || 'Content';
          break;
        case 'SectionView':
          title = route.params?.title || 'Section';
          break;
        case 'ProgramDetail':
          title = route.params?.program?.title || 'Program';
          break;
        case 'ChallengeDetail':
          title = route.params?.challenge?.title || 'Challenge';
          break;
        case 'ArticleDetail':
          title = route.params?.article?.title || 'Article';
          break;
        case 'WorkoutPlayer':
          title = route.params?.workout?.title || 'Workout';
          break;
      }

      breadcrumb.push({
        title,
        screen: route.name,
        params: route.params,
      });
    });

    return breadcrumb;
  }

  // Check if user can navigate back
  static canGoBack(navigation: any): boolean {
    return navigation.canGoBack();
  }

  // Safe navigation with error handling
  static safeNavigate(
    navigation: any,
    screen: string,
    params?: any,
    options?: any,
  ): boolean {
    try {
      navigation.navigate(screen, params, options);
      return true;
    } catch (error) {
      console.error('Navigation failed:', error);
      return false;
    }
  }

  // Reset navigation stack
  static resetToScreen(navigation: any, screen: string, params?: any): boolean {
    try {
      navigation.reset({
        index: 0,
        routes: [{ name: screen, params }],
      });
      return true;
    } catch (error) {
      console.error('Navigation reset failed:', error);
      return false;
    }
  }

  // Navigate with animation options
  static navigateWithAnimation(
    navigation: any,
    screen: string,
    params?: any,
    animationType: 'slide' | 'fade' | 'modal' = 'slide',
  ): boolean {
    try {
      const options: any = {};

      switch (animationType) {
        case 'fade':
          options.cardStyleInterpolator = ({ current }: any) => ({
            cardStyle: {
              opacity: current.progress,
            },
          });
          break;
        case 'modal':
          options.presentation = 'modal';
          break;
        // 'slide' is default
      }

      navigation.navigate(screen, params, options);
      return true;
    } catch (error) {
      console.error('Animated navigation failed:', error);
      return false;
    }
  }
}

// Hook for navigation utilities
export const useNavigationUtils = (navigation: any) => {
  const generateContentLink = (content: Content) =>
    NavigationUtils.generateContentLink(content);

  const generateSearchLink = (query: string, filters?: any) =>
    NavigationUtils.generateSearchLink(query, filters);

  const shareContent = (content: Content) =>
    NavigationUtils.shareContent(content);

  const trackNavigation = (
    from: string,
    to: string,
    params?: any,
    source?: 'user' | 'deeplink' | 'notification',
  ) => NavigationUtils.trackNavigation(from, to, params, source);

  const safeNavigate = (screen: string, params?: any, options?: any) =>
    NavigationUtils.safeNavigate(navigation, screen, params, options);

  const canGoBack = () => NavigationUtils.canGoBack(navigation);

  const getNavigationState = () =>
    NavigationUtils.getNavigationState(navigation);

  const generateBreadcrumb = () =>
    NavigationUtils.generateBreadcrumb(navigation.getState());

  return {
    generateContentLink,
    generateSearchLink,
    shareContent,
    trackNavigation,
    safeNavigate,
    canGoBack,
    getNavigationState,
    generateBreadcrumb,
    navigation,
  };
};
