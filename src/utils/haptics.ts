import { Platform } from 'react-native';
import { HapticFeedbackTypes, trigger } from 'react-native-haptic-feedback';

// Haptic feedback utilities for enhanced user experience
export class HapticsUtils {
  private static isEnabled: boolean = true;

  // Enable or disable haptic feedback
  static setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // Check if haptics are enabled
  static isHapticsEnabled(): boolean {
    return this.isEnabled && Platform.OS === 'ios'; // Android support can be added
  }

  // Light haptic feedback for subtle interactions
  static light(): void {
    if (!this.isHapticsEnabled()) return;

    try {
      trigger(HapticFeedbackTypes.impactLight, {
        enableVibrateFallback: false,
        ignoreAndroidSystemSettings: false,
      });
    } catch (error) {
      console.warn('[Haptics] Light feedback failed:', error);
    }
  }

  // Medium haptic feedback for standard interactions
  static medium(): void {
    if (!this.isHapticsEnabled()) return;

    try {
      trigger(HapticFeedbackTypes.impactMedium, {
        enableVibrateFallback: false,
        ignoreAndroidSystemSettings: false,
      });
    } catch (error) {
      console.warn('[Haptics] Medium feedback failed:', error);
    }
  }

  // Heavy haptic feedback for important interactions
  static heavy(): void {
    if (!this.isHapticsEnabled()) return;

    try {
      trigger(HapticFeedbackTypes.impactHeavy, {
        enableVibrateFallback: false,
        ignoreAndroidSystemSettings: false,
      });
    } catch (error) {
      console.warn('[Haptics] Heavy feedback failed:', error);
    }
  }

  // Selection haptic feedback for picker/filter interactions
  static selection(): void {
    if (!this.isHapticsEnabled()) return;

    try {
      trigger(HapticFeedbackTypes.selection, {
        enableVibrateFallback: false,
        ignoreAndroidSystemSettings: false,
      });
    } catch (error) {
      console.warn('[Haptics] Selection feedback failed:', error);
    }
  }

  // Success haptic feedback for positive actions
  static success(): void {
    if (!this.isHapticsEnabled()) return;

    try {
      trigger(HapticFeedbackTypes.notificationSuccess, {
        enableVibrateFallback: false,
        ignoreAndroidSystemSettings: false,
      });
    } catch (error) {
      console.warn('[Haptics] Success feedback failed:', error);
    }
  }

  // Warning haptic feedback for cautionary actions
  static warning(): void {
    if (!this.isHapticsEnabled()) return;

    try {
      trigger(HapticFeedbackTypes.notificationWarning, {
        enableVibrateFallback: false,
        ignoreAndroidSystemSettings: false,
      });
    } catch (error) {
      console.warn('[Haptics] Warning feedback failed:', error);
    }
  }

  // Error haptic feedback for error states
  static error(): void {
    if (!this.isHapticsEnabled()) return;

    try {
      trigger(HapticFeedbackTypes.notificationError, {
        enableVibrateFallback: false,
        ignoreAndroidSystemSettings: false,
      });
    } catch (error) {
      console.warn('[Haptics] Error feedback failed:', error);
    }
  }

  // Context-specific haptic feedback methods

  // Card tap feedback
  static cardTap(): void {
    this.light();
  }

  // Filter selection feedback
  static filterSelect(): void {
    this.selection();
  }

  // Search input feedback
  static searchFocus(): void {
    this.light();
  }

  // Content start feedback (workout/program start)
  static contentStart(): void {
    this.medium();
  }

  // Premium gate feedback
  static premiumGate(): void {
    this.warning();
  }

  // Offline mode feedback
  static offlineMode(): void {
    this.warning();
  }

  // Pull to refresh feedback
  static pullRefresh(): void {
    this.light();
  }

  // Load more content feedback
  static loadMore(): void {
    this.light();
  }

  // Navigation feedback
  static navigate(): void {
    this.light();
  }

  // Error state feedback
  static errorState(): void {
    this.error();
  }

  // Success action feedback
  static successAction(): void {
    this.success();
  }
}

// Hook for haptic feedback
export const useHaptics = () => {
  return {
    light: HapticsUtils.light,
    medium: HapticsUtils.medium,
    heavy: HapticsUtils.heavy,
    selection: HapticsUtils.selection,
    success: HapticsUtils.success,
    warning: HapticsUtils.warning,
    error: HapticsUtils.error,
    cardTap: HapticsUtils.cardTap,
    filterSelect: HapticsUtils.filterSelect,
    searchFocus: HapticsUtils.searchFocus,
    contentStart: HapticsUtils.contentStart,
    premiumGate: HapticsUtils.premiumGate,
    offlineMode: HapticsUtils.offlineMode,
    pullRefresh: HapticsUtils.pullRefresh,
    loadMore: HapticsUtils.loadMore,
    navigate: HapticsUtils.navigate,
    errorState: HapticsUtils.errorState,
    successAction: HapticsUtils.successAction,
  };
};
