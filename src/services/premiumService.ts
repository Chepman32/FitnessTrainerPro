import AsyncStorage from '@react-native-async-storage/async-storage';
import { Content } from '../types/library';

export type PremiumStatus = 'free' | 'trial' | 'premium';

export type UserSubscription = {
  status: PremiumStatus;
  trialStartDate?: string;
  trialEndDate?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  plan?: 'monthly' | 'yearly';
  autoRenew: boolean;
};

export type UsageQuota = {
  dailyWorkouts: {
    used: number;
    limit: number;
    resetDate: string;
  };
  weeklyPrograms: {
    used: number;
    limit: number;
    resetDate: string;
  };
};

const STORAGE_KEYS = {
  SUBSCRIPTION: '@user_subscription',
  USAGE_QUOTA: '@usage_quota',
  PREMIUM_CONTENT_ACCESS: '@premium_content_access',
};

export class PremiumService {
  private static instance: PremiumService;
  private subscription: UserSubscription | null = null;
  private usageQuota: UsageQuota | null = null;

  static getInstance(): PremiumService {
    if (!PremiumService.instance) {
      PremiumService.instance = new PremiumService();
    }
    return PremiumService.instance;
  }

  // Initialize premium service
  async initialize(): Promise<void> {
    try {
      await this.loadSubscriptionStatus();
      await this.loadUsageQuota();
    } catch (error) {
      console.error('Failed to initialize premium service:', error);
    }
  }

  // Load subscription status from storage
  private async loadSubscriptionStatus(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
      if (stored) {
        this.subscription = JSON.parse(stored);
      } else {
        // Default to free user
        this.subscription = {
          status: 'free',
          autoRenew: false,
        };
        await this.saveSubscriptionStatus();
      }
    } catch (error) {
      console.error('Failed to load subscription status:', error);
      this.subscription = { status: 'free', autoRenew: false };
    }
  }

  // Save subscription status to storage
  private async saveSubscriptionStatus(): Promise<void> {
    try {
      if (this.subscription) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.SUBSCRIPTION,
          JSON.stringify(this.subscription),
        );
      }
    } catch (error) {
      console.error('Failed to save subscription status:', error);
    }
  }

  // Load usage quota from storage
  private async loadUsageQuota(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.USAGE_QUOTA);
      if (stored) {
        this.usageQuota = JSON.parse(stored);
        // Check if quota needs reset
        await this.checkAndResetQuota();
      } else {
        // Initialize default quota
        this.usageQuota = this.createDefaultQuota();
        await this.saveUsageQuota();
      }
    } catch (error) {
      console.error('Failed to load usage quota:', error);
      this.usageQuota = this.createDefaultQuota();
    }
  }

  // Save usage quota to storage
  private async saveUsageQuota(): Promise<void> {
    try {
      if (this.usageQuota) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.USAGE_QUOTA,
          JSON.stringify(this.usageQuota),
        );
      }
    } catch (error) {
      console.error('Failed to save usage quota:', error);
    }
  }

  // Create default quota for free users
  private createDefaultQuota(): UsageQuota {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + (7 - now.getDay()));
    nextWeek.setHours(0, 0, 0, 0);

    return {
      dailyWorkouts: {
        used: 0,
        limit: 3, // Free users get 3 workouts per day
        resetDate: tomorrow.toISOString(),
      },
      weeklyPrograms: {
        used: 0,
        limit: 1, // Free users can start 1 program per week
        resetDate: nextWeek.toISOString(),
      },
    };
  }

  // Check and reset quota if needed
  private async checkAndResetQuota(): Promise<void> {
    if (!this.usageQuota) return;

    const now = new Date();
    let needsSave = false;

    // Reset daily quota
    if (new Date(this.usageQuota.dailyWorkouts.resetDate) <= now) {
      this.usageQuota.dailyWorkouts.used = 0;
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      this.usageQuota.dailyWorkouts.resetDate = tomorrow.toISOString();
      needsSave = true;
    }

    // Reset weekly quota
    if (new Date(this.usageQuota.weeklyPrograms.resetDate) <= now) {
      this.usageQuota.weeklyPrograms.used = 0;
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + (7 - now.getDay()));
      nextWeek.setHours(0, 0, 0, 0);
      this.usageQuota.weeklyPrograms.resetDate = nextWeek.toISOString();
      needsSave = true;
    }

    if (needsSave) {
      await this.saveUsageQuota();
    }
  }

  // Get current subscription status
  getSubscriptionStatus(): UserSubscription | null {
    return this.subscription;
  }

  // Check if user has premium access
  hasPremiumAccess(): boolean {
    if (!this.subscription) return false;

    const now = new Date();

    switch (this.subscription.status) {
      case 'premium':
        // Check if subscription is still valid
        if (this.subscription.subscriptionEndDate) {
          return new Date(this.subscription.subscriptionEndDate) > now;
        }
        return true;

      case 'trial':
        // Check if trial is still valid
        if (this.subscription.trialEndDate) {
          return new Date(this.subscription.trialEndDate) > now;
        }
        return false;

      case 'free':
      default:
        return false;
    }
  }

  // Check if content is accessible
  canAccessContent(content: Content): { canAccess: boolean; reason?: string } {
    // Premium users can access everything
    if (this.hasPremiumAccess()) {
      return { canAccess: true };
    }

    // Free content is always accessible
    if (!content.premium) {
      return { canAccess: true };
    }

    // Premium content requires subscription
    return {
      canAccess: false,
      reason: 'premium_required',
    };
  }

  // Check if user can start a workout
  canStartWorkout(): { canStart: boolean; reason?: string } {
    if (this.hasPremiumAccess()) {
      return { canStart: true };
    }

    if (!this.usageQuota) {
      return { canStart: false, reason: 'quota_unavailable' };
    }

    const { dailyWorkouts } = this.usageQuota;
    if (dailyWorkouts.used >= dailyWorkouts.limit) {
      return {
        canStart: false,
        reason: 'daily_limit_reached',
      };
    }

    return { canStart: true };
  }

  // Record workout usage
  async recordWorkoutUsage(): Promise<void> {
    if (this.hasPremiumAccess()) return; // No limits for premium users

    if (this.usageQuota) {
      this.usageQuota.dailyWorkouts.used += 1;
      await this.saveUsageQuota();
    }
  }

  // Check if user can start a program
  canStartProgram(): { canStart: boolean; reason?: string } {
    if (this.hasPremiumAccess()) {
      return { canStart: true };
    }

    if (!this.usageQuota) {
      return { canStart: false, reason: 'quota_unavailable' };
    }

    const { weeklyPrograms } = this.usageQuota;
    if (weeklyPrograms.used >= weeklyPrograms.limit) {
      return {
        canStart: false,
        reason: 'weekly_limit_reached',
      };
    }

    return { canStart: true };
  }

  // Record program usage
  async recordProgramUsage(): Promise<void> {
    if (this.hasPremiumAccess()) return; // No limits for premium users

    if (this.usageQuota) {
      this.usageQuota.weeklyPrograms.used += 1;
      await this.saveUsageQuota();
    }
  }

  // Start free trial
  async startFreeTrial(): Promise<boolean> {
    try {
      if (!this.subscription || this.subscription.status !== 'free') {
        return false; // Can only start trial from free status
      }

      const now = new Date();
      const trialEnd = new Date(now);
      trialEnd.setDate(trialEnd.getDate() + 7); // 7-day trial

      this.subscription = {
        ...this.subscription,
        status: 'trial',
        trialStartDate: now.toISOString(),
        trialEndDate: trialEnd.toISOString(),
      };

      await this.saveSubscriptionStatus();
      return true;
    } catch (error) {
      console.error('Failed to start free trial:', error);
      return false;
    }
  }

  // Upgrade to premium
  async upgradeToPremium(plan: 'monthly' | 'yearly'): Promise<boolean> {
    try {
      const now = new Date();
      const subscriptionEnd = new Date(now);

      if (plan === 'monthly') {
        subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
      } else {
        subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
      }

      this.subscription = {
        status: 'premium',
        plan,
        subscriptionStartDate: now.toISOString(),
        subscriptionEndDate: subscriptionEnd.toISOString(),
        autoRenew: true,
      };

      await this.saveSubscriptionStatus();
      return true;
    } catch (error) {
      console.error('Failed to upgrade to premium:', error);
      return false;
    }
  }

  // Get usage quota
  getUsageQuota(): UsageQuota | null {
    return this.usageQuota;
  }

  // Get remaining quota
  getRemainingQuota(): { dailyWorkouts: number; weeklyPrograms: number } {
    if (this.hasPremiumAccess()) {
      return { dailyWorkouts: Infinity, weeklyPrograms: Infinity };
    }

    if (!this.usageQuota) {
      return { dailyWorkouts: 0, weeklyPrograms: 0 };
    }

    return {
      dailyWorkouts: Math.max(
        0,
        this.usageQuota.dailyWorkouts.limit -
          this.usageQuota.dailyWorkouts.used,
      ),
      weeklyPrograms: Math.max(
        0,
        this.usageQuota.weeklyPrograms.limit -
          this.usageQuota.weeklyPrograms.used,
      ),
    };
  }

  // Reset to free (for testing)
  async resetToFree(): Promise<void> {
    this.subscription = {
      status: 'free',
      autoRenew: false,
    };
    this.usageQuota = this.createDefaultQuota();

    await this.saveSubscriptionStatus();
    await this.saveUsageQuota();
  }
}

// Export singleton instance
export const premiumService = PremiumService.getInstance();
