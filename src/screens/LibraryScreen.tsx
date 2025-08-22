import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  RefreshControl,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
  StatusBar,
  Pressable,
  ImageBackground,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LibrarySection, Content } from '../types/library';
import { useLibrary } from '../state/LibraryContext';
import { useUserProgress } from '../state/UserProgressContext';
import { SearchBar } from '../components/library/SearchBar';
import { OfflineBanner } from '../components/library/OfflineBanner';
import { ContentShelfSkeleton } from '../components/library/OptimizedContentShelf';

type LibraryScreenProps = {
  onContentPress?: (content: Content) => void;
  onSeeAllPress?: (section: LibrarySection) => void;
};

export const LibraryScreen: React.FC<LibraryScreenProps> = ({
  onContentPress,
  onSeeAllPress,
}) => {
  const isDark = useColorScheme() === 'dark';
  const { state: libraryState, actions: libraryActions } = useLibrary();
  const { state: progressState } = useUserProgress();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [activeFilters, setActiveFilters] = useState<string[]>(['At Home']);

  const { sections, isLoading } = libraryState;

  // Initial load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await libraryActions.refreshLibrary();
      } finally {
        setIsInitialLoad(false);
      }
    };

    loadInitialData();
  }, [libraryActions]);

  // Handle pull to refresh
  const handleRefresh = useCallback(async () => {
    await libraryActions.refreshLibrary();
  }, [libraryActions]);

  // Handle content press
  const handleContentPress = useCallback(
    (content: Content) => {
      onContentPress?.(content);
    },
    [onContentPress],
  );

  // Handle see all press
  const handleSeeAllPress = useCallback(
    (section: LibrarySection) => {
      onSeeAllPress?.(section);
    },
    [onSeeAllPress],
  );

  // Prepare sections with continue items
  const sectionsWithContinue = React.useMemo(() => {
    if (!sections.length) return [];

    return sections.map(section => {
      if (section.type === 'continue') {
        // Get continue items from progress state
        const continueItems = progressState.userProgress
          ? Object.values(progressState.userProgress)
              .filter(
                progress =>
                  progress.progressPercent > 0 &&
                  progress.progressPercent < 100 &&
                  !progress.completedAt,
              )
              .sort(
                (a, b) =>
                  new Date(b.lastAccessedAt).getTime() -
                  new Date(a.lastAccessedAt).getTime(),
              )
              .slice(0, 10)
          : [];

        // Convert progress items to content items (simplified for now)
        const continueContent: Content[] = continueItems.map(
          progress =>
            ({
              id: progress.entityId,
              type: progress.entityType,
              title: `Continue ${progress.entityType}`,
              premium: false,
              tags: [],
              createdAt: progress.lastAccessedAt,
              updatedAt: progress.lastAccessedAt,
              // Add type-specific properties as needed
              ...(progress.entityType === 'workout' && {
                durationMinutes: 30,
                level: 'Intermediate',
                equipment: ['none'],
                locations: ['home'],
                goals: ['strength'],
                exercises: [],
                estimatedCalories: 200,
              }),
              ...(progress.entityType === 'program' && {
                weeks: 4,
                sessionsPerWeek: 3,
                level: 'Intermediate',
                equipment: ['none'],
                locations: ['home'],
                goals: ['strength'],
                totalWorkouts: 12,
                estimatedCalories: 200,
              }),
              ...(progress.entityType === 'challenge' && {
                durationDays: 30,
                metricType: 'reps' as const,
                participantsCount: 100,
                friendsCount: 3,
                joined: true,
              }),
              ...(progress.entityType === 'article' && {
                readTimeMinutes: 5,
                topic: 'Fitness',
                publishedAt: progress.lastAccessedAt,
                excerpt: 'Continue reading this article',
                author: 'Fitness Expert',
              }),
            } as Content),
        );

        return {
          ...section,
          items: continueContent,
        };
      }
      return section;
    });
  }, [sections, progressState.userProgress]);



  // Render loading skeleton
  const renderLoadingSkeleton = () => (
    <View>
      <ContentShelfSkeleton title="Continue" />
      <ContentShelfSkeleton title="Recommended for you" />
      <ContentShelfSkeleton title="Quick Start" />
      <ContentShelfSkeleton title="Programs" />
      <ContentShelfSkeleton title="Challenges" />
    </View>
  );

  // Render hero section
  const renderHeroSection = () => {
    const heroData = [
      {
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        title: 'Transform Your Body',
        subtitle: 'Start your fitness journey today'
      },
      {
        image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        title: 'Build Strength',
        subtitle: 'Comprehensive workout programs'
      },
      {
        image: 'https://images.unsplash.com/photo-1506629905607-4b6a9d09e174?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        title: 'Outdoor Adventures',
        subtitle: 'Nature-based fitness activities'
      }
    ];

    return (
      <View key="hero-section" style={styles.heroContainer}>
        <ScrollView 
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          style={styles.heroScrollView}
        >
          {heroData.map((item, index) => (
            <ImageBackground
              key={`hero-${index}-${item.title.replace(/\s+/g, '-')}`}
              source={{ uri: item.image }}
              style={styles.heroImage}
              imageStyle={styles.heroImageStyle}
            >
              <View style={styles.heroOverlay} />
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>{item.title}</Text>
                <Text style={styles.heroSubtitle}>{item.subtitle}</Text>
              </View>
            </ImageBackground>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Filter options
  const filterOptions = [
    'At Home',
    'No Equipment', 
    'Under 30 min',
    'Beginner Friendly',
    'Quick Start',
    'HIIT & Cardio',
    'Strength',
    'Yoga',
    'Premium',
    'Free',
    'Challenges'
  ];

  // Handle filter toggle
  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => {
      if (prev.includes(filter)) {
        return prev.filter(f => f !== filter);
      } else {
        return [...prev, filter];
      }
    });
  };

  // Filter content based on active filters
  const filterContent = (items: Content[]) => {
    if (activeFilters.length === 0) return items;
    
    const filteredItems = items.filter(item => {
      return activeFilters.some(filter => {
        switch (filter) {
          case 'At Home':
            return (item as any).locations?.includes('home') || 
                   item.tags?.includes('home') ||
                   item.tags?.includes('at-home') ||
                   !(item as any).locations?.includes('gym');
          case 'No Equipment':
            return (item as any).equipment?.includes('none') || 
                   item.tags?.includes('bodyweight') ||
                   item.tags?.includes('no-equipment') ||
                   item.tags?.includes('none');
          case 'Under 30 min':
            const duration = (item as any).durationMinutes || (item as any).readTimeMinutes || 0;
            return duration <= 30 && duration > 0;
          case 'Beginner Friendly':
            return (item as any).level === 'Beginner' ||
                   item.tags?.includes('beginner');
          case 'Quick Start':
            return item.tags?.includes('quick') ||
                   ((item as any).durationMinutes && (item as any).durationMinutes <= 15);
          case 'HIIT & Cardio':
            return item.tags?.includes('hiit') ||
                   item.tags?.includes('cardio') ||
                   item.tags?.includes('fat-loss') ||
                   (item as any).goals?.includes('cardio') ||
                   (item as any).goals?.includes('fat_loss');
          case 'Strength':
            return item.tags?.includes('strength') ||
                   item.tags?.includes('muscle') ||
                   (item as any).goals?.includes('strength') ||
                   (item as any).goals?.includes('muscle');
          case 'Yoga':
            return item.tags?.includes('yoga') ||
                   item.title.toLowerCase().includes('yoga') ||
                   item.tags?.includes('flexibility') ||
                   item.tags?.includes('mindfulness');
          case 'Premium':
            return item.premium === true;
          case 'Free':
            return item.premium === false || item.premium === undefined;
          case 'Challenges':
            return item.type === 'challenge';
          default:
            return true;
        }
      });
    });
    
    return filteredItems;
  };

  // Render search section
  const renderSearchSection = () => (
    <View key="search-section" style={styles.searchContainer}>
      <SearchBar />
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollContainer}
        contentContainerStyle={styles.filterChipsContainer}
      >
        {filterOptions.map((filter) => (
          <Pressable 
            key={filter}
            style={[
              styles.filterChip, 
              activeFilters.includes(filter) && styles.filterChipActive
            ]}
            onPress={() => toggleFilter(filter)}
          >
            <Text style={[
              styles.filterChipText,
              activeFilters.includes(filter) && styles.filterChipTextActive
            ]}>
              {filter}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  // Render recommended section with custom layout
  const renderRecommendedSection = () => {
    const recommendedItems = sectionsWithContinue.find(s => s.type === 'recommended')?.items || [];
    const filteredRecommendedItems = filterContent(recommendedItems);
    
    if (filteredRecommendedItems.length === 0) return null;
    
    return (
      <View key="recommended-section" style={styles.recommendedContainer}>
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
          Recommended For You
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recommendedScroll}>
          {filteredRecommendedItems.slice(0, 3).map((item, index) => (
            <Pressable 
              key={`recommended-${item.id}-${index}`} 
              style={[styles.recommendedCard, index === 0 && styles.recommendedCardFirst]}
              onPress={() => handleContentPress(item)}
            >
              <ImageBackground
                source={{ uri: getItemImage(item, index) }}
                style={styles.recommendedCardImage}
                imageStyle={styles.recommendedCardImageStyle}
              >
                <View style={styles.recommendedCardOverlay} />
                <View style={styles.recommendedCardContent}>
                  <Text style={styles.recommendedCardTitle}>{getItemTitle(item, index)}</Text>
                  <Text style={styles.recommendedCardSubtitle}>{getItemSubtitle(item, index)}</Text>
                </View>
              </ImageBackground>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Render challenges section with custom layout
  const renderChallengesSection = () => {
    const challengeItems = sectionsWithContinue.find(s => s.type === 'challenges')?.items || [];
    const filteredChallengeItems = filterContent(challengeItems);
    
    if (filteredChallengeItems.length === 0) return null;
    
    return (
      <View key="challenges-section" style={styles.challengesContainer}>
        <View style={styles.challengesHeader}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Challenges with Friends
          </Text>
          <Pressable onPress={() => handleSeeAllPress(sectionsWithContinue.find(s => s.type === 'challenges')!)}>
            <Text style={styles.seeAllText}>See All</Text>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.challengesScroll}>
          {filteredChallengeItems.slice(0, 2).map((item, index) => (
            <Pressable 
              key={`challenges-${item.id}-${index}`} 
              style={styles.challengeCard}
              onPress={() => handleContentPress(item)}
            >
              <ImageBackground
                source={{ uri: getChallengeImage(item, index) }}
                style={styles.challengeCardImage}
                imageStyle={styles.challengeCardImageStyle}
              >
                <View style={styles.challengeCardOverlay} />
                <View style={styles.challengeCardContent}>
                  <Text style={styles.challengeCardTitle}>{item.title}</Text>
                  <Text style={styles.challengeCardParticipants}>
                    {(item as any).participantsCount || 23} participants
                  </Text>
                </View>
              </ImageBackground>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Helper functions for image URLs and content
  const getItemImage = (item: Content, index: number) => {
    const images = [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1550345332-09e3ac987658?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506629905607-4b6a9d09e174?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ];
    return images[index] || images[0];
  };

  const getItemTitle = (item: Content, index: number) => {
    const titles = ['Strength', 'HIIT', 'Outdoor Running'];
    return titles[index] || item.title;
  };

  const getItemSubtitle = (item: Content, index: number) => {
    const subtitles = ['6 Weeks', '20 min', '45 min'];
    return subtitles[index] || '30 min';
  };

  const getChallengeImage = (_item: Content, index: number) => {
    const images = [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ];
    return images[index] || images[0];
  };

  // Render all sections dynamically
  const renderAllSections = () => {
    return sectionsWithContinue.map((section) => {
      // Apply filters to section items
      const filteredItems = filterContent(section.items || []);
      
      // Skip empty sections after filtering
      if (!filteredItems || filteredItems.length === 0) {
        return null;
      }

      // Special rendering for specific sections
      if (section.type === 'recommended') {
        return renderRecommendedSection();
      }

      if (section.type === 'challenges') {
        return renderChallengesSection();
      }

      // Default rendering for other sections using ContentShelf
      return (
        <View key={section.id} style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
              {section.title}
            </Text>
            {section.hasMore && (
              <Pressable onPress={() => handleSeeAllPress(section)}>
                <Text style={styles.seeAllText}>See All</Text>
              </Pressable>
            )}
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.sectionScroll}
          >
            {filteredItems.map((item, index) => (
              <Pressable 
                key={`${section.id}-${item.id}-${index}`} 
                style={[styles.contentCard, index === filteredItems.length - 1 && styles.lastCard]}
                onPress={() => handleContentPress(item)}
              >
                <ImageBackground
                  source={{ uri: getContentImage(item, index) }}
                  style={styles.contentCardImage}
                  imageStyle={styles.contentCardImageStyle}
                >
                  <View style={styles.contentCardOverlay} />
                  {/* Complex Training Program Badge */}
                  {item.type === 'program' && (item as any).complexProgram && (
                    <View style={styles.complexProgramBadge}>
                      <Text style={styles.complexProgramBadgeText}>⏱️ TIMED</Text>
                    </View>
                  )}
                  <View style={styles.contentCardContent}>
                    <Text style={styles.contentCardTitle}>{item.title}</Text>
                    <Text style={styles.contentCardSubtitle}>
                      {getContentSubtitle(item)}
                    </Text>
                  </View>
                </ImageBackground>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      );
    });
  };

  // Helper function to get content image with better variety
  const getContentImage = (item: Content, _index: number) => {
    // Always prefer the item's own cover URL if available
    if (item.coverUrl) return item.coverUrl;
    
    // Create a unique image based on content type and ID
    const imagesByType = {
      workout: [
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // gym workout
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // HIIT
        'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // core
        'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // full body
        'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // stretching
        'https://images.unsplash.com/photo-1540353340855-ce32ea0e4e32?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // kettlebell
        'https://images.unsplash.com/photo-1596357395217-80de13130e92?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // glutes
        'https://images.unsplash.com/photo-1506477331477-33d5d8b3dc85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // office
      ],
      program: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // strength training
        'https://images.unsplash.com/photo-1574680096145-d05b474e2155?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // fat loss
        'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // mobility
        'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // running
        'https://images.unsplash.com/photo-1550345332-09e3ac987658?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // cardio
      ],
      challenge: [
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // plank
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // walking
        'https://images.unsplash.com/photo-1567013127542-490d757e51cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // push-ups
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // yoga
      ],
      article: [
        'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // nutrition
        'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // sleep
        'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // science
      ],
    };
    
    const typeImages = imagesByType[item.type] || imagesByType.workout;
    
    // Use a hash of the item ID to ensure consistent but distributed image selection
    const hash = item.id.split('').reduce((a, b) => { 
      a = ((a * 31) + b.charCodeAt(0)) % 1000000; 
      return a; 
    }, 0);
    
    const imageIndex = Math.abs(hash) % typeImages.length;
    return typeImages[imageIndex];
  };

  // Helper function to get content subtitle based on type
  const getContentSubtitle = (item: Content) => {
    switch (item.type) {
      case 'workout':
        return `${(item as any).durationMinutes || 20} min`;
      case 'program':
        return `${(item as any).weeks || 4} weeks`;
      case 'challenge':
        return `${(item as any).participantsCount || 100} participants`;
      case 'article':
        return `${(item as any).readTimeMinutes || 5} min read`;
      default:
        return '';
    }
  };

  const backgroundColor = isDark ? '#1A1A1A' : '#000000';
  const statusBarStyle = 'light-content';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColor} />

      {isInitialLoad ? (
        <ScrollView style={styles.content}>
          {renderHeroSection()}
          {renderSearchSection()}
          {renderLoadingSkeleton()}
        </ScrollView>
      ) : (
        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading && !isInitialLoad}
              onRefresh={handleRefresh}
              tintColor="#5B9BFF"
              colors={['#5B9BFF']}
            />
          }
        >
          <OfflineBanner />
          {renderHeroSection()}
          {renderSearchSection()}
          {renderAllSections()}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

// Error Boundary Component
export class LibraryErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  { hasError: boolean; error?: Error }
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LibraryScreen Error:', error, errorInfo);
    // In a real app, you would log this to your error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <LibraryErrorFallback
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false, error: undefined })}
        />
      );
    }

    return this.props.children;
  }
}

// Error Fallback Component
const LibraryErrorFallback: React.FC<{
  error?: Error;
  onRetry: () => void;
}> = ({ error, onRetry }) => {
  const isDark = useColorScheme() === 'dark';

  return (
    <SafeAreaView
      style={[styles.container, isDark ? styles.errorContainerDark : styles.errorContainerLight]}
    >
      <View style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <Text
            style={[styles.errorTitle, isDark ? styles.errorTitleDark : styles.errorTitleLight]}
          >
            Something went wrong
          </Text>
          <Text
            style={[styles.errorMessage, isDark ? styles.errorMessageDark : styles.errorMessageLight]}
          >
            We're having trouble loading the library. Please try again.
          </Text>
          {__DEV__ && error && (
            <Text
              style={[styles.errorDetails, isDark ? styles.errorDetailsDark : styles.errorDetailsLight]}
            >
              {error.message}
            </Text>
          )}
          <Pressable
            style={styles.retryButton}
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel="Retry loading library"
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 32,
  },

  // Hero section styles
  heroContainer: {
    height: 200,
    marginBottom: 0,
  },
  heroScrollView: {
    flex: 1,
  },
  heroImage: {
    width: screenWidth,
    height: 200,
    justifyContent: 'flex-end',
  },
  heroImageStyle: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Search section styles
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#000000',
  },
  filterScrollContainer: {
    marginTop: 16,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterChipActive: {
    backgroundColor: '#5B9BFF',
    borderColor: '#5B9BFF',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },

  // Section styles
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  sectionTitleDark: {
    color: '#FFFFFF',
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5B9BFF',
  },

  // Recommended section styles
  recommendedContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: '#000000',
  },
  recommendedScroll: {
    marginHorizontal: -16,
  },
  recommendedCard: {
    width: (screenWidth - 48) / 3,
    height: 180,
    marginLeft: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  recommendedCardFirst: {
    width: (screenWidth - 48) / 2.5,
    height: 220,
  },
  recommendedCardImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  recommendedCardImageStyle: {
    borderRadius: 16,
  },
  recommendedCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 16,
  },
  recommendedCardContent: {
    padding: 16,
  },
  recommendedCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  recommendedCardSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.8,
  },

  // Challenges section styles
  challengesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: '#000000',
  },
  challengesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  challengesScroll: {
    marginHorizontal: -16,
  },
  challengeCard: {
    width: (screenWidth - 48) / 2,
    height: 160,
    marginLeft: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  challengeCardImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  challengeCardImageStyle: {
    borderRadius: 16,
  },
  challengeCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 16,
  },
  challengeCardContent: {
    padding: 16,
  },
  challengeCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  challengeCardParticipants: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.8,
  },

  // General section styles
  sectionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: '#000000',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionScroll: {
    marginHorizontal: -16,
  },

  // Content card styles (for general sections)
  contentCard: {
    width: (screenWidth - 64) / 2.5,
    height: 160,
    marginLeft: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  contentCardImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  contentCardImageStyle: {
    borderRadius: 16,
  },
  contentCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 16,
  },
  contentCardContent: {
    padding: 12,
  },
  contentCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  contentCardSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  lastCard: {
    marginRight: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorContent: {
    alignItems: 'center',
    gap: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorTitleLight: {
    color: '#000000',
  },
  errorTitleDark: {
    color: '#FFFFFF',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorMessageLight: {
    color: '#666666',
  },
  errorMessageDark: {
    color: '#AAAAAA',
  },
  errorDetails: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'monospace',
    marginTop: 8,
  },
  errorDetailsLight: {
    color: '#999999',
  },
  errorDetailsDark: {
    color: '#666666',
  },
  errorContainerLight: {
    backgroundColor: '#FFFFFF',
  },
  errorContainerDark: {
    backgroundColor: '#000000',
  },
  retryButton: {
    backgroundColor: '#5B9BFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  complexProgramBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  complexProgramBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  }
});

// Note: Intentionally no default export to ensure consistent named import usage.

export default LibraryScreen;
