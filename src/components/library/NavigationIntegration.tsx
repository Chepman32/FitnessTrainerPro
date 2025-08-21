import React, { useEffect, useCallback } from 'react';
import { Linking, BackHandler } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NavigationUtils, useNavigationUtils } from '../../utils/navigation';
import { Content, LibrarySection } from '../../types/library';
import { LibraryScreen } from '../../screens/LibraryScreen';

type NavigationIntegrationProps = {
  onContentPress?: (content: Content) => void;
  onSeeAllPress?: (section: LibrarySection) => void;
};

export const NavigationIntegration: React.FC<NavigationIntegrationProps> = ({
  onContentPress,
  onSeeAllPress,
}) => {
  const navigation = useNavigation<any>();
  const navigationUtils = useNavigationUtils(navigation);

  // Handle deep links
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      NavigationUtils.handleDeepLink(url, navigation);
    };

    // Handle initial deep link (app opened from link)
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Handle deep links while app is running
    const linkingListener = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      linkingListener.remove();
    };
  }, [navigation]);

  // Handle Android back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (navigationUtils.canGoBack()) {
          navigation.goBack();
          return true; // Prevent default behavior
        }
        return false; // Allow default behavior (exit app)
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => backHandler.remove();
    }, [navigation, navigationUtils]),
  );

  // Handle content press with navigation
  const handleContentPress = useCallback(
    (content: Content) => {
      // Track navigation event
      navigationUtils.trackNavigation(
        navigationUtils.getNavigationState().currentScreen,
        getTargetScreen(content),
        { contentId: content.id, contentType: content.type },
        'user',
      );

      // Navigate based on content type
      switch (content.type) {
        case 'program':
          navigationUtils.safeNavigate('ProgramDetail', {
            programId: content.id,
            program: content,
          });
          break;

        case 'challenge':
          navigationUtils.safeNavigate('ChallengeDetail', {
            challengeId: content.id,
            challenge: content,
          });
          break;

        case 'workout':
          navigationUtils.safeNavigate('WorkoutPlayer', {
            workoutId: content.id,
            workout: content,
            source: 'library',
          });
          break;

        case 'article':
          navigationUtils.safeNavigate('ArticleDetail', {
            articleId: content.id,
            article: content,
          });
          break;

        default:
          navigationUtils.safeNavigate('ContentDetail', {
            content,
            source: 'library',
          });
      }

      // Call external handler if provided
      onContentPress?.(content);
    },
    [navigationUtils, onContentPress],
  );

  // Handle see all press with navigation
  const handleSeeAllPress = useCallback(
    (section: LibrarySection) => {
      // Track navigation event
      navigationUtils.trackNavigation(
        navigationUtils.getNavigationState().currentScreen,
        'SectionView',
        { sectionId: section.id, sectionType: section.type },
        'user',
      );

      navigationUtils.safeNavigate('SectionView', {
        section,
        title: section.title,
      });

      // Call external handler if provided
      onSeeAllPress?.(section);
    },
    [navigationUtils, onSeeAllPress],
  );

  return (
    <LibraryScreen
      onContentPress={handleContentPress}
      onSeeAllPress={handleSeeAllPress}
    />
  );
};

// Helper function to determine target screen for content
function getTargetScreen(content: Content): string {
  switch (content.type) {
    case 'program':
      return 'ProgramDetail';
    case 'challenge':
      return 'ChallengeDetail';
    case 'workout':
      return 'WorkoutPlayer';
    case 'article':
      return 'ArticleDetail';
    default:
      return 'ContentDetail';
  }
}

// Navigation-aware search integration
export const NavigationAwareSearchIntegration: React.FC = () => {
  const navigation = useNavigation<any>();
  const navigationUtils = useNavigationUtils(navigation);

  const handleContentPress = useCallback(
    (content: Content) => {
      // Track search-to-content navigation
      navigationUtils.trackNavigation(
        'SearchResults',
        getTargetScreen(content),
        { contentId: content.id, contentType: content.type, source: 'search' },
        'user',
      );

      // Navigate to content detail
      switch (content.type) {
        case 'program':
          navigationUtils.safeNavigate('ProgramDetail', {
            programId: content.id,
            program: content,
          });
          break;

        case 'challenge':
          navigationUtils.safeNavigate('ChallengeDetail', {
            challengeId: content.id,
            challenge: content,
          });
          break;

        case 'workout':
          navigationUtils.safeNavigate('WorkoutPlayer', {
            workoutId: content.id,
            workout: content,
            source: 'search',
          });
          break;

        case 'article':
          navigationUtils.safeNavigate('ArticleDetail', {
            articleId: content.id,
            article: content,
          });
          break;

        default:
          navigationUtils.safeNavigate('ContentDetail', {
            content,
            source: 'search',
          });
      }
    },
    [navigationUtils],
  );

  return (
    <NavigationIntegration
      onContentPress={handleContentPress}
      onSeeAllPress={section => {
        navigationUtils.safeNavigate('SectionView', {
          section,
          title: section.title,
        });
      }}
    />
  );
};

// Hook for library navigation
export const useLibraryNavigation = () => {
  const navigation = useNavigation<any>();
  const navigationUtils = useNavigationUtils(navigation);

  const navigateToContent = useCallback(
    (content: Content, source?: string) => {
      const targetScreen = getTargetScreen(content);

      navigationUtils.trackNavigation(
        navigationUtils.getNavigationState().currentScreen,
        targetScreen,
        { contentId: content.id, contentType: content.type, source },
        'user',
      );

      switch (content.type) {
        case 'program':
          return navigationUtils.safeNavigate('ProgramDetail', {
            programId: content.id,
            program: content,
          });

        case 'challenge':
          return navigationUtils.safeNavigate('ChallengeDetail', {
            challengeId: content.id,
            challenge: content,
          });

        case 'workout':
          return navigationUtils.safeNavigate('WorkoutPlayer', {
            workoutId: content.id,
            workout: content,
            source: source || 'library',
          });

        case 'article':
          return navigationUtils.safeNavigate('ArticleDetail', {
            articleId: content.id,
            article: content,
          });

        default:
          return navigationUtils.safeNavigate('ContentDetail', {
            content,
            source: source || 'library',
          });
      }
    },
    [navigationUtils],
  );

  const navigateToSection = useCallback(
    (section: LibrarySection) => {
      navigationUtils.trackNavigation(
        navigationUtils.getNavigationState().currentScreen,
        'SectionView',
        { sectionId: section.id, sectionType: section.type },
        'user',
      );

      return navigationUtils.safeNavigate('SectionView', {
        section,
        title: section.title,
      });
    },
    [navigationUtils],
  );

  const navigateToSearch = useCallback(
    (query?: string, filters?: any) => {
      navigationUtils.trackNavigation(
        navigationUtils.getNavigationState().currentScreen,
        'SearchResults',
        { query, filters },
        'user',
      );

      return navigationUtils.safeNavigate('SearchResults', {
        query,
        filters,
      });
    },
    [navigationUtils],
  );

  const navigateToPremiumUpgrade = useCallback(
    (source?: string, contentId?: string) => {
      navigationUtils.trackNavigation(
        navigationUtils.getNavigationState().currentScreen,
        'PremiumUpgrade',
        { source, contentId },
        'user',
      );

      return navigationUtils.safeNavigate('PremiumUpgrade', {
        source,
        contentId,
      });
    },
    [navigationUtils],
  );

  const navigateToOfflineContent = useCallback(() => {
    navigationUtils.trackNavigation(
      navigationUtils.getNavigationState().currentScreen,
      'OfflineContent',
      {},
      'user',
    );

    return navigationUtils.safeNavigate('OfflineContent');
  }, [navigationUtils]);

  const shareContent = useCallback(
    (content: Content) => {
      return navigationUtils.shareContent(content);
    },
    [navigationUtils],
  );

  const goBack = useCallback(() => {
    if (navigationUtils.canGoBack()) {
      navigation.goBack();
      return true;
    }
    return false;
  }, [navigation, navigationUtils]);

  return {
    navigateToContent,
    navigateToSection,
    navigateToSearch,
    navigateToPremiumUpgrade,
    navigateToOfflineContent,
    shareContent,
    goBack,
    canGoBack: navigationUtils.canGoBack,
    getNavigationState: navigationUtils.getNavigationState,
    generateBreadcrumb: navigationUtils.generateBreadcrumb,
  };
};
