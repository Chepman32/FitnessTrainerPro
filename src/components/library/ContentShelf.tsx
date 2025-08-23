import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LibrarySection, Content } from '../../types/library';
import { ContentCard } from './ContentCard';

type ContentShelfProps = {
  section: LibrarySection;
  onContentPress?: (content: Content) => void;
  onContinuePress?: (content: Content) => void;
  onSeeAllPress?: (section: LibrarySection) => void;
  onLoadMore?: (sectionId: string) => void;
  loading?: boolean;
  error?: string | null;
};

export const ContentShelf: React.FC<ContentShelfProps> = ({
  section,
  onContentPress,
  onContinuePress,
  onSeeAllPress,
  onLoadMore,
  loading = false,
  error = null,
}) => {
  const isDark = useColorScheme() === 'dark';
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleLoadMore = useCallback(async () => {
    if (!section.hasMore || isLoadingMore || !onLoadMore) return;

    setIsLoadingMore(true);
    try {
      await onLoadMore(section.id);
    } finally {
      setIsLoadingMore(false);
    }
  }, [section.hasMore, section.id, isLoadingMore, onLoadMore]);

  const handleRetry = useCallback(() => {
    if (onLoadMore) {
      onLoadMore(section.id);
    }
  }, [section.id, onLoadMore]);

  // Don't render empty sections unless they're loading
  if (!loading && !error && section.items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.titleDark]}>
          {section.title}
        </Text>

        {section.items.length > 0 && (
          <Pressable
            style={styles.seeAllButton}
            onPress={() => onSeeAllPress?.(section)}
            accessibilityRole="button"
            accessibilityLabel={`See all ${section.title}`}
          >
            <Text style={styles.seeAllText}>See all</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color="#5B9BFF"
              style={styles.seeAllIcon}
            />
          </Pressable>
        )}
      </View>

      {/* Content */}
      {error ? (
        <ErrorState error={error} onRetry={handleRetry} isDark={isDark} />
      ) : loading && section.items.length === 0 ? (
        <LoadingState isDark={isDark} />
      ) : (
        <ContentList
          section={section}
          onContentPress={onContentPress}
          onContinuePress={onContinuePress}
          onLoadMore={handleLoadMore}
          isLoadingMore={isLoadingMore}
          isDark={isDark}
        />
      )}
    </View>
  );
};

// Content List Component
const ContentList: React.FC<{
  section: LibrarySection;
  onContentPress?: (content: Content) => void;
  onContinuePress?: (content: Content) => void;
  onLoadMore: () => void;
  isLoadingMore: boolean;
  isDark: boolean;
}> = ({
  section,
  onContentPress,
  onContinuePress,
  onLoadMore,
  isLoadingMore,
  isDark,
}) => {
  const handleScroll = useCallback(
    (event: any) => {
      const { contentOffset, contentSize, layoutMeasurement } =
        event.nativeEvent;
      const isNearEnd =
        contentOffset.x + layoutMeasurement.width >= contentSize.width - 100;

      if (isNearEnd && section.hasMore && !isLoadingMore) {
        onLoadMore();
      }
    },
    [section.hasMore, isLoadingMore, onLoadMore],
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      {section.items.map((content, index) => (
        <ContentCard
          key={`${content.id}_${index}`}
          content={content}
          onPress={onContentPress}
          onContinue={onContinuePress}
          style={
            index === section.items.length - 1 ? styles.lastCard : undefined
          }
        />
      ))}

      {/* Load More Indicator */}
      {section.hasMore && (
        <View style={styles.loadMoreContainer}>
          {isLoadingMore ? (
            <ActivityIndicator size="small" color="#5B9BFF" />
          ) : (
            <Pressable
              style={[
                styles.loadMoreButton,
                isDark && styles.loadMoreButtonDark,
              ]}
              onPress={onLoadMore}
              accessibilityRole="button"
              accessibilityLabel="Load more content"
            >
              <Ionicons name="add" size={24} color="#5B9BFF" />
              <Text style={styles.loadMoreText}>More</Text>
            </Pressable>
          )}
        </View>
      )}
    </ScrollView>
  );
};

// Loading State Component
const LoadingState: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.scrollContent}
  >
    {Array.from({ length: 3 }).map((_, index) => (
      <SkeletonCard key={index} isDark={isDark} />
    ))}
  </ScrollView>
);

// Skeleton Card Component
const SkeletonCard: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <View
    style={[
      styles.skeletonCard,
      isDark ? styles.skeletonCardDark : styles.skeletonCardLight,
    ]}
  >
    <View
      style={[
        styles.skeletonImage,
        isDark ? styles.skeletonDark : styles.skeletonLight,
      ]}
    />
    <View style={styles.skeletonContent}>
      <View
        style={[
          styles.skeletonTitle,
          isDark ? styles.skeletonDark : styles.skeletonLight,
        ]}
      />
      <View
        style={[
          styles.skeletonSubtitle,
          isDark ? styles.skeletonDark : styles.skeletonLight,
        ]}
      />
      <View
        style={[
          styles.skeletonButton,
          isDark ? styles.skeletonDark : styles.skeletonLight,
        ]}
      />
    </View>
  </View>
);

// Error State Component
const ErrorState: React.FC<{
  error: string;
  onRetry: () => void;
  isDark: boolean;
}> = ({ error, onRetry, isDark }) => (
  <View style={styles.errorContainer}>
    <Ionicons
      name="alert-circle-outline"
      size={32}
      color={isDark ? '#FF6B6B' : '#FF4444'}
      style={styles.errorIcon}
    />
    <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
      {error}
    </Text>
    <Pressable
      style={[styles.retryButton, isDark && styles.retryButtonDark]}
      onPress={onRetry}
      accessibilityRole="button"
      accessibilityLabel="Retry loading content"
    >
      <Text style={styles.retryButtonText}>Retry</Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
  },
  titleDark: {
    color: '#FFFFFF',
  },

  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5B9BFF',
  },
  seeAllIcon: {
    marginLeft: 4,
  },

  scrollContent: {
    paddingLeft: 16,
  },

  lastCard: {
    marginRight: 16,
  },

  loadMoreContainer: {
    width: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  loadMoreButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F8FF',
    borderWidth: 2,
    borderColor: '#5B9BFF',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadMoreButtonDark: {
    backgroundColor: '#1A2332',
  },
  loadMoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5B9BFF',
    marginTop: 4,
  },

  // Skeleton styles
  skeletonCard: {
    width: 280,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
  },
  skeletonCardLight: {
    backgroundColor: '#FFFFFF',
  },
  skeletonCardDark: {
    backgroundColor: '#1A1A1A',
  },
  skeletonImage: {
    height: 160,
    borderRadius: 16,
  },
  skeletonContent: {
    padding: 16,
  },
  skeletonTitle: {
    height: 20,
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonSubtitle: {
    height: 16,
    borderRadius: 4,
    width: '70%',
    marginBottom: 16,
  },
  skeletonButton: {
    height: 40,
    borderRadius: 8,
  },
  skeletonLight: {
    backgroundColor: '#E5E5E5',
  },
  skeletonDark: {
    backgroundColor: '#333333',
  },

  // Error styles
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  errorIcon: {
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorTextDark: {
    color: '#CCCCCC',
  },
  retryButton: {
    backgroundColor: '#5B9BFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonDark: {
    backgroundColor: '#4A8AE8',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

// ContentShelfSkeleton component for loading states
type ContentShelfSkeletonProps = {
  title: string;
};

export const ContentShelfSkeleton: React.FC<ContentShelfSkeletonProps> = ({ title }) => {
  const isDark = useColorScheme() === 'dark';
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          {title}
        </Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Skeleton content cards */}
        {[1, 2, 3].map((index) => (
          <View key={index} style={skeletonStyles.skeletonCard}>
            <View style={[skeletonStyles.skeletonImage, { backgroundColor: isDark ? '#333' : '#E5E5E5' }]} />
            <View style={skeletonStyles.skeletonContent}>
              <View style={[skeletonStyles.skeletonTitle, { backgroundColor: isDark ? '#444' : '#D0D0D0' }]} />
              <View style={[skeletonStyles.skeletonSubtitle, { backgroundColor: isDark ? '#555' : '#E0E0E0' }]} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const skeletonStyles = StyleSheet.create({
  skeletonCard: {
    width: 280,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  skeletonImage: {
    width: '100%',
    height: 160,
  },
  skeletonContent: {
    padding: 16,
  },
  skeletonTitle: {
    height: 20,
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonSubtitle: {
    height: 16,
    borderRadius: 4,
    width: '70%',
  },
});
