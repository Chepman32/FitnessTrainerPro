import { useCallback, useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  analyticsService,
  AnalyticsProperties,
} from '../services/analyticsService';
import { abTestingService } from '../services/abTestingService';
import { Content, LibrarySection } from '../types/library';

// Hook for analytics tracking
export const useAnalytics = () => {
  // Track screen view
  const trackScreenView = useCallback(
    (screenName: string, properties?: AnalyticsProperties) => {
      analyticsService.trackScreenView(screenName, properties);
    },
    [],
  );

  // Track content interaction
  const trackContentTap = useCallback(
    (
      content: Content,
      section: LibrarySection,
      position: number,
      properties?: AnalyticsProperties,
    ) => {
      analyticsService.trackCardTap(content, section, position, properties);
    },
    [],
  );

  // Track search
  const trackSearch = useCallback(
    (query: string, resultsCount: number, properties?: AnalyticsProperties) => {
      analyticsService.trackSearch(query, resultsCount, properties);
    },
    [],
  );

  // Track error
  const trackError = useCallback(
    (error: Error, context: string, properties?: AnalyticsProperties) => {
      analyticsService.trackError(error, context, properties);
    },
    [],
  );

  // Track custom event
  const trackEvent = useCallback(
    (event: string, properties?: AnalyticsProperties) => {
      analyticsService.track(event as any, properties);
    },
    [],
  );

  return {
    trackScreenView,
    trackContentTap,
    trackSearch,
    trackError,
    trackEvent,
  };
};

// Hook for screen view tracking
export const useScreenAnalytics = (
  screenName: string,
  properties?: AnalyticsProperties,
) => {
  const { trackScreenView } = useAnalytics();
  const hasTracked = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!hasTracked.current) {
        trackScreenView(screenName, properties);
        hasTracked.current = true;
      }

      return () => {
        hasTracked.current = false;
      };
    }, [screenName, properties, trackScreenView]),
  );
};

// Hook for shelf impression tracking
export const useShelfAnalytics = () => {
  const impressionTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const trackedImpressions = useRef<Set<string>>(new Set());

  const trackShelfImpression = useCallback(
    (section: LibrarySection, position: number, isVisible: boolean) => {
      const shelfKey = `${section.id}_${position}`;

      if (isVisible && !trackedImpressions.current.has(shelfKey)) {
        // Start timer for impression tracking (500ms minimum view time)
        const timer = setTimeout(() => {
          analyticsService.trackShelfImpression(section, position);
          trackedImpressions.current.add(shelfKey);
          impressionTimers.current.delete(shelfKey);
        }, 500);

        impressionTimers.current.set(shelfKey, timer);
      } else if (!isVisible && impressionTimers.current.has(shelfKey)) {
        // Cancel timer if shelf becomes invisible before minimum time
        const timer = impressionTimers.current.get(shelfKey);
        if (timer) {
          clearTimeout(timer);
          impressionTimers.current.delete(shelfKey);
        }
      }
    },
    [],
  );

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      impressionTimers.current.forEach(timer => clearTimeout(timer));
      impressionTimers.current.clear();
    };
  }, []);

  return { trackShelfImpression };
};

// Hook for card impression tracking
export const useCardAnalytics = () => {
  const impressionTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const trackedImpressions = useRef<Set<string>>(new Set());

  const trackCardImpression = useCallback(
    (
      content: Content,
      section: LibrarySection,
      position: number,
      isVisible: boolean,
    ) => {
      const cardKey = `${content.id}_${section.id}_${position}`;

      if (isVisible && !trackedImpressions.current.has(cardKey)) {
        // Start timer for impression tracking (300ms minimum view time)
        const timer = setTimeout(() => {
          analyticsService.trackCardImpression(content, section, position);
          trackedImpressions.current.add(cardKey);
          impressionTimers.current.delete(cardKey);
        }, 300);

        impressionTimers.current.set(cardKey, timer);
      } else if (!isVisible && impressionTimers.current.has(cardKey)) {
        // Cancel timer if card becomes invisible before minimum time
        const timer = impressionTimers.current.get(cardKey);
        if (timer) {
          clearTimeout(timer);
          impressionTimers.current.delete(cardKey);
        }
      }
    },
    [],
  );

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      impressionTimers.current.forEach(timer => clearTimeout(timer));
      impressionTimers.current.clear();
    };
  }, []);

  return { trackCardImpression };
};

// Hook for A/B testing
export const useABTesting = () => {
  // Get variant for experiment
  const getVariant = useCallback((experimentId: string): string | null => {
    return abTestingService.getVariant(experimentId);
  }, []);

  // Get variant configuration
  const getVariantConfig = useCallback(
    (experimentId: string): Record<string, any> | null => {
      return abTestingService.getVariantConfig(experimentId);
    },
    [],
  );

  // Check if user is in experiment
  const isInExperiment = useCallback((experimentId: string): boolean => {
    return abTestingService.isInExperiment(experimentId);
  }, []);

  // Track experiment exposure
  const trackExposure = useCallback(
    (experimentId: string, context?: Record<string, any>) => {
      abTestingService.trackExposure(experimentId, context);
    },
    [],
  );

  // Track conversion
  const trackConversion = useCallback(
    (experimentId: string, conversionType: string, value?: number) => {
      abTestingService.trackConversion(experimentId, conversionType, value);
    },
    [],
  );

  return {
    getVariant,
    getVariantConfig,
    isInExperiment,
    trackExposure,
    trackConversion,
  };
};

// Hook for library-specific A/B tests
export const useLibraryABTests = () => {
  const { getVariantConfig, trackExposure } = useABTesting();

  // Get shelf order configuration
  const getShelfOrder = useCallback(
    (defaultOrder: LibrarySection[]): LibrarySection[] => {
      trackExposure('shelf_order_v1', {
        default_order_count: defaultOrder.length,
      });
      return abTestingService.getShelfOrder(defaultOrder);
    },
    [trackExposure],
  );

  // Get search suggestions configuration
  const getSearchConfig = useCallback(() => {
    trackExposure('search_suggestions_v1');
    return abTestingService.getSearchSuggestionsConfig();
  }, [trackExposure]);

  // Get premium gate configuration
  const getPremiumConfig = useCallback(() => {
    trackExposure('premium_gate_timing_v1');
    return abTestingService.getPremiumGateConfig();
  }, [trackExposure]);

  return {
    getShelfOrder,
    getSearchConfig,
    getPremiumConfig,
  };
};

// Hook for performance analytics
export const usePerformanceAnalytics = () => {
  const trackLoadTime = useCallback((screenName: string, loadTime: number) => {
    analyticsService.track('performance_metric', {
      screen_name: screenName,
      metric_type: 'load_time',
      metric_value: loadTime,
    });
  }, []);

  const trackRenderTime = useCallback(
    (componentName: string, renderTime: number) => {
      analyticsService.track('performance_metric', {
        component_name: componentName,
        metric_type: 'render_time',
        metric_value: renderTime,
      });
    },
    [],
  );

  const trackMemoryUsage = useCallback(
    (componentName: string, memoryUsage: number) => {
      analyticsService.track('performance_metric', {
        component_name: componentName,
        metric_type: 'memory_usage',
        metric_value: memoryUsage,
      });
    },
    [],
  );

  const trackScrollPerformance = useCallback(
    (fps: number, droppedFrames: number) => {
      analyticsService.track('performance_metric', {
        metric_type: 'scroll_performance',
        fps,
        dropped_frames: droppedFrames,
      });
    },
    [],
  );

  return {
    trackLoadTime,
    trackRenderTime,
    trackMemoryUsage,
    trackScrollPerformance,
  };
};

// Hook for funnel analytics
export const useFunnelAnalytics = () => {
  const trackFunnelStep = useCallback(
    (
      funnelName: string,
      stepName: string,
      stepIndex: number,
      properties?: AnalyticsProperties,
    ) => {
      analyticsService.track('funnel_step', {
        ...properties,
        funnel_name: funnelName,
        step_name: stepName,
        step_index: stepIndex,
      });
    },
    [],
  );

  const trackFunnelConversion = useCallback(
    (
      funnelName: string,
      fromStep: string,
      toStep: string,
      properties?: AnalyticsProperties,
    ) => {
      analyticsService.track('funnel_conversion', {
        ...properties,
        funnel_name: funnelName,
        from_step: fromStep,
        to_step: toStep,
      });
    },
    [],
  );

  const trackFunnelDrop = useCallback(
    (
      funnelName: string,
      stepName: string,
      reason?: string,
      properties?: AnalyticsProperties,
    ) => {
      analyticsService.track('funnel_drop', {
        ...properties,
        funnel_name: funnelName,
        step_name: stepName,
        drop_reason: reason,
      });
    },
    [],
  );

  return {
    trackFunnelStep,
    trackFunnelConversion,
    trackFunnelDrop,
  };
};

// Hook for cohort analytics
export const useCohortAnalytics = () => {
  const trackCohortEvent = useCallback(
    (
      cohortType: string,
      eventName: string,
      properties?: AnalyticsProperties,
    ) => {
      analyticsService.track('cohort_event', {
        ...properties,
        cohort_type: cohortType,
        event_name: eventName,
      });
    },
    [],
  );

  return {
    trackCohortEvent,
  };
};
