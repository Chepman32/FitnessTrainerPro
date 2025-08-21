import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useColorScheme,
  AccessibilityInfo,
} from 'react-native';
import { Content } from '../../types/library';
import { ContentCard } from './ContentCard';
import {
  AccessibilityUtils,
  useAccessibility,
} from '../../utils/accessibility';
import { usePremium } from '../../hooks/usePremium';
import { useUserProgress } from '../../state/UserProgressContext';

type AccessibleContentCardProps = {
  content: Content;
  onPress?: (content: Content) => void;
  style?: any;
  sectionTitle?: string;
  position?: { index: number; total: number };
};

export const AccessibleContentCard: React.FC<AccessibleContentCardProps> = ({
  content,
  onPress,
  style,
  sectionTitle,
  position,
}) => {
  const isDark = useColorScheme() === 'dark';
  const cardRef = useRef(null);
  const { isScreenReaderEnabled, announceToScreenReader } = useAccessibility();
  const { hasPremiumAccess, canAccessContent } = usePremium();
  const { actions: progressActions } = useUserProgress();

  const progress = progressActions.getProgress(content.id);
  const accessCheck = canAccessContent(content);
  const isPremiumUser = hasPremiumAccess();

  // Generate comprehensive accessibility label
  const getAccessibilityLabel = useCallback((): string => {
    let label = AccessibilityUtils.getContentCardLabel(content);

    // Add section context
    if (sectionTitle) {
      label = `${sectionTitle} section, ${label}`;
    }

    // Add position context
    if (position) {
      label += `, item ${position.index + 1} of ${position.total}`;
    }

    // Add progress information
    if (progress && progress.progressPercent > 0) {
      const progressLabel = AccessibilityUtils.getProgressLabel(
        progress.progressPercent,
        content.type,
      );
      label += `, ${progressLabel}`;
    }

    // Add premium status
    const premiumLabel = AccessibilityUtils.getPremiumBadgeLabel(
      content.premium,
      isPremiumUser,
    );
    if (premiumLabel) {
      label += `, ${premiumLabel}`;
    }

    // Add equipment requirements
    if ('equipment' in content && content.equipment) {
      const equipmentLabel = AccessibilityUtils.getEquipmentLabel(
        content.equipment,
      );
      label += `, ${equipmentLabel}`;
    }

    // Add goals
    if ('goals' in content && content.goals) {
      const goalLabel = AccessibilityUtils.getGoalLabel(content.goals);
      label += `, ${goalLabel}`;
    }

    return label;
  }, [content, sectionTitle, position, progress, isPremiumUser]);

  // Generate accessibility hint
  const getAccessibilityHint = useCallback((): string => {
    let hint = AccessibilityUtils.getContentCardHint(content);

    // Add premium-specific hints
    if (content.premium && !isPremiumUser) {
      hint += '. Premium subscription required to access this content.';
    }

    // Add progress-specific hints
    if (
      progress &&
      progress.progressPercent > 0 &&
      progress.progressPercent < 100
    ) {
      hint += '. You can continue where you left off.';
    }

    return hint;
  }, [content, isPremiumUser, progress]);

  // Handle press with accessibility announcements
  const handlePress = useCallback(() => {
    // Announce action to screen reader
    if (isScreenReaderEnabled) {
      let announcement = '';

      if (!accessCheck.canAccess) {
        announcement = `Opening premium content details for ${content.title}`;
      } else {
        switch (content.type) {
          case 'workout':
            announcement = `Starting ${content.title} workout`;
            break;
          case 'program':
            announcement = `Opening ${content.title} program`;
            break;
          case 'challenge':
            announcement = content.joined
              ? `Continuing ${content.title} challenge`
              : `Opening ${content.title} challenge details`;
            break;
          case 'article':
            announcement = `Opening ${content.title} article`;
            break;
        }
      }

      if (announcement) {
        announceToScreenReader(announcement);
      }
    }

    onPress?.(content);
  }, [
    content,
    accessCheck.canAccess,
    isScreenReaderEnabled,
    announceToScreenReader,
    onPress,
  ]);

  // Handle focus for screen readers
  const handleFocus = useCallback(() => {
    if (isScreenReaderEnabled) {
      // Announce additional context when focused
      const contextInfo = [];

      if (content.premium && !isPremiumUser) {
        contextInfo.push('Premium content');
      }

      if (progress && progress.progressPercent > 0) {
        contextInfo.push(`${progress.progressPercent}% complete`);
      }

      if ('durationMinutes' in content) {
        const durationLabel = AccessibilityUtils.formatDurationForAccessibility(
          content.durationMinutes,
        );
        contextInfo.push(durationLabel);
      }

      if (contextInfo.length > 0) {
        const announcement = contextInfo.join(', ');
        // Delay announcement to avoid conflicts with focus announcement
        setTimeout(() => announceToScreenReader(announcement), 500);
      }
    }
  }, [
    content,
    isPremiumUser,
    progress,
    isScreenReaderEnabled,
    announceToScreenReader,
  ]);

  // Get accessibility state
  const getAccessibilityState = useCallback(() => {
    const state: any = {};

    if (content.premium && !isPremiumUser) {
      state.disabled = false; // Not disabled, but requires premium
    }

    if (progress && progress.progressPercent === 100) {
      state.selected = true; // Completed content
    }

    return state;
  }, [content.premium, isPremiumUser, progress]);

  // Get accessibility actions
  const getAccessibilityActions = useCallback(() => {
    const actions = [
      {
        name: 'activate',
        label:
          content.premium && !isPremiumUser
            ? 'View premium content details'
            : `Open ${content.type}`,
      },
    ];

    // Add context-specific actions
    if (content.type === 'workout' && accessCheck.canAccess) {
      actions.push({
        name: 'longpress',
        label: 'View workout details',
      });
    }

    if (
      content.type === 'program' &&
      progress &&
      progress.progressPercent > 0
    ) {
      actions.push({
        name: 'longpress',
        label: 'Continue program',
      });
    }

    return actions;
  }, [content, isPremiumUser, accessCheck.canAccess, progress]);

  return (
    <Pressable
      ref={cardRef}
      style={[styles.container, style]}
      onPress={handlePress}
      onFocus={handleFocus}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={getAccessibilityLabel()}
      accessibilityHint={getAccessibilityHint()}
      accessibilityState={getAccessibilityState()}
      accessibilityActions={getAccessibilityActions()}
      onAccessibilityAction={event => {
        switch (event.nativeEvent.actionName) {
          case 'activate':
            handlePress();
            break;
          case 'longpress':
            // Handle long press actions
            console.log('Long press action for', content.title);
            break;
        }
      }}
      // Ensure minimum touch target size
      hitSlop={AccessibilityUtils.getMinTouchTargetSize()}
    >
      <ContentCard
        content={content}
        onPress={undefined} // Handle press at this level
        style={styles.card}
      />

      {/* Hidden accessibility-only content for additional context */}
      {isScreenReaderEnabled && (
        <View style={styles.hiddenAccessibilityContent}>
          <Text
            accessible={false}
            importantForAccessibility="no"
            style={styles.hiddenText}
          >
            {/* Additional context that's only read by screen readers */}
            {content.premium &&
              !isPremiumUser &&
              'Premium subscription required'}
            {progress &&
              progress.progressPercent > 0 &&
              ` Progress: ${progress.progressPercent}% complete`}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

// Accessible section header component
export const AccessibleSectionHeader: React.FC<{
  title: string;
  itemCount: number;
  hasMore: boolean;
  onSeeAllPress?: () => void;
}> = ({ title, itemCount, hasMore, onSeeAllPress }) => {
  const isDark = useColorScheme() === 'dark';
  const { isScreenReaderEnabled } = useAccessibility();

  const accessibilityLabel = AccessibilityUtils.getSectionHeaderLabel(
    title,
    itemCount,
    hasMore,
  );

  return (
    <View style={styles.sectionHeader}>
      <Text
        style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#000' }]}
        accessible={true}
        accessibilityRole="header"
        accessibilityLabel={accessibilityLabel}
        accessibilityLevel={2}
      >
        {title}
      </Text>

      {hasMore && onSeeAllPress && (
        <Pressable
          style={styles.seeAllButton}
          onPress={onSeeAllPress}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`See all ${title.toLowerCase()}`}
          accessibilityHint="Double tap to view all items in this section"
          hitSlop={AccessibilityUtils.getMinTouchTargetSize()}
        >
          <Text style={[styles.seeAllText, { color: '#5B9BFF' }]}>See all</Text>
        </Pressable>
      )}
    </View>
  );
};

// Accessible filter chip component
export const AccessibleFilterChip: React.FC<{
  label: string;
  filterType: string;
  isActive: boolean;
  onPress: () => void;
}> = ({ label, filterType, isActive, onPress }) => {
  const isDark = useColorScheme() === 'dark';
  const { announceToScreenReader, isScreenReaderEnabled } = useAccessibility();

  const handlePress = useCallback(() => {
    if (isScreenReaderEnabled) {
      const announcement = isActive
        ? `${label} filter removed`
        : `${label} filter applied`;
      announceToScreenReader(announcement);
    }
    onPress();
  }, [isActive, label, isScreenReaderEnabled, announceToScreenReader, onPress]);

  const accessibilityLabel = AccessibilityUtils.getFilterChipLabel(
    filterType,
    label,
    isActive,
  );

  return (
    <Pressable
      style={[
        styles.filterChip,
        {
          backgroundColor: isActive
            ? '#5B9BFF'
            : isDark
            ? '#2A2A2A'
            : '#F3F4F6',
          borderColor: isActive ? '#5B9BFF' : isDark ? '#404040' : '#E5E7EB',
        },
      ]}
      onPress={handlePress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: isActive }}
      accessibilityHint="Double tap to toggle this filter"
      hitSlop={AccessibilityUtils.getMinTouchTargetSize()}
    >
      <Text
        style={[
          styles.filterChipText,
          { color: isActive ? 'white' : isDark ? '#AAA' : '#666' },
        ]}
        accessible={false}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    // Ensure minimum touch target size
    minWidth: 44,
    minHeight: 44,
  },
  card: {
    // Card styles handled by ContentCard
  },
  hiddenAccessibilityContent: {
    position: 'absolute',
    left: -10000,
    top: -10000,
    width: 1,
    height: 1,
    opacity: 0,
  },
  hiddenText: {
    fontSize: 1,
    color: 'transparent',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    minHeight: 44, // Ensure touch target size
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  seeAllButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: '600',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 44, // Ensure touch target size
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
