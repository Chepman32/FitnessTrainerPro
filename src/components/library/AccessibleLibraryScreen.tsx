import React, { useEffect, useCallback, useState, useRef } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
  StatusBar,
  Text,
  AccessibilityInfo,
} from 'react-native';
import { LibrarySection, Content } from '../../types/library';
import { useLibrary } from '../../state/LibraryContext';
import { useUserProgress } from '../../state/UserProgressContext';
import { SearchBar } from '../library/SearchBar';
import { FilterBar } from '../library/FilterBar';
import { OfflineBanner } from '../library/OfflineBanner';
import { ContentShelf, ContentShelfSkeleton } from '../library/ContentShelf';
import {
  AccessibleContentCard,
  AccessibleSectionHeader,
} from '../library/AccessibleContentCard';
import {
  AccessibilityUtils,
  useAccessibility,
} from '../../utils/accessibility';

type AccessibleLibraryScreenProps = {
  onContentPress?: (content: Content) => void;
  onSeeAllPress?: (section: LibrarySection) => void;
};

export const AccessibleLibraryScreen: React.FC<
  AccessibleLibraryScreenProps
> = ({ onContentPress, onSeeAllPress }) => {
  const isDark = useColorScheme() === 'dark';
  const { state: libraryState, actions: libraryActions } = useLibrary();
  const { state: progressState } = useUserProgress();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [focusedSectionIndex, setFocusedSectionIndex] = useState<number | null>(
    null,
  );

  const flatListRef = useRef<FlatList>(null);
  const {
    isScreenReaderEnabled,
    isReduceMotionEnabled,
    announceToScreenReader,
    setAccessibilityFocus,
  } = useAccessibility();

  const { sections, isLoading, error, searchQuery } = libraryState;

  // Announce screen changes to screen reader
  useEffect(() => {
    if (isScreenReaderEnabled && !isInitialLoad) {
      const sectionCount = sections.length;
      const announcement = searchQuery
        ? `Search results updated. ${sectionCount} sections available.`
        : `Library updated. ${sectionCount} sections available.`;

      announceToScreenReader(announcement);
    }
  }, [
    sections.length,
    searchQuery,
    isScreenReaderEnabled,
    isInitialLoad,
    announceToScreenReader,
  ]);

  // Announce loading states
  useEffect(() => {
    if (isScreenReaderEnabled && !isInitialLoad) {
      if (isLoading) {
        announceToScreenReader('Loading library content');
      } else if (error) {
        announceToScreenReader(`Error loading content: ${error}`);
      }
    }
  }, [
    isLoading,
    error,
    isScreenReaderEnabled,
    isInitialLoad,
    announceToScreenReader,
  ]);

  // Initial load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await libraryActions.refreshLibrary();

        // Announce successful load to screen reader
        if (isScreenReaderEnabled) {
          announceToScreenReader('Library loaded successfully');
        }
      } finally {
        setIsInitialLoad(false);
      }
    };

    loadInitialData();
  }, [libraryActions, isScreenReaderEnabled, announceToScreenReader]);

  // Handle pull to refresh with accessibility announcement
  const handleRefresh = useCallback(async () => {
    if (isScreenReaderEnabled) {
      announceToScreenReader('Refreshing library content');
    }

    await libraryActions.refreshLibrary();

    if (isScreenReaderEnabled) {
      announceToScreenReader('Library refreshed');
    }
  }, [libraryActions, isScreenReaderEnabled, announceToScreenReader]);

  // Handle content press with accessibility feedback
  const handleContentPress = useCallback(
    (content: Content) => {
      if (isScreenReaderEnabled) {
        const announcement = `Opening ${content.type}: ${content.title}`;
        announceToScreenReader(announcement);
      }

      onContentPress?.(content);
    },
    [onContentPress, isScreenReaderEnabled, announceToScreenReader],
  );

  // Handle see all press with accessibility feedback
  const handleSeeAllPress = useCallback(
    (section: LibrarySection) => {
      if (isScreenReaderEnabled) {
        announceToScreenReader(`Viewing all items in ${section.title} section`);
      }

      onSeeAllPress?.(section);
    },
    [onSeeAllPress, isScreenReaderEnabled, announceToScreenReader],
  );

  // Prepare sections with continue items and accessibility enhancements
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
  }, [sections, progressState.userProgress]);

  // Render accessible section
  const renderSection = useCallback(
    ({ item: section, index }: { item: LibrarySection; index: number }) => {
      const isEmptySection = section.items.length === 0;

      return (
        <View
          style={styles.sectionContainer}
          accessible={false} // Let child components handle accessibility
        >
          <AccessibleSectionHeader
            title={section.title}
            itemCount={section.items.length}
            hasMore={section.hasMore}
            onSeeAllPress={() => handleSeeAllPress(section)}
          />

          {isEmptySection && section.type === 'continue' ? (
            <View style={styles.emptyContinueContainer}>
              <Text
                style={[
                  styles.emptyContinueText,
                  { color: isDark ? '#666' : '#999' },
                ]}
                accessible={true}
                accessibilityRole="text"
                accessibilityLabel="No active programs or challenges. Start a program or challenge to see your progress here."
              >
                Start a program or challenge to see your progress here
              </Text>
            </View>
          ) : (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={section.items}
              keyExtractor={(item, itemIndex) => `${item.id}_${itemIndex}`}
              renderItem={({ item: content, index: itemIndex }) => (
                <AccessibleContentCard
                  content={content}
                  onPress={handleContentPress}
                  sectionTitle={section.title}
                  position={{ index: itemIndex, total: section.items.length }}
                  style={[
                    styles.contentCard,
                    itemIndex === section.items.length - 1 && styles.lastCard,
                  ]}
                />
              )}
              contentContainerStyle={styles.horizontalScrollContent}
              removeClippedSubviews={!isScreenReaderEnabled} // Keep all items for screen readers
              getItemLayout={(data, itemIndex) => ({
                length: 296, // Card width + margin
                offset: 296 * itemIndex,
                index: itemIndex,
              })}
              // Accessibility props for horizontal scroll
              accessible={isScreenReaderEnabled}
              accessibilityRole={isScreenReaderEnabled ? 'list' : undefined}
              accessibilityLabel={
                isScreenReaderEnabled
                  ? `${section.title} section with ${section.items.length} items`
                  : undefined
              }
            />
          )}
        </View>
      );
    },
    [handleContentPress, handleSeeAllPress, isDark, isScreenReaderEnabled],
  );

  // Render loading skeleton with accessibility
  const renderLoadingSkeleton = () => (
    <View
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading library content"
      accessibilityValue={{ text: 'Loading' }}
    >
      <ContentShelfSkeleton title="Continue" />
      <ContentShelfSkeleton title="Recommended for you" />
      <ContentShelfSkeleton title="Quick Start" />
      <ContentShelfSkeleton title="Programs" />
      <ContentShelfSkeleton title="Challenges" />
    </View>
  );

  // Render header components with accessibility
  const renderHeader = () => (
    <View accessible={false}>
      <OfflineBanner />
      <SearchBar />
      <FilterBar />
    </View>
  );

  // Render empty state with accessibility
  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Text
        style={[styles.emptyStateText, { color: isDark ? '#FFF' : '#000' }]}
        accessible={true}
        accessibilityRole="text"
        accessibilityLabel="No content available. Try adjusting your filters or check your internet connection."
      >
        No content available
      </Text>
      <Text
        style={[styles.emptyStateSubtext, { color: isDark ? '#AAA' : '#666' }]}
        accessible={true}
        accessibilityRole="text"
      >
        Try adjusting your filters or check your internet connection
      </Text>
    </View>
  );

  const backgroundColor = isDark ? '#000000' : '#FFFFFF';
  const statusBarStyle = isDark ? 'light-content' : 'dark-content';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColor} />

      {/* Screen title for screen readers */}
      <Text
        style={styles.screenTitle}
        accessible={true}
        accessibilityRole="header"
        accessibilityLevel={1}
        accessibilityLabel="Library Screen. Browse workouts, programs, challenges, and articles."
      >
        Library
      </Text>

      {isInitialLoad ? (
        <View style={styles.content}>
          {renderHeader()}
          {renderLoadingSkeleton()}
        </View>
      ) : sectionsWithContinue.length === 0 ? (
        <View style={styles.content}>
          {renderHeader()}
          {renderEmptyState()}
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={sectionsWithContinue}
          keyExtractor={item => item.id}
          renderItem={renderSection}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isLoading && !isInitialLoad}
              onRefresh={handleRefresh}
              tintColor={isDark ? '#5B9BFF' : '#5B9BFF'}
              colors={['#5B9BFF']}
              accessibilityLabel="Pull to refresh library content"
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          removeClippedSubviews={!isScreenReaderEnabled} // Keep all content for screen readers
          maxToRenderPerBatch={isScreenReaderEnabled ? 10 : 3} // Render more for screen readers
          windowSize={isScreenReaderEnabled ? 10 : 5}
          initialNumToRender={isScreenReaderEnabled ? 5 : 3}
          getItemLayout={(data, index) => ({
            length: 300, // Approximate height of each section
            offset: 300 * index,
            index,
          })}
          // Accessibility props for main list
          accessible={false} // Let sections handle their own accessibility
          onScrollToIndexFailed={info => {
            // Handle scroll failures gracefully
            console.warn('Scroll to index failed:', info);
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
  screenTitle: {
    position: 'absolute',
    left: -10000,
    top: -10000,
    width: 1,
    height: 1,
    opacity: 0,
  },
  listContent: {
    paddingBottom: 32,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  contentCard: {
    marginRight: 16,
  },
  lastCard: {
    marginRight: 16,
  },
  horizontalScrollContent: {
    paddingLeft: 16,
  },
  emptyContinueContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  emptyContinueText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
