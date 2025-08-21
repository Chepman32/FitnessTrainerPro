import AsyncStorage from '@react-native-async-storage/async-storage';
import { Content, LibrarySection, LibraryFilters } from '../types/library';

// Analytics event types
export type AnalyticsEvent =
  | 'screen_view'
  | 'shelf_impression'
  | 'card_impression'
  | 'card_tap'
  | 'search_query'
  | 'filter_applied'
  | 'see_all_tap'
  | 'content_start'
  | 'content_complete'
  | 'premium_gate_shown'
  | 'premium_upgrade'
  | 'offline_banner_shown'
  | 'error_occurred';

export type AnalyticsProperties = {
  // Screen events
  screen_name?: string;
  previous_screen?: string;
  load_time?: number;

  // Content events
  content_id?: string;
  content_type?: 'program' | 'challenge' | 'workout' | 'article';
  content_title?: string;
  content_premium?: boolean;
  content_level?: string;
  content_duration?: number;

  // Shelf events
  shelf_id?: string;
  shelf_type?: string;
  shelf_title?: string;
  shelf_position?: number;
  shelf_item_count?: number;

  // Card events
  card_position?: number;
  card_section?: string;

  // Search events
  search_query?: string;
  search_results_count?: number;
  search_suggestions_shown?: boolean;

  // Filter events
  filters_applied?: string[];
  filter_count?: number;

  // User context
  user_premium?: boolean;
  user_session_id?: string;

  // Performance
  render_time?: number;
  api_response_time?: number;

  // Error context
  error_message?: string;
  error_code?: string;
  error_context?: string;

  // A/B testing
  experiment_id?: string;
  variant_id?: string;

  // Custom properties
  [key: string]: any;
};

export type AnalyticsConfig = {
  enabled: boolean;
  debug: boolean;
  batchSize: number;
  flushInterval: number;
  maxRetries: number;
  apiEndpoint?: string;
  apiKey?: string;
};

const DEFAULT_CONFIG: AnalyticsConfig = {
  enabled: true,
  debug: __DEV__,
  batchSize: 20,
  flushInterval: 30000, // 30 seconds
  maxRetries: 3,
};

export class AnalyticsService {
  private static instance: AnalyticsService;
  private config: AnalyticsConfig = DEFAULT_CONFIG;
  private eventQueue: Array<{
    event: AnalyticsEvent;
    properties: AnalyticsProperties;
    timestamp: number;
  }> = [];
  private sessionId: string = '';
  private userId?: string;
  private flushTimer?: NodeJS.Timeout;
  private isOnline: boolean = true;

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Initialize analytics service
  async initialize(
    config?: Partial<AnalyticsConfig>,
    userId?: string,
  ): Promise<void> {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.userId = userId;
    this.sessionId = this.generateSessionId();

    // Load queued events from storage
    await this.loadQueuedEvents();

    // Start flush timer
    this.startFlushTimer();

    if (this.config.debug) {
      console.log('[Analytics] Initialized with config:', this.config);
    }
  }

  // Track an analytics event
  track(event: AnalyticsEvent, properties: AnalyticsProperties = {}): void {
    if (!this.config.enabled) return;

    const enrichedProperties: AnalyticsProperties = {
      ...properties,
      user_session_id: this.sessionId,
      timestamp: Date.now(),
      platform: 'react-native',
      app_version: '1.0.0', // Would come from app config
    };

    const eventData = {
      event,
      properties: enrichedProperties,
      timestamp: Date.now(),
    };

    this.eventQueue.push(eventData);

    if (this.config.debug) {
      console.log('[Analytics] Event tracked:', event, enrichedProperties);
    }

    // Flush immediately for critical events
    const criticalEvents: AnalyticsEvent[] = [
      'error_occurred',
      'premium_upgrade',
    ];
    if (criticalEvents.includes(event)) {
      this.flush();
    }

    // Auto-flush when batch size is reached
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  // Track screen view
  trackScreenView(
    screenName: string,
    properties: AnalyticsProperties = {},
  ): void {
    this.track('screen_view', {
      ...properties,
      screen_name: screenName,
    });
  }

  // Track shelf impression
  trackShelfImpression(
    section: LibrarySection,
    position: number,
    properties: AnalyticsProperties = {},
  ): void {
    this.track('shelf_impression', {
      ...properties,
      shelf_id: section.id,
      shelf_type: section.type,
      shelf_title: section.title,
      shelf_position: position,
      shelf_item_count: section.items.length,
    });
  }

  // Track card impression
  trackCardImpression(
    content: Content,
    section: LibrarySection,
    position: number,
    properties: AnalyticsProperties = {},
  ): void {
    this.track('card_impression', {
      ...properties,
      content_id: content.id,
      content_type: content.type,
      content_title: content.title,
      content_premium: content.premium,
      card_position: position,
      card_section: section.id,
      shelf_title: section.title,
    });
  }

  // Track card tap
  trackCardTap(
    content: Content,
    section: LibrarySection,
    position: number,
    properties: AnalyticsProperties = {},
  ): void {
    this.track('card_tap', {
      ...properties,
      content_id: content.id,
      content_type: content.type,
      content_title: content.title,
      content_premium: content.premium,
      card_position: position,
      card_section: section.id,
      shelf_title: section.title,
      ...(content.type === 'workout' && {
        content_duration: content.durationMinutes,
        content_level: content.level,
      }),
      ...(content.type === 'program' && {
        content_duration: content.weeks,
        content_level: content.level,
      }),
    });
  }

  // Track search query
  trackSearch(
    query: string,
    resultsCount: number,
    properties: AnalyticsProperties = {},
  ): void {
    this.track('search_query', {
      ...properties,
      search_query: query,
      search_results_count: resultsCount,
    });
  }

  // Track filter application
  trackFilterApplied(
    filters: LibraryFilters,
    properties: AnalyticsProperties = {},
  ): void {
    const appliedFilters: string[] = [];

    if (filters.contentTypes.length > 0)
      appliedFilters.push(`content_types:${filters.contentTypes.join(',')}`);
    if (filters.goals.length > 0)
      appliedFilters.push(`goals:${filters.goals.join(',')}`);
    if (filters.levels.length > 0)
      appliedFilters.push(`levels:${filters.levels.join(',')}`);
    if (filters.locations.length > 0)
      appliedFilters.push(`locations:${filters.locations.join(',')}`);
    if (filters.equipment.length > 0)
      appliedFilters.push(`equipment:${filters.equipment.join(',')}`);
    if (filters.sortBy !== 'recommended')
      appliedFilters.push(`sort:${filters.sortBy}`);

    this.track('filter_applied', {
      ...properties,
      filters_applied: appliedFilters,
      filter_count: appliedFilters.length,
    });
  }

  // Track content start
  trackContentStart(
    content: Content,
    source: string,
    properties: AnalyticsProperties = {},
  ): void {
    this.track('content_start', {
      ...properties,
      content_id: content.id,
      content_type: content.type,
      content_title: content.title,
      content_premium: content.premium,
      source,
    });
  }

  // Track premium gate shown
  trackPremiumGateShown(
    content: Content,
    trigger: 'tap_locked' | 'quota_exceeded' | 'download_offline',
    properties: AnalyticsProperties = {},
  ): void {
    this.track('premium_gate_shown', {
      ...properties,
      content_id: content.id,
      content_type: content.type,
      content_title: content.title,
      trigger,
    });
  }

  // Track error
  trackError(
    error: Error,
    context: string,
    properties: AnalyticsProperties = {},
  ): void {
    this.track('error_occurred', {
      ...properties,
      error_message: error.message,
      error_code: (error as any).code || 'unknown',
      error_context: context,
    });
  }

  // Flush events to server
  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      if (this.isOnline && this.config.apiEndpoint) {
        await this.sendEvents(eventsToSend);
      } else {
        // Store events for later if offline
        await this.storeEvents(eventsToSend);
      }
    } catch (error) {
      console.error('[Analytics] Failed to flush events:', error);
      // Re-queue events for retry
      this.eventQueue.unshift(...eventsToSend);
    }
  }

  // Send events to analytics server
  private async sendEvents(events: any[]): Promise<void> {
    if (!this.config.apiEndpoint) return;

    const response = await fetch(this.config.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && {
          Authorization: `Bearer ${this.config.apiKey}`,
        }),
      },
      body: JSON.stringify({
        events,
        user_id: this.userId,
        session_id: this.sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.status}`);
    }

    if (this.config.debug) {
      console.log(`[Analytics] Sent ${events.length} events to server`);
    }
  }

  // Store events locally for offline sync
  private async storeEvents(events: any[]): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('@analytics_queue');
      const existingEvents = stored ? JSON.parse(stored) : [];
      const allEvents = [...existingEvents, ...events];

      // Limit stored events to prevent storage bloat
      const maxStoredEvents = 1000;
      const eventsToStore = allEvents.slice(-maxStoredEvents);

      await AsyncStorage.setItem(
        '@analytics_queue',
        JSON.stringify(eventsToStore),
      );
    } catch (error) {
      console.error('[Analytics] Failed to store events:', error);
    }
  }

  // Load queued events from storage
  private async loadQueuedEvents(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('@analytics_queue');
      if (stored) {
        const events = JSON.parse(stored);
        this.eventQueue.push(...events);
        await AsyncStorage.removeItem('@analytics_queue');

        if (this.config.debug) {
          console.log(`[Analytics] Loaded ${events.length} queued events`);
        }
      }
    } catch (error) {
      console.error('[Analytics] Failed to load queued events:', error);
    }
  }

  // Start automatic flush timer
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  // Generate unique session ID
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Set online status
  setOnlineStatus(isOnline: boolean): void {
    this.isOnline = isOnline;

    if (isOnline && this.eventQueue.length > 0) {
      // Flush queued events when coming back online
      this.flush();
    }
  }

  // Update user ID
  setUserId(userId: string): void {
    this.userId = userId;
  }

  // Get analytics summary
  getAnalyticsSummary(): {
    queuedEvents: number;
    sessionId: string;
    userId?: string;
    isOnline: boolean;
  } {
    return {
      queuedEvents: this.eventQueue.length,
      sessionId: this.sessionId,
      userId: this.userId,
      isOnline: this.isOnline,
    };
  }

  // Clear all analytics data
  async clearAnalyticsData(): Promise<void> {
    this.eventQueue = [];
    await AsyncStorage.removeItem('@analytics_queue');

    if (this.config.debug) {
      console.log('[Analytics] Cleared all analytics data');
    }
  }

  // Shutdown analytics service
  shutdown(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    // Flush remaining events
    this.flush();
  }
}

// Export singleton instance
export const analyticsService = AnalyticsService.getInstance();
