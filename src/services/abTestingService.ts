import AsyncStorage from '@react-native-async-storage/async-storage';
import { LibrarySection } from '../types/library';
import { analyticsService } from './analyticsService';

// A/B test experiment types
export type ExperimentType =
  | 'shelf_order'
  | 'card_layout'
  | 'search_suggestions'
  | 'premium_gate_timing'
  | 'filter_defaults'
  | 'content_recommendations';

export type ExperimentVariant = {
  id: string;
  name: string;
  weight: number; // 0-100, percentage of users
  config: Record<string, any>;
};

export type Experiment = {
  id: string;
  name: string;
  type: ExperimentType;
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate: string;
  endDate?: string;
  targetAudience?: {
    userTypes?: ('free' | 'premium')[];
    platforms?: ('ios' | 'android')[];
    countries?: string[];
    minAppVersion?: string;
  };
  variants: ExperimentVariant[];
  defaultVariant: string;
  trafficAllocation: number; // 0-100, percentage of users in experiment
};

export type UserAssignment = {
  experimentId: string;
  variantId: string;
  assignedAt: string;
};

export type ABTestConfig = {
  enabled: boolean;
  debug: boolean;
  apiEndpoint?: string;
  refreshInterval: number; // milliseconds
  cacheExpiry: number; // milliseconds
};

const DEFAULT_CONFIG: ABTestConfig = {
  enabled: true,
  debug: __DEV__,
  refreshInterval: 5 * 60 * 1000, // 5 minutes
  cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours
};

export class ABTestingService {
  private static instance: ABTestingService;
  private config: ABTestConfig = DEFAULT_CONFIG;
  private experiments: Map<string, Experiment> = new Map();
  private userAssignments: Map<string, UserAssignment> = new Map();
  private userId?: string;
  private refreshTimer?: NodeJS.Timeout;
  private lastRefresh: number = 0;

  static getInstance(): ABTestingService {
    if (!ABTestingService.instance) {
      ABTestingService.instance = new ABTestingService();
    }
    return ABTestingService.instance;
  }

  // Initialize A/B testing service
  async initialize(
    config?: Partial<ABTestConfig>,
    userId?: string,
  ): Promise<void> {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.userId = userId;

    // Load cached experiments and assignments
    await this.loadCachedData();

    // Fetch latest experiments
    await this.refreshExperiments();

    // Start refresh timer
    this.startRefreshTimer();

    if (this.config.debug) {
      console.log('[A/B Testing] Initialized with config:', this.config);
    }
  }

  // Get variant for an experiment
  getVariant(experimentId: string): string | null {
    if (!this.config.enabled) return null;

    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'active') {
      return experiment?.defaultVariant || null;
    }

    // Check if user is already assigned
    const existingAssignment = this.userAssignments.get(experimentId);
    if (existingAssignment) {
      return existingAssignment.variantId;
    }

    // Check if user qualifies for experiment
    if (!this.isUserEligible(experiment)) {
      return experiment.defaultVariant;
    }

    // Assign user to variant
    const variantId = this.assignUserToVariant(experiment);

    // Store assignment
    const assignment: UserAssignment = {
      experimentId,
      variantId,
      assignedAt: new Date().toISOString(),
    };

    this.userAssignments.set(experimentId, assignment);
    this.saveUserAssignments();

    // Track assignment
    analyticsService.track('ab_test_assigned', {
      experiment_id: experimentId,
      variant_id: variantId,
      experiment_name: experiment.name,
    });

    if (this.config.debug) {
      console.log(
        `[A/B Testing] User assigned to variant ${variantId} for experiment ${experimentId}`,
      );
    }

    return variantId;
  }

  // Get variant configuration
  getVariantConfig(experimentId: string): Record<string, any> | null {
    const variantId = this.getVariant(experimentId);
    if (!variantId) return null;

    const experiment = this.experiments.get(experimentId);
    if (!experiment) return null;

    const variant = experiment.variants.find(v => v.id === variantId);
    return variant?.config || null;
  }

  // Check if user is in experiment
  isInExperiment(experimentId: string): boolean {
    const variantId = this.getVariant(experimentId);
    const experiment = this.experiments.get(experimentId);

    return variantId !== null && variantId !== experiment?.defaultVariant;
  }

  // Get all active experiments for user
  getActiveExperiments(): Array<{
    experimentId: string;
    variantId: string;
    config: any;
  }> {
    const activeExperiments: Array<{
      experimentId: string;
      variantId: string;
      config: any;
    }> = [];

    for (const [experimentId, experiment] of this.experiments.entries()) {
      if (experiment.status === 'active') {
        const variantId = this.getVariant(experimentId);
        const config = this.getVariantConfig(experimentId);

        if (variantId && config) {
          activeExperiments.push({
            experimentId,
            variantId,
            config,
          });
        }
      }
    }

    return activeExperiments;
  }

  // Library-specific A/B test helpers
  getShelfOrder(defaultOrder: LibrarySection[]): LibrarySection[] {
    const config = this.getVariantConfig('shelf_order_v1');
    if (!config || !config.customOrder) {
      return defaultOrder;
    }

    // Apply custom shelf ordering
    const orderedSections: LibrarySection[] = [];
    const sectionMap = new Map(
      defaultOrder.map(section => [section.id, section]),
    );

    // Add sections in custom order
    for (const sectionId of config.customOrder) {
      const section = sectionMap.get(sectionId);
      if (section) {
        orderedSections.push(section);
        sectionMap.delete(sectionId);
      }
    }

    // Add remaining sections
    orderedSections.push(...Array.from(sectionMap.values()));

    return orderedSections;
  }

  // Get search suggestions configuration
  getSearchSuggestionsConfig(): {
    enabled: boolean;
    maxSuggestions: number;
    showRecent: boolean;
  } {
    const config = this.getVariantConfig('search_suggestions_v1');

    return {
      enabled: config?.enabled ?? true,
      maxSuggestions: config?.maxSuggestions ?? 5,
      showRecent: config?.showRecent ?? true,
    };
  }

  // Get premium gate timing configuration
  getPremiumGateConfig(): {
    freeWorkoutLimit: number;
    showPreview: boolean;
    trialLength: number;
  } {
    const config = this.getVariantConfig('premium_gate_timing_v1');

    return {
      freeWorkoutLimit: config?.freeWorkoutLimit ?? 3,
      showPreview: config?.showPreview ?? true,
      trialLength: config?.trialLength ?? 7,
    };
  }

  // Track experiment exposure
  trackExposure(experimentId: string, context?: Record<string, any>): void {
    const variantId = this.getVariant(experimentId);
    if (!variantId) return;

    analyticsService.track('ab_test_exposure', {
      experiment_id: experimentId,
      variant_id: variantId,
      ...context,
    });
  }

  // Track conversion event
  trackConversion(
    experimentId: string,
    conversionType: string,
    value?: number,
  ): void {
    const variantId = this.getVariant(experimentId);
    if (!variantId) return;

    analyticsService.track('ab_test_conversion', {
      experiment_id: experimentId,
      variant_id: variantId,
      conversion_type: conversionType,
      conversion_value: value,
    });
  }

  // Refresh experiments from server
  private async refreshExperiments(): Promise<void> {
    if (!this.config.apiEndpoint) {
      // Load mock experiments for development
      this.loadMockExperiments();
      return;
    }

    try {
      const response = await fetch(`${this.config.apiEndpoint}/experiments`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch experiments: ${response.status}`);
      }

      const data = await response.json();
      const experiments: Experiment[] = data.experiments || [];

      // Update experiments map
      this.experiments.clear();
      experiments.forEach(experiment => {
        this.experiments.set(experiment.id, experiment);
      });

      // Cache experiments
      await this.cacheExperiments();
      this.lastRefresh = Date.now();

      if (this.config.debug) {
        console.log(
          `[A/B Testing] Refreshed ${experiments.length} experiments`,
        );
      }
    } catch (error) {
      console.error('[A/B Testing] Failed to refresh experiments:', error);
    }
  }

  // Check if user is eligible for experiment
  private isUserEligible(experiment: Experiment): boolean {
    // Check traffic allocation
    const userHash = this.hashUserId(this.userId || 'anonymous');
    const trafficBucket = userHash % 100;

    if (trafficBucket >= experiment.trafficAllocation) {
      return false;
    }

    // Check target audience (simplified)
    if (experiment.targetAudience) {
      // In a real implementation, would check user properties
      // For now, assume all users are eligible
    }

    return true;
  }

  // Assign user to variant based on weights
  private assignUserToVariant(experiment: Experiment): string {
    const userHash = this.hashUserId(this.userId || 'anonymous');
    const bucket = userHash % 100;

    let cumulativeWeight = 0;
    for (const variant of experiment.variants) {
      cumulativeWeight += variant.weight;
      if (bucket < cumulativeWeight) {
        return variant.id;
      }
    }

    // Fallback to default variant
    return experiment.defaultVariant;
  }

  // Hash user ID for consistent bucketing
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Load cached data
  private async loadCachedData(): Promise<void> {
    try {
      // Load experiments
      const cachedExperiments = await AsyncStorage.getItem('@ab_experiments');
      if (cachedExperiments) {
        const experiments: Experiment[] = JSON.parse(cachedExperiments);
        experiments.forEach(experiment => {
          this.experiments.set(experiment.id, experiment);
        });
      }

      // Load user assignments
      const cachedAssignments = await AsyncStorage.getItem('@ab_assignments');
      if (cachedAssignments) {
        const assignments: UserAssignment[] = JSON.parse(cachedAssignments);
        assignments.forEach(assignment => {
          this.userAssignments.set(assignment.experimentId, assignment);
        });
      }
    } catch (error) {
      console.error('[A/B Testing] Failed to load cached data:', error);
    }
  }

  // Cache experiments
  private async cacheExperiments(): Promise<void> {
    try {
      const experiments = Array.from(this.experiments.values());
      await AsyncStorage.setItem(
        '@ab_experiments',
        JSON.stringify(experiments),
      );
    } catch (error) {
      console.error('[A/B Testing] Failed to cache experiments:', error);
    }
  }

  // Save user assignments
  private async saveUserAssignments(): Promise<void> {
    try {
      const assignments = Array.from(this.userAssignments.values());
      await AsyncStorage.setItem(
        '@ab_assignments',
        JSON.stringify(assignments),
      );
    } catch (error) {
      console.error('[A/B Testing] Failed to save user assignments:', error);
    }
  }

  // Start refresh timer
  private startRefreshTimer(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    this.refreshTimer = setInterval(() => {
      this.refreshExperiments();
    }, this.config.refreshInterval);
  }

  // Load mock experiments for development
  private loadMockExperiments(): void {
    const mockExperiments: Experiment[] = [
      {
        id: 'shelf_order_v1',
        name: 'Library Shelf Order Test',
        type: 'shelf_order',
        status: 'active',
        startDate: '2024-01-01T00:00:00Z',
        trafficAllocation: 50,
        defaultVariant: 'control',
        variants: [
          {
            id: 'control',
            name: 'Original Order',
            weight: 50,
            config: {},
          },
          {
            id: 'programs_first',
            name: 'Programs First',
            weight: 50,
            config: {
              customOrder: [
                'continue',
                'programs',
                'recommended',
                'quickStart',
                'challenges',
                'knowledge',
              ],
            },
          },
        ],
      },
      {
        id: 'search_suggestions_v1',
        name: 'Search Suggestions Test',
        type: 'search_suggestions',
        status: 'active',
        startDate: '2024-01-01T00:00:00Z',
        trafficAllocation: 30,
        defaultVariant: 'control',
        variants: [
          {
            id: 'control',
            name: 'Standard Suggestions',
            weight: 50,
            config: {
              enabled: true,
              maxSuggestions: 5,
              showRecent: true,
            },
          },
          {
            id: 'enhanced',
            name: 'Enhanced Suggestions',
            weight: 50,
            config: {
              enabled: true,
              maxSuggestions: 8,
              showRecent: true,
            },
          },
        ],
      },
    ];

    mockExperiments.forEach(experiment => {
      this.experiments.set(experiment.id, experiment);
    });

    if (this.config.debug) {
      console.log('[A/B Testing] Loaded mock experiments');
    }
  }

  // Set user ID
  setUserId(userId: string): void {
    this.userId = userId;
  }

  // Get experiment summary
  getExperimentSummary(): {
    totalExperiments: number;
    activeExperiments: number;
    userAssignments: number;
  } {
    const activeCount = Array.from(this.experiments.values()).filter(
      exp => exp.status === 'active',
    ).length;

    return {
      totalExperiments: this.experiments.size,
      activeExperiments: activeCount,
      userAssignments: this.userAssignments.size,
    };
  }

  // Clear all A/B test data
  async clearABTestData(): Promise<void> {
    this.experiments.clear();
    this.userAssignments.clear();

    await AsyncStorage.multiRemove(['@ab_experiments', '@ab_assignments']);

    if (this.config.debug) {
      console.log('[A/B Testing] Cleared all A/B test data');
    }
  }

  // Shutdown service
  shutdown(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }
}

// Export singleton instance
export const abTestingService = ABTestingService.getInstance();
