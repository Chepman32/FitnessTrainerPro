import { useCallback, useMemo, useRef, useEffect } from 'react';
import { InteractionManager, LayoutAnimation, Platform } from 'react-native';

// Performance optimization utilities
export class PerformanceUtils {
  // Debounce function for search and other rapid inputs
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number,
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  // Throttle function for scroll events
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number,
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // Batch updates to avoid multiple re-renders
  static batchUpdates(updates: (() => void)[]): void {
    InteractionManager.runAfterInteractions(() => {
      updates.forEach(update => update());
    });
  }

  // Measure component render time
  static measureRenderTime(componentName: string, renderFn: () => void): void {
    if (__DEV__) {
      const start = performance.now();
      renderFn();
      const end = performance.now();
      console.log(
        `[Performance] ${componentName} render time: ${end - start}ms`,
      );
    } else {
      renderFn();
    }
  }

  // Optimize layout animations
  static configureLayoutAnimation(duration: number = 200): void {
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

  // Memory usage monitoring
  static monitorMemoryUsage(componentName: string): void {
    if (__DEV__ && (performance as any).memory) {
      const memory = (performance as any).memory;
      console.log(`[Memory] ${componentName}:`, {
        used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`,
      });
    }
  }

  // Check if device is low-end
  static isLowEndDevice(): boolean {
    // Simple heuristic - in production would use more sophisticated detection
    return Platform.OS === 'android' && Platform.Version < 28;
  }

  // Get optimal batch size based on device performance
  static getOptimalBatchSize(): number {
    return this.isLowEndDevice() ? 5 : 10;
  }

  // Get optimal window size for FlatList
  static getOptimalWindowSize(): number {
    return this.isLowEndDevice() ? 3 : 5;
  }
}

// Hook for debounced values
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook for throttled callbacks
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
): T => {
  const throttledCallback = useRef<T>();
  const lastRan = useRef<number>(0);

  React.useEffect(() => {
    throttledCallback.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (Date.now() - lastRan.current >= delay) {
        throttledCallback.current?.(...args);
        lastRan.current = Date.now();
      }
    }) as T,
    [delay],
  );
};

// Hook for memoized expensive calculations
export const useExpensiveMemo = <T>(
  factory: () => T,
  deps: React.DependencyList,
  debugName?: string,
): T => {
  return useMemo(() => {
    if (__DEV__ && debugName) {
      const start = performance.now();
      const result = factory();
      const end = performance.now();
      console.log(`[Performance] ${debugName} calculation: ${end - start}ms`);
      return result;
    }
    return factory();
  }, deps);
};

// Hook for intersection observer (lazy loading)
export const useIntersectionObserver = (
  callback: (isIntersecting: boolean) => void,
  options?: {
    threshold?: number;
    rootMargin?: string;
  },
) => {
  const elementRef = useRef<any>(null);
  const callbackRef = useRef(callback);

  React.useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Simple visibility detection for React Native
    // In web environment, would use IntersectionObserver
    const checkVisibility = () => {
      if (element.measure) {
        element.measure(
          (
            x: number,
            y: number,
            width: number,
            height: number,
            pageX: number,
            pageY: number,
          ) => {
            // Simple visibility check - element is visible if it has dimensions and position
            const isVisible =
              width > 0 && height > 0 && pageY > -height && pageY < 1000; // Approximate screen height
            callbackRef.current(isVisible);
          },
        );
      }
    };

    // Check visibility periodically
    const interval = setInterval(checkVisibility, 1000);
    checkVisibility(); // Initial check

    return () => clearInterval(interval);
  }, []);

  return elementRef;
};

// Hook for performance monitoring
export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const mountTime = useRef<number>(0);

  React.useEffect(() => {
    mountTime.current = performance.now();

    return () => {
      if (__DEV__) {
        const unmountTime = performance.now();
        const lifespan = unmountTime - mountTime.current;
        console.log(
          `[Performance] ${componentName} lifespan: ${lifespan}ms, renders: ${renderCount.current}`,
        );
      }
    };
  }, [componentName]);

  React.useEffect(() => {
    renderCount.current++;

    if (__DEV__ && renderCount.current > 10) {
      console.warn(
        `[Performance] ${componentName} has rendered ${renderCount.current} times`,
      );
    }
  });

  return {
    renderCount: renderCount.current,
    measureRender: (fn: () => void) => {
      PerformanceUtils.measureRenderTime(componentName, fn);
    },
  };
};

// Hook for optimized FlatList props
export const useOptimizedFlatListProps = (itemCount: number) => {
  return useMemo(() => {
    const isLowEnd = PerformanceUtils.isLowEndDevice();

    return {
      removeClippedSubviews: true,
      maxToRenderPerBatch: isLowEnd ? 5 : 10,
      windowSize: isLowEnd ? 3 : 5,
      initialNumToRender: isLowEnd ? 3 : 5,
      updateCellsBatchingPeriod: isLowEnd ? 100 : 50,
      getItemLayout:
        itemCount < 100
          ? undefined
          : (data: any, index: number) => ({
              length: 300, // Approximate item height
              offset: 300 * index,
              index,
            }),
    };
  }, [itemCount]);
};

// Hook for image loading optimization
export const useOptimizedImageProps = () => {
  return useMemo(() => {
    const isLowEnd = PerformanceUtils.isLowEndDevice();

    return {
      resizeMode: 'cover' as const,
      fadeDuration: isLowEnd ? 0 : 200,
      progressiveRenderingEnabled: !isLowEnd,
      cache: 'default' as const,
    };
  }, []);
};

// Hook for batch state updates
export const useBatchedUpdates = () => {
  const pendingUpdates = useRef<(() => void)[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const batchUpdate = useCallback((update: () => void) => {
    pendingUpdates.current.push(update);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const updates = pendingUpdates.current;
      pendingUpdates.current = [];

      InteractionManager.runAfterInteractions(() => {
        updates.forEach(update => update());
      });
    }, 16); // Next frame
  }, []);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return batchUpdate;
};

// Import React for hooks
import React from 'react';
