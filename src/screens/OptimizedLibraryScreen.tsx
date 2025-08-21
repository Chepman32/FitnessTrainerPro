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

type OptimizedLibraryScreenProps = {
  onContentPress?: (content: Content) => void;
  onSeeAllPress?: (section: LibrarySection) => void;
};

export const OptimizedLibraryScreen: React.FC<OptimizedLibraryScreenProps> = ({
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

  const flatListRef = React.useRef<FlatList>(null);
  const { measureRender } = usePerformanceMonitor('OptimizedLibraryScreen');
  const batchUpdate = useBatchedUpdates();

  const { sections, isLoading, error, searchQuery } = libraryState;
  const flatListProps = useOptimizedFlatListProps(sections.length);

  // Throttled refresh to prevent excessive API calls
  const throttledRefresh = useThrottle(
    useCallback(async () => {
      await libraryActions.refreshLibrary();
    }, [libraryActions]),
    2000, // 2 second throttle
  );

  // Initial load with performance optimization
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Use InteractionManager to defer heavy operations
        InteractionManager.runAfterInteractions(async () => {
          await libraryActions.refreshLibrary();

          batchUpdate(() => {
            setIsInitialLoad(false);
          });
        });
      } catch (error) {
        console.error('Failed to load initial data:', error);
        setIsInitialLoad(false);
      }
    };

    loadInitialData();
  }, [libraryActions, batchUpdate]);

  // Handle pull to refresh with throttling
  const handleRefresh = useCallback(async () => {
    throttledRefresh();
  }, [throttledRefresh]);

  // Optimized content press handler
  const handleContentPress = useCallback(
    (content: Content) => {
      // Defer navigation to next frame for smooth interaction
      InteractionManager.runAfterInteractions(() => {
        onContentPress?.(content);
      });
    },
    [onContentPress],
  );

  // Optimized see all press handler
  const handleSeeAllPress = useCallback(
    (section: LibrarySection) => {
      InteractionManager.runAfterInteractions(() => {
        onSeeAllPress?.(section);
      });
    },
    [onSeeAllPress],
  );

  // Optimized load more handler
  const handleLoadMore = useCallback(
    async (sectionId: string) => {
      await libraryActions.loadMoreSection(sectionId);
    },
    [libraryActions],
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

  // Memoized sections with continue items
  const sectionsWithContinue = useMemo(() => {
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

        // Convert progress items to content items (simplified)
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
  }, [sections, progressState.userProgress]);

  // Optimized section renderer with visibility check
  const renderSection = useCallback(
    ({ item: section, index }: { item: LibrarySection; index: number }) => {
      const isVisible = visibleSections.has(section.id) || index < 2; // Always render first 2 sections

      if (!isVisible && index > 5) {
        // Return placeholder for non-visible sections far down the list
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

  // Memoized key extractor
  const keyExtractor = useCallback((item: LibrarySection) => item.id, []);

  // Optimized get item layout
  const getItemLayout = useCallback(
    (data: any, index: number) => ({
      length: 300, // Approximate section height
      offset: 300 * index,
      index,
    }),
    [],
  );

  // Memoized loading skeleton
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

  // Memoized header components
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

  // Memoized viewability config
  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 30,
      minimumViewTime: 100,
    }),
    [],
  );

  // Memoized styles
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
      PerformanceUtils.monitorMemoryUsage('OptimizedLibraryScreen');
    }
  }, [sections.length]);

  return (
    <SafeAreaView style={containerStyle}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColor} />

      {isInitialLoad ? (
        <View style={styles.content}>
          {renderHeader}
          {renderLoadingSkeleton}
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={sectionsWithContinue}
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
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={listContentStyle}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={getItemLayout}
          // Performance optimizations
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
