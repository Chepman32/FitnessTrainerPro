import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
  StatusBar,
  Pressable,
} from 'react-native';
import { LibrarySection, Content } from '../types/library';
import { useLibrary } from '../state/LibraryContext';
import { useUserProgress } from '../state/UserProgressContext';
import { SearchBar } from '../components/library/SearchBar';
import { FilterBar } from '../components/library/FilterBar';
import { OfflineBanner } from '../components/library/OfflineBanner';
import {
  ContentShelf,
  ContentShelfSkeleton,
} from '../components/library/ContentShelf';

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
          progress => {
            // Create a basic content item with required fields based on type
            const baseContent = {
              id: progress.entityId,
              type: progress.entityType,
              title: `Continue ${progress.entityType}`,
              premium: false,
              tags: [],
              createdAt: progress.lastAccessedAt,
              updatedAt: progress.lastAccessedAt,
            };

            // Add type-specific properties
            switch (progress.entityType) {
              case 'workout':
                return {
                  ...baseContent,
                  type: 'workout' as const,
                  durationMinutes: 15,
                  level: 'Intermediate' as const,
                  equipment: ['none'],
                  locations: ['home'],
                  goals: ['cardio'],
                  exercises: [],
                  estimatedCalories: 100,
                };
              case 'program':
                return {
                  ...baseContent,
                  type: 'program' as const,
                  weeks: 4,
                  sessionsPerWeek: 3,
                  level: 'Intermediate' as const,
                  equipment: ['none'],
                  locations: ['home'],
                  goals: ['strength'],
                  totalWorkouts: 12,
                  estimatedCalories: 200,
                };
              case 'article':
                return {
                  ...baseContent,
                  type: 'article' as const,
                  readTimeMinutes: 5,
                  topic: 'Fitness',
                  publishedAt: progress.lastAccessedAt,
                  excerpt: 'Continue reading this article...',
                  author: 'Author',
                };
              case 'challenge':
                return {
                  ...baseContent,
                  type: 'challenge' as const,
                  durationDays: 7,
                  metricType: 'reps' as const,
                  participantsCount: 100,
                  friendsCount: 0,
                  joined: true,
                };
              default:
                return {
                  ...baseContent,
                  type: 'workout' as const,
                  durationMinutes: 15,
                  level: 'Intermediate' as const,
                  equipment: ['none'],
                  locations: ['home'],
                  goals: ['cardio'],
                  exercises: [],
                  estimatedCalories: 100,
                };
            }
          }
        );

        return {
          ...section,
          items: continueContent,
        };
      }
      return section;
    });
  }, [sections, progressState.userProgress]);

  // Render section item
  const renderSection = useCallback(
    ({ item: section }: { item: LibrarySection }) => (
      <ContentShelf
        key={section.id}
        section={section}
        onContentPress={handleContentPress}
        onSeeAllPress={handleSeeAllPress}
      />
    ),
    [handleContentPress, handleSeeAllPress],
  );

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

  // Render header components
  const renderHeader = () => (
    <View>
      <OfflineBanner />
      <SearchBar />
      <FilterBar />
    </View>
  );

  const backgroundColor = isDark ? '#000000' : '#FFFFFF';
  const statusBarStyle = isDark ? 'light-content' : 'dark-content';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColor} />

      {isInitialLoad ? (
        <View style={styles.content}>
          {renderHeader()}
          {renderLoadingSkeleton()}
        </View>
      ) : (
        <FlatList
          data={sectionsWithContinue}
          keyExtractor={item => item.id}
          renderItem={renderSection}
          ListHeaderComponent={renderHeader}
          refreshControl={
            <RefreshControl
              refreshing={isLoading && !isInitialLoad}
              onRefresh={handleRefresh}
              tintColor={isDark ? '#5B9BFF' : '#5B9BFF'}
              colors={['#5B9BFF']}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          removeClippedSubviews={true}
          maxToRenderPerBatch={3}
          windowSize={5}
          initialNumToRender={3}
          getItemLayout={(data, index) => ({
            length: 300, // Approximate height of each section
            offset: 300 * index,
            index,
          })}
        />
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
      style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}
    >
      <View style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <Text
            style={[styles.errorTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}
          >
            Something went wrong
          </Text>
          <Text
            style={[styles.errorMessage, { color: isDark ? '#AAAAAA' : '#666666' }]}
          >
            We're having trouble loading the library. Please try again.
          </Text>
          {__DEV__ && error && (
            <Text
              style={[styles.errorDetails, { color: isDark ? '#666666' : '#999999' }]}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 32,
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
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorDetails: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'monospace',
    marginTop: 8,
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
});
