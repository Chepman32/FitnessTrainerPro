import { Animated, Easing, Platform, LayoutAnimation } from 'react-native';

// Animation utilities for smooth micro-interactions
export class AnimationUtils {
  // Standard animation durations
  static readonly DURATION = {
    FAST: 150,
    NORMAL: 250,
    SLOW: 350,
    EXTRA_SLOW: 500,
  };

  // Standard easing curves
  static readonly EASING = {
    EASE_OUT: Easing.out(Easing.cubic),
    EASE_IN: Easing.in(Easing.cubic),
    EASE_IN_OUT: Easing.inOut(Easing.cubic),
    SPRING: Easing.elastic(1.3),
    BOUNCE: Easing.bounce,
  };

  // Create a spring animation
  static spring(
    animatedValue: Animated.Value,
    toValue: number,
    config?: {
      tension?: number;
      friction?: number;
      speed?: number;
      bounciness?: number;
    },
  ): Animated.CompositeAnimation {
    return Animated.spring(animatedValue, {
      toValue,
      tension: config?.tension ?? 100,
      friction: config?.friction ?? 8,
      speed: config?.speed ?? 12,
      bounciness: config?.bounciness ?? 8,
      useNativeDriver: true,
    });
  }

  // Create a timing animation
  static timing(
    animatedValue: Animated.Value,
    toValue: number,
    duration: number = AnimationUtils.DURATION.NORMAL,
    easing: (value: number) => number = AnimationUtils.EASING.EASE_OUT,
  ): Animated.CompositeAnimation {
    return Animated.timing(animatedValue, {
      toValue,
      duration,
      easing,
      useNativeDriver: true,
    });
  }

  // Create a sequence of animations
  static sequence(
    animations: Animated.CompositeAnimation[],
  ): Animated.CompositeAnimation {
    return Animated.sequence(animations);
  }

  // Create parallel animations
  static parallel(
    animations: Animated.CompositeAnimation[],
  ): Animated.CompositeAnimation {
    return Animated.parallel(animations);
  }

  // Create a stagger animation
  static stagger(
    delay: number,
    animations: Animated.CompositeAnimation[],
  ): Animated.CompositeAnimation {
    return Animated.stagger(delay, animations);
  }

  // Fade in animation
  static fadeIn(
    animatedValue: Animated.Value,
    duration: number = AnimationUtils.DURATION.NORMAL,
  ): Animated.CompositeAnimation {
    return AnimationUtils.timing(animatedValue, 1, duration);
  }

  // Fade out animation
  static fadeOut(
    animatedValue: Animated.Value,
    duration: number = AnimationUtils.DURATION.NORMAL,
  ): Animated.CompositeAnimation {
    return AnimationUtils.timing(animatedValue, 0, duration);
  }

  // Scale in animation
  static scaleIn(
    animatedValue: Animated.Value,
    duration: number = AnimationUtils.DURATION.NORMAL,
  ): Animated.CompositeAnimation {
    return AnimationUtils.spring(animatedValue, 1);
  }

  // Scale out animation
  static scaleOut(
    animatedValue: Animated.Value,
    duration: number = AnimationUtils.DURATION.NORMAL,
  ): Animated.CompositeAnimation {
    return AnimationUtils.timing(animatedValue, 0, duration);
  }

  // Slide in from bottom
  static slideInFromBottom(
    animatedValue: Animated.Value,
    distance: number = 100,
    duration: number = AnimationUtils.DURATION.NORMAL,
  ): Animated.CompositeAnimation {
    return AnimationUtils.timing(animatedValue, 0, duration);
  }

  // Slide out to bottom
  static slideOutToBottom(
    animatedValue: Animated.Value,
    distance: number = 100,
    duration: number = AnimationUtils.DURATION.NORMAL,
  ): Animated.CompositeAnimation {
    return AnimationUtils.timing(animatedValue, distance, duration);
  }

  // Pulse animation
  static pulse(
    animatedValue: Animated.Value,
    minScale: number = 0.95,
    maxScale: number = 1.05,
    duration: number = AnimationUtils.DURATION.FAST,
  ): Animated.CompositeAnimation {
    return Animated.loop(
      Animated.sequence([
        AnimationUtils.timing(animatedValue, maxScale, duration),
        AnimationUtils.timing(animatedValue, minScale, duration),
      ]),
    );
  }

  // Shake animation
  static shake(
    animatedValue: Animated.Value,
    intensity: number = 10,
    duration: number = AnimationUtils.DURATION.FAST,
  ): Animated.CompositeAnimation {
    return Animated.sequence([
      AnimationUtils.timing(animatedValue, intensity, duration / 4),
      AnimationUtils.timing(animatedValue, -intensity, duration / 4),
      AnimationUtils.timing(animatedValue, intensity, duration / 4),
      AnimationUtils.timing(animatedValue, 0, duration / 4),
    ]);
  }

  // Layout animation presets
  static configureLayoutAnimation(
    preset: 'easeInEaseOut' | 'linear' | 'spring' = 'easeInEaseOut',
  ): void {
    if (Platform.OS === 'ios') {
      const configs = {
        easeInEaseOut: LayoutAnimation.Presets.easeInEaseOut,
        linear: LayoutAnimation.Presets.linear,
        spring: LayoutAnimation.Presets.spring,
      };

      LayoutAnimation.configureNext(configs[preset]);
    }
  }

  // Custom layout animation
  static configureCustomLayoutAnimation(duration: number = 250): void {
    if (Platform.OS === 'ios') {
      LayoutAnimation.configureNext({
        duration,
        create: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
        update: {
          type: LayoutAnimation.Types.easeInEaseOut,
        },
        delete: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
      });
    }
  }
}

// Hook for common animations
export const useAnimations = () => {
  // Card press animation
  const createCardPressAnimation = (scaleValue: Animated.Value) => {
    const pressIn = () => {
      AnimationUtils.timing(
        scaleValue,
        0.95,
        AnimationUtils.DURATION.FAST,
      ).start();
    };

    const pressOut = () => {
      AnimationUtils.spring(scaleValue, 1).start();
    };

    return { pressIn, pressOut };
  };

  // Loading animation
  const createLoadingAnimation = (rotateValue: Animated.Value) => {
    const startLoading = () => {
      const animation = Animated.loop(
        AnimationUtils.timing(rotateValue, 1, 1000, Easing.linear),
      );
      animation.start();
      return animation;
    };

    return { startLoading };
  };

  // Fade transition
  const createFadeTransition = (fadeValue: Animated.Value) => {
    const fadeIn = (callback?: () => void) => {
      AnimationUtils.fadeIn(fadeValue).start(callback);
    };

    const fadeOut = (callback?: () => void) => {
      AnimationUtils.fadeOut(fadeValue).start(callback);
    };

    return { fadeIn, fadeOut };
  };

  // Slide transition
  const createSlideTransition = (slideValue: Animated.Value) => {
    const slideIn = (callback?: () => void) => {
      AnimationUtils.slideInFromBottom(slideValue).start(callback);
    };

    const slideOut = (callback?: () => void) => {
      AnimationUtils.slideOutToBottom(slideValue).start(callback);
    };

    return { slideIn, slideOut };
  };

  // Scale transition
  const createScaleTransition = (scaleValue: Animated.Value) => {
    const scaleIn = (callback?: () => void) => {
      AnimationUtils.scaleIn(scaleValue).start(callback);
    };

    const scaleOut = (callback?: () => void) => {
      AnimationUtils.scaleOut(scaleValue).start(callback);
    };

    return { scaleIn, scaleOut };
  };

  // Staggered list animation
  const createStaggeredListAnimation = (items: Animated.Value[]) => {
    const animateIn = () => {
      const animations = items.map(item => AnimationUtils.fadeIn(item));
      AnimationUtils.stagger(100, animations).start();
    };

    const animateOut = () => {
      const animations = items.map(item => AnimationUtils.fadeOut(item));
      AnimationUtils.parallel(animations).start();
    };

    return { animateIn, animateOut };
  };

  return {
    createCardPressAnimation,
    createLoadingAnimation,
    createFadeTransition,
    createSlideTransition,
    createScaleTransition,
    createStaggeredListAnimation,
    configureLayoutAnimation: AnimationUtils.configureLayoutAnimation,
    configureCustomLayoutAnimation:
      AnimationUtils.configureCustomLayoutAnimation,
  };
};

// Predefined animation configurations for common UI patterns
export const ANIMATION_CONFIGS = {
  // Card interactions
  CARD_PRESS: {
    scale: { in: 0.95, out: 1.0 },
    duration: AnimationUtils.DURATION.FAST,
    easing: AnimationUtils.EASING.EASE_OUT,
  },

  // Modal presentations
  MODAL_SLIDE: {
    duration: AnimationUtils.DURATION.NORMAL,
    easing: AnimationUtils.EASING.EASE_OUT,
  },

  // Loading states
  LOADING_FADE: {
    duration: AnimationUtils.DURATION.SLOW,
    easing: AnimationUtils.EASING.EASE_IN_OUT,
  },

  // List item animations
  LIST_ITEM_STAGGER: {
    delay: 50,
    duration: AnimationUtils.DURATION.NORMAL,
    easing: AnimationUtils.EASING.EASE_OUT,
  },

  // Search suggestions
  SUGGESTIONS_SLIDE: {
    duration: AnimationUtils.DURATION.FAST,
    easing: AnimationUtils.EASING.EASE_OUT,
  },

  // Filter chips
  FILTER_SELECTION: {
    scale: { active: 1.05, inactive: 1.0 },
    duration: AnimationUtils.DURATION.FAST,
    easing: AnimationUtils.EASING.SPRING,
  },

  // Premium gate
  PREMIUM_GATE_SLIDE: {
    duration: AnimationUtils.DURATION.NORMAL,
    easing: AnimationUtils.EASING.EASE_OUT,
  },

  // Error states
  ERROR_SHAKE: {
    intensity: 8,
    duration: AnimationUtils.DURATION.NORMAL,
  },

  // Success states
  SUCCESS_SCALE: {
    scale: { peak: 1.1, final: 1.0 },
    duration: AnimationUtils.DURATION.NORMAL,
    easing: AnimationUtils.EASING.SPRING,
  },
};
