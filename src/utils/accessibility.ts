import { AccessibilityInfo, Platform, AccessibilityRole, AccessibilityState } from 'react-native';
import { Content } from '../types/library';
import React from 'react';

// Accessibility utilities for the Library Screen
export class AccessibilityUtils {
  // Check if screen reader is enabled
  static async isScreenReaderEnabled(): Promise<boolean> {
    try {
      return await AccessibilityInfo.isScreenReaderEnabled();
    } catch (error) {
      console.error('Failed to check screen reader status:', error);
      return false;
    }
  }

  // Check if reduce motion is enabled
  static async isReduceMotionEnabled(): Promise<boolean> {
    try {
      return await AccessibilityInfo.isReduceMotionEnabled();
    } catch (error) {
      console.error('Failed to check reduce motion status:', error);
      return false;
    }
  }

  // Generate accessible label for content cards
  static getContentCardLabel(content: Content): string {
    const baseLabel = `${content.type}: ${content.title}`;

    switch (content.type) {
      case 'workout':
        return `${baseLabel}, ${content.durationMinutes} minutes, ${
          content.level
        } level${content.premium ? ', Premium content' : ''}`;

      case 'program':
        return `${baseLabel}, ${content.weeks} weeks, ${
          content.sessionsPerWeek
        } sessions per week, ${content.level} level${
          content.premium ? ', Premium content' : ''
        }`;

      case 'challenge':
        return `${baseLabel}, ${content.durationDays} days, ${
          content.participantsCount
        } participants${content.joined ? ', Already joined' : ''}${
          content.premium ? ', Premium content' : ''
        }`;

      case 'article':
        return `${baseLabel}, ${content.readTimeMinutes} minute read, ${
          content.topic
        }${content.premium ? ', Premium content' : ''}`;

      default:
        return baseLabel;
    }
  }

  // Generate accessible hint for content cards
  static getContentCardHint(content: Content): string {
    if (content.premium) {
      return 'Double tap to view premium content details or upgrade';
    }

    switch (content.type) {
      case 'workout':
        return 'Double tap to start workout';
      case 'program':
        return 'Double tap to view program details';
      case 'challenge':
        return content.joined
          ? 'Double tap to continue challenge'
          : 'Double tap to join challenge';
      case 'article':
        return 'Double tap to read article';
      default:
        return 'Double tap to open';
    }
  }

  // Generate label for filter chips
  static getFilterChipLabel(
    filterType: string,
    filterValue: string,
    isActive: boolean,
  ): string {
    return `${filterType}: ${filterValue}, ${
      isActive ? 'selected' : 'not selected'
    }`;
  }

  // Generate accessible label for progress indicators
  static getProgressLabel(
    progressPercent: number,
    contentType: string,
  ): string {
    if (progressPercent <= 0) {
      return `${contentType} not started`;
    } else if (progressPercent >= 100) {
      return `${contentType} completed`;
    } else {
      return `${progressPercent}% complete`;
    }
  }

  // Generate label for premium indicator
  static getPremiumBadgeLabel(isPremium: boolean, hasAccess: boolean): string {
    if (!isPremium) return 'Standard content';
    return hasAccess ? 'Premium content, unlocked' : 'Premium content, locked';
  }

  // Generate label for search results
  static getSearchResultsLabel(query: string, resultCount: number): string {
    if (resultCount === 0) {
      return `No results for "${query}"`;
    }
    return `${resultCount} ${resultCount === 1 ? 'result' : 'results'} for "${query}"`;
  }

  // Generate label for section headers
  static getSectionHeaderLabel(
    sectionTitle: string,
    itemCount: number,
    hasMore: boolean,
  ): string {
    const countText = `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`;
    return `${sectionTitle}, ${countText}${hasMore ? ', more available' : ''}`;
  }

  // Generate accessibility label for offline status
  static getOfflineStatusLabel(
    isOnline: boolean,
    offlineContentCount: number,
  ): string {
    if (isOnline) {
      return 'Online';
    }

    if (offlineContentCount > 0) {
      return `Offline, ${offlineContentCount} items available`;
    }

    return 'Offline';
  }

  // Announce a message for screen readers
  static announceToScreenReader(message: string): void {
    try {
      if (Platform.OS === 'ios') {
        AccessibilityInfo.announceForAccessibility(message);
      } else if (Platform.OS === 'android') {
        const maybeAny = AccessibilityInfo as unknown as {
          announceForAccessibilityWithOptions?: (
            msg: string,
            options: { queue: boolean },
          ) => void;
          announceForAccessibility: (msg: string) => void;
        };
        if (typeof maybeAny.announceForAccessibilityWithOptions === 'function') {
          maybeAny.announceForAccessibilityWithOptions(message, { queue: true });
        } else {
          maybeAny.announceForAccessibility(message);
        }
      }
    } catch (error) {
      console.warn('Accessibility announcement failed:', error);
    }
  }

  // Set accessibility focus to a specific element
  static setAccessibilityFocus(_ref: React.RefObject<any>): void {
    try {
      // no-op placeholder for future implementation
    } catch (error) {
      console.warn('Failed to set accessibility focus:', error);
    }
  }

  // Decide if an element should be focusable
  static shouldBeFocusable(element: 'button' | 'text' | 'image'): boolean {
    return element === 'button' || element === 'text';
  }

  // Minimum touch target based on platform guidelines
  static getMinTouchTargetSize(): { width: number; height: number } {
    const minSize = Platform.OS === 'ios' ? 44 : 48; // iOS: 44pt, Android: 48dp
    return { width: minSize, height: minSize };
  }

  // Build accessible value/aria-valuetext
  static getAccessibleValue(
    current: number,
    max: number,
    unit: string = '',
  ): string {
    const percent = Math.round((current / max) * 100);
    return `${percent}%${unit ? ` ${unit}` : ''}`.trim();
  }

  // Formats durations like 5 -> "5 minutes", 90 -> "1 hour 30 minutes"
  static formatDurationForAccessibility(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} minute${minutes === 1 ? '' : 's'}`;
    }
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
    const hoursPart = `${hours} hour${hours === 1 ? '' : 's'}`;
    const minutesPart =
      remaining > 0 ? ` ${remaining} minute${remaining === 1 ? '' : 's'}` : '';
    return `${hoursPart}${minutesPart}`;
  }

  // Screen-reader friendly duration formatter (alias)
  static formatDurationForScreenReader(minutes: number): string {
    return AccessibilityUtils.formatDurationForAccessibility(minutes);
  }

  // Screen-reader friendly number formatting
  static formatNumberForScreenReader(value: number): string {
    try {
      return value.toLocaleString?.() ?? String(value);
    } catch {
      return String(value);
    }
  }

  // Format date to a readable label for SRs
  static formatDateForAccessibility(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // Labels for equipment, difficulty, goals
  static getEquipmentLabel(equipment: string[]): string {
    if (!equipment || equipment.length === 0) return 'No equipment';
    const filtered = equipment.filter(e => e !== 'none');
    if (filtered.length === 0) return 'No equipment';
    return `Equipment: ${filtered.join(', ')}`;
  }

  static getDifficultyLabel(level: string): string {
    switch (level) {
      case 'beginner':
        return 'Beginner level';
      case 'intermediate':
        return 'Intermediate level';
      case 'advanced':
        return 'Advanced level';
      default:
        return 'All levels';
    }
  }

  static getGoalLabel(goals: string[]): string {
    if (!goals || goals.length === 0) return 'No specific goal';

    const goalMap: Record<string, string> = {
      strength: 'Strength',
      cardio: 'Cardio',
      mobility: 'Mobility',
      fatloss: 'Fat Loss',
      endurance: 'Endurance',
      flexibility: 'Flexibility',
      balance: 'Balance',
      rehabilitation: 'Rehabilitation',
    };

    const readableGoals = goals.map(g => goalMap[g] || g);

    if (readableGoals.length === 1) {
      return `Focused on ${readableGoals[0]}`;
    }

    const lastGoal = readableGoals[readableGoals.length - 1];
    const otherGoals = readableGoals.slice(0, -1);

    return `Focused on ${otherGoals.join(', ')} and ${lastGoal}`;
  }

  // Determine the appropriate accessibility role for a content card
  static getContentRole(_content: Content): AccessibilityRole {
    // All content cards are interactive and behave like buttons
    // Using 'button' provides consistent semantics across platforms
    return 'button';
  }

  // Convenience helper to build an accessibilityState object
  static getAccessibilityState(
    selected: boolean = false,
    disabled: boolean = false,
    expanded: boolean = false,
  ): AccessibilityState {
    return {
      selected,
      disabled,
      expanded,
    };
  }

  // Announce search results updates
  static announceSearchResults(query: string, resultCount: number): void {
    const message = AccessibilityUtils.getSearchResultsLabel(query, resultCount);
    AccessibilityUtils.announceToScreenReader(message);
  }

  // Announce when a filter changes
  static announceFilterChange(
    filterType: string,
    filterValue: string,
    isActive: boolean,
  ): void {
    const status = isActive ? 'Filter applied' : 'Filter removed';
    const label = AccessibilityUtils.getFilterChipLabel(
      filterType,
      filterValue,
      isActive,
    );
    AccessibilityUtils.announceToScreenReader(`${status}: ${label}`);
  }
}

// Hook for accessibility state management
export const useAccessibility = () => {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] =
    React.useState(false);
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] =
    React.useState(false);

  React.useEffect(() => {
    const checkAccessibilitySettings = async () => {
      const screenReader = await AccessibilityUtils.isScreenReaderEnabled();
      const reduceMotion = await AccessibilityUtils.isReduceMotionEnabled();

      setIsScreenReaderEnabled(screenReader);
      setIsReduceMotionEnabled(reduceMotion);
    };

    checkAccessibilitySettings();

    const screenReaderSubscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled,
    );

    const reduceMotionSubscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setIsReduceMotionEnabled,
    );

    return () => {
      screenReaderSubscription?.remove();
      reduceMotionSubscription?.remove();
    };
  }, []);

  return {
    isScreenReaderEnabled,
    isReduceMotionEnabled,
    announceForAccessibility: AccessibilityUtils.announceToScreenReader,
    announceToScreenReader: AccessibilityUtils.announceToScreenReader,
    setAccessibilityFocus: AccessibilityUtils.setAccessibilityFocus,
  };
};
