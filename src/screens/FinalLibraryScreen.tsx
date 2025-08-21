import React, { useEffect, useCallback, useState, useMemo } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
  StatusBar,
  InteractionManager,
  ViewToken,
} from 'react-native';
import { LibrarySection, Content } from '../types/library';
import { useLibrary } from '../state/LibraryContext';
import { useUserProgress } from '../state/UserProgressContext';
import { OptimizedSearchBar } from '../components/library/OptimizedSearchBar';
import { FilterBar } from '../components/library/FilterBar';
import { OfflineBanner } from '../components/library/OfflineBanner';
import {
  OptimizedContentShelf,
  ContentShelfSkeleton,
} from '../components/library/OptimizedContentShelf';
import {
  useOptimizedFlatListProps,
  useThrottle,
  usePerformanceMonitor,
  useBatchedUpdates,
  PerformanceUtils,
} from '../utils/performance';
import { useHaptics } from '../utils/haptics';
import { useAnimations, AnimationUtils } from '../utils/animations';
import { useScreenAnalytics, useLibraryABTests } from '../hooks/useAnalytics';

type FinalLibraryScreenProps = {
  onContentPress?: (content: Content) => void;
  onSeeAllPress?: (section: LibrarySection) => void;
};

export const FinalLibraryScreen: React.FC<FinalLibraryScreenProps> = ({
  onContentPress,
  onSeeAllPress,
}) => {
  const isDark = useColorScheme() === 'dark';
  const { state: libraryState, actions: libraryActions } = useLibrary();
  const { state: progressState } = useUserProgress();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(
    new Set(),
  );
  const [loadStartTime, setLoadStartTime] = useState<number>(0);

  const flatListRef = React.useRef<FlatList>(null);
  const { measureRender } = usePerformanceMonitor('FinalLibraryScreen');
  const batchUpdate = useBatchedUpdates();
  const haptics = useHaptics();
  const { configureLayoutAnimation } = useAnimations();

  // Analytics and A/B testing
  useScreenAnalytics('Library', {
    load_start_time: loadStartTime,
    is_initial_load: isInitialLoad,
  });
  const { getShelfOrder } = useLibraryABTests();

  const { sections, isLoading, error, searchQuery } = libraryState;
  const flatListProps = useOptimizedFlatListProps(sections.length);

  // Throttled refresh with haptic feedback
  const throttledRefresh = useThrottle(
    useCallback(async () => {
      haptics.pullRefresh();
      await libraryActions.refreshLibrary();
    }, [libraryActions, haptics]),
    2000,
  );

  // Enhanced initial load with performance tracking
  useEffect(() => {
    const loadInitialData = async () => {
      const startTime = performance.now();
      setLoadStartTime(startTime);

      try {
        // Configure smooth layout animations
        configureLayoutAnimation('easeInEaseOut');

        // Use InteractionManager for smooth loading
        InteractionManager.runAfterInteractions(async () => {
          await libraryActions.refreshLibrary();

          const endTime = performance.now();
          const loadTime = endTime - startTime;

          // Track load performance
          if (loadTime > 2000) {
            console.warn(
              `[Performance] Library load time exceeded 2s: ${loadTime}ms`,
            );
          }

          batchUpdate(() => {
            setIsInitialLoad(false);
          });
        });
      } catch (error) {
        console.error('Failed to load initial data:', error);
        haptics.errorState();
        setIsInitialLoad(false);
      }
    };

    loadInitialData();
  }, [libraryActions, batchUpdate, configureLayoutAnimation, haptics]);

  // Enhanced refresh handler
  const handleRefresh = useCallback(async () => {
    throttledRefresh();
  }, [throttledRefresh]);

  // Enhanced content press with haptics and navigation
  const handleContentPress = useCallback(
    (content: Content) => {
      haptics.cardTap();

      // Smooth navigation transition
      InteractionManager.runAfterInteractions(() => {
        onContentPress?.(content);
      });
    },
    [onContentPress, haptics],
  );

  // Enhanced see all press
  const handleSeeAllPress = useCallback(
    (section: LibrarySection) => {
      haptics.navigate();

      InteractionManager.runAfterInteractions(() => {
        onSeeAllPress?.(section);
      });
    },
    [onSeeAllPress, haptics],
  );

  // Enhanced load more with haptics
  const handleLoadMore = useCallback(
    async (sectionId: string) => {
      haptics.loadMore();
      await libraryActions.loadMoreSection(sectionId);
    },
    [libraryActions, haptics],
  );

  // Track visible sections for performance optimization
  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const newVisibleSections = new Set(
        viewableItems.map(item => item.item.id),
      );
      setVisibleSections(newVisibleSections);
    },
    [],
  );

  // Enhanced sections with A/B testing and continue items
  const enhancedSections = useMemo(() => {
    if (!sections.length) return [];

    // Apply A/B test for shelf ordering
    const orderedSections = getShelfOrder(sections);

    return orderedSections.map(section => {
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

        // Convert progress items to content items
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
            } as Content),
        );

        return {
          ...section,
          items: continueContent,
        };
      }
      return section;
    });
  }, [sections, progressState.userProgress, getShelfOrder]);

  // Enhanced section renderer with visibility optimization
  const renderSection = useCallback(
    ({ item: section, index }: { item: LibrarySection; index: number }) => {
      const isVisible = visibleSections.has(section.id) || index < 2;

      if (!isVisible && index > 5) {
        return <View style={{ height: 300 }} />;
      }

      return (
        <OptimizedContentShelf
          section={section}
          onContentPress={handleContentPress}
          onSeeAllPress={handleSeeAllPress}
          onLoadMore={handleLoadMore}
          index={index}
        />
      );
    },
    [visibleSections, handleContentPress, handleSeeAllPress, handleLoadMore],
  );

  // Memoized components and configurations
  const keyExtractor = useCallback((item: LibrarySection) => item.id, []);

  const getItemLayout = useCallback(
    (data: any, index: number) => ({
      length: 300,
      offset: 300 * index,
      index,
    }),
    [],
  );

  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 30,
      minimumViewTime: 100,
    }),
    [],
  );

  const renderLoadingSkeleton = useMemo(
    () => (
      <View>
        <ContentShelfSkeleton title="Continue" />
        <ContentShelfSkeleton title="Recommended for you" />
        <ContentShelfSkeleton title="Quick Start" />
        <ContentShelfSkeleton title="Programs" />
        <ContentShelfSkeleton title="Challenges" />
      </View>
    ),
    [],
  );

  const renderHeader = useMemo(
    () => (
      <View>
        <OfflineBanner />
        <OptimizedSearchBar />
        <FilterBar />
      </View>
    ),
    [],
  );

  // Enhanced styling
  const backgroundColor = isDark ? '#000000' : '#FFFFFF';
  const statusBarStyle = isDark ? 'light-content' : 'dark-content';

  const containerStyle = useMemo(
    () => [styles.container, { backgroundColor }],
    [backgroundColor],
  );

  const listContentStyle = useMemo(
    () => [styles.listContent, { paddingBottom: 32 }],
    [],
  );

  // Performance monitoring
  React.useEffect(() => {
    if (__DEV__) {
      PerformanceUtils.monitorMemoryUsage('FinalLibraryScreen');
    }
  }, [enhancedSections.length]);

  // Error handling with haptics
  React.useEffect(() => {
    if (error) {
      haptics.errorState();
    }
  }, [error, haptics]);

  return (
    <SafeAreaView style={containerStyle}>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={backgroundColor}
        animated={true}
      />

      {isInitialLoad ? (
        <View style={styles.content}>
          {renderHeader}
          {renderLoadingSkeleton}
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={enhancedSections}
          keyExtractor={keyExtractor}
          renderItem={renderSection}
          ListHeaderComponent={renderHeader}
          refreshControl={
            <RefreshControl
              refreshing={isLoading && !isInitialLoad}
              onRefresh={handleRefresh}
              tintColor={isDark ? '#5B9BFF' : '#5B9BFF'}
              colors={['#5B9BFF']}
              progressBackgroundColor={isDark ? '#1A1A1A' : '#FFFFFF'}
              title="Pull to refresh"
              titleColor={isDark ? '#AAA' : '#666'}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={listContentStyle}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={getItemLayout}
          // Enhanced performance optimizations
          {...flatListProps}
          removeClippedSubviews={true}
          maxToRenderPerBatch={PerformanceUtils.getOptimalBatchSize()}
          windowSize={PerformanceUtils.getOptimalWindowSize()}
          initialNumToRender={3}
          updateCellsBatchingPeriod={50}
          // Memory optimizations
          disableVirtualization={false}
          // Interaction optimizations
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          // Scroll optimizations
          scrollEventThrottle={16}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 100,
          }}
          // Enhanced scroll performance
          decelerationRate="normal"
          bounces={true}
          bouncesZoom={false}
          alwaysBounceVertical={true}
          // Accessibility
          accessibilityRole="list"
          accessibilityLabel="Library content sections"
        />
      )}
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
    flexGrow: 1,
  },
});
