import React, { memo, useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  ViewToken,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LibrarySection, Content } from '../../types/library';
import { OptimizedContentCard } from './OptimizedContentCard';
import {
  useOptimizedFlatListProps,
  useThrottle,
  usePerformanceMonitor,
} from '../../utils/performance';

type OptimizedContentShelfProps = {
  section: LibrarySection;
  onContentPress?: (content: Content) => void;
  onSeeAllPress?: (section: LibrarySection) => void;
  onLoadMore?: (sectionId: string) => void;
  index?: number;
};

export const OptimizedContentShelf = memo<OptimizedContentShelfProps>(
  ({ section, onContentPress, onSeeAllPress, onLoadMore, index = 0 }) => {
    const isDark = useColorScheme() === 'dark';
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());

    const { measureRender } = usePerformanceMonitor(
      `ContentShelf-${section.id}-${index}`,
    );
    const flatListProps = useOptimizedFlatListProps(section.items.length);

    // Throttled load more to prevent excessive API calls
    const throttledLoadMore = useThrottle(
      useCallback(async () => {
        if (!section.hasMore || isLoadingMore || !onLoadMore) return;

        setIsLoadingMore(true);
        try {
          await onLoadMore(section.id);
        } finally {
          setIsLoadingMore(false);
        }
      }, [section.hasMore, section.id, isLoadingMore, onLoadMore]),
      1000, // 1 second throttle
    );

    // Memoized handlers
    const handleContentPress = useCallback(
      (content: Content) => {
        onContentPress?.(content);
      },
      [onContentPress],
    );

    const handleSeeAllPress = useCallback(() => {
      onSeeAllPress?.(section);
    }, [onSeeAllPress, section]);

    // Optimized viewability config
    const viewabilityConfig = useMemo(
      () => ({
        itemVisiblePercentThreshold: 50,
        minimumViewTime: 100,
      }),
      [],
    );

    // Track visible items for lazy loading optimization
    const handleViewableItemsChanged = useCallback(
      ({ viewableItems }: { viewableItems: ViewToken[] }) => {
        const newVisibleItems = new Set(
          viewableItems.map(item => item.item.id),
        );
        setVisibleItems(newVisibleItems);
      },
      [],
    );

    // Memoized render item with visibility optimization
    const renderItem = useCallback(
      ({ item, index: itemIndex }: { item: Content; index: number }) => {
        const isVisible = visibleItems.has(item.id) || itemIndex < 3; // Always render first 3 items

        return (
          <OptimizedContentCard
            content={item}
            onPress={handleContentPress}
            index={itemIndex}
            isVisible={isVisible}
            style={
              itemIndex === section.items.length - 1
                ? styles.lastCard
                : undefined
            }
          />
        );
      },
      [handleContentPress, section.items.length, visibleItems],
    );

    // Memoized key extractor
    const keyExtractor = useCallback(
      (item: Content, itemIndex: number) => `${item.id}-${itemIndex}`,
      [],
    );

    // Optimized get item layout
    const getItemLayout = useCallback(
      (data: any, itemIndex: number) => ({
        length: 296, // Card width (280) + margin (16)
        offset: 296 * itemIndex,
        index: itemIndex,
      }),
      [],
    );

    // Handle end reached with throttling
    const handleEndReached = useCallback(() => {
      if (section.hasMore && !isLoadingMore) {
        throttledLoadMore();
      }
    }, [section.hasMore, isLoadingMore, throttledLoadMore]);

    // Memoized styles
    const containerStyle = useMemo(
      () => [styles.container, { backgroundColor: isDark ? '#000' : '#FFF' }],
      [isDark],
    );

    const titleStyle = useMemo(
      () => [styles.title, { color: isDark ? '#FFF' : '#000' }],
      [isDark],
    );

    // Don't render empty sections (except Continue)
    if (section.items.length === 0 && section.type !== 'continue') {
      return null;
    }

    // Special handling for empty Continue section
    if (section.type === 'continue' && section.items.length === 0) {
      return (
        <View style={containerStyle}>
          <View style={styles.header}>
            <Text style={titleStyle}>{section.title}</Text>
          </View>
          <View style={styles.emptyContinueContainer}>
            <Ionicons
              name="play-circle-outline"
              size={48}
              color={isDark ? '#666' : '#CCC'}
            />
            <Text
              style={[
                styles.emptyContinueText,
                { color: isDark ? '#666' : '#999' },
              ]}
            >
              Start a program or challenge to see your progress here
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={containerStyle}>
        {/* Optimized Header */}
        <View style={styles.header}>
          <Text style={titleStyle}>{section.title}</Text>

          {section.items.length > 3 && (
            <Pressable
              style={styles.seeAllButton}
              onPress={handleSeeAllPress}
              accessibilityRole="button"
              accessibilityLabel={`See all ${section.title.toLowerCase()}`}
            >
              <Text style={styles.seeAllText}>See all</Text>
              <Ionicons name="chevron-forward" size={16} color="#5B9BFF" />
            </Pressable>
          )}
        </View>

        {/* Optimized Content List */}
        <FlatList
          data={section.items}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.8}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={getItemLayout}
          {...flatListProps}
          // Performance optimizations
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          windowSize={3}
          initialNumToRender={3}
          updateCellsBatchingPeriod={50}
          // Disable scroll during loading to prevent janky animations
          scrollEnabled={!isLoadingMore}
          // Memory optimization
          disableVirtualization={false}
        />

        {/* Loading More Indicator */}
        {isLoadingMore && (
          <View style={styles.loadingMoreContainer}>
            <ActivityIndicator size="small" color="#5B9BFF" />
            <Text
              style={[
                styles.loadingMoreText,
                { color: isDark ? '#AAA' : '#666' },
              ]}
            >
              Loading more...
            </Text>
          </View>
        )}
      </View>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for memo optimization
    return (
      prevProps.section.id === nextProps.section.id &&
      prevProps.section.items.length === nextProps.section.items.length &&
      prevProps.section.hasMore === nextProps.section.hasMore &&
      prevProps.index === nextProps.index &&
      // Deep compare first few items (most likely to change)
      JSON.stringify(prevProps.section.items.slice(0, 3)) ===
        JSON.stringify(nextProps.section.items.slice(0, 3))
    );
  },
);

OptimizedContentShelf.displayName = 'OptimizedContentShelf';

// Skeleton component for loading states
export const ContentShelfSkeleton = memo<{ title?: string }>(({ title }) => {
  const isDark = useColorScheme() === 'dark';

  const skeletonCards = useMemo(
    () =>
      Array.from({ length: 3 }, (_, index) => (
        <View
          key={index}
          style={[
            styles.skeletonCard,
            { backgroundColor: isDark ? '#1A1A1A' : '#F9FAFB' },
            index === 2 ? styles.lastCard : undefined,
          ]}
        >
          <View
            style={[
              styles.skeletonImage,
              { backgroundColor: isDark ? '#333' : '#E5E7EB' },
            ]}
          />
          <View style={styles.skeletonContent}>
            <View
              style={[
                styles.skeletonLine,
                { backgroundColor: isDark ? '#333' : '#E5E7EB' },
              ]}
            />
            <View
              style={[
                styles.skeletonLineShort,
                { backgroundColor: isDark ? '#333' : '#E5E7EB' },
              ]}
            />
          </View>
        </View>
      )),
    [isDark],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {title ? (
          <Text style={[styles.title, { color: isDark ? '#FFF' : '#000' }]}>
            {title}
          </Text>
        ) : (
          <View
            style={[
              styles.skeletonTitle,
              { backgroundColor: isDark ? '#333' : '#E5E7EB' },
            ]}
          />
        )}
      </View>

      <View style={styles.scrollContent}>{skeletonCards}</View>
    </View>
  );
});

ContentShelfSkeleton.displayName = 'ContentShelfSkeleton';

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
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5B9BFF',
  },
  scrollContent: {
    paddingLeft: 16,
  },
  lastCard: {
    marginRight: 16,
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContinueContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
    gap: 12,
  },
  emptyContinueText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Skeleton styles
  skeletonTitle: {
    width: 120,
    height: 24,
    borderRadius: 4,
  },
  skeletonCard: {
    width: 280,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
  },
  skeletonImage: {
    width: '100%',
    height: 160,
  },
  skeletonContent: {
    padding: 16,
    gap: 8,
  },
  skeletonLine: {
    height: 16,
    borderRadius: 4,
  },
  skeletonLineShort: {
    height: 14,
    width: '60%',
    borderRadius: 4,
  },
});
