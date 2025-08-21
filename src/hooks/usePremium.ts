import { useState, useEffect, useCallback } from 'react';
import {
  premiumService,
  PremiumStatus,
  UserSubscription,
  UsageQuota,
} from '../services/premiumService';
import { Content } from '../types/library';

export const usePremium = () => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null,
  );
  const [usageQuota, setUsageQuota] = useState<UsageQuota | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize premium service and load data
  useEffect(() => {
    const initialize = async () => {
      try {
        await premiumService.initialize();
        setSubscription(premiumService.getSubscriptionStatus());
        setUsageQuota(premiumService.getUsageQuota());
      } catch (error) {
        console.error('Failed to initialize premium service:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // Check if user has premium access
  const hasPremiumAccess = useCallback((): boolean => {
    return premiumService.hasPremiumAccess();
  }, []);

  // Check if content is accessible
  const canAccessContent = useCallback((content: Content) => {
    return premiumService.canAccessContent(content);
  }, []);

  // Check if user can start a workout
  const canStartWorkout = useCallback(() => {
    return premiumService.canStartWorkout();
  }, []);

  // Check if user can start a program
  const canStartProgram = useCallback(() => {
    return premiumService.canStartProgram();
  }, []);

  // Record workout usage
  const recordWorkoutUsage = useCallback(async () => {
    await premiumService.recordWorkoutUsage();
    setUsageQuota(premiumService.getUsageQuota());
  }, []);

  // Record program usage
  const recordProgramUsage = useCallback(async () => {
    await premiumService.recordProgramUsage();
    setUsageQuota(premiumService.getUsageQuota());
  }, []);

  // Start free trial
  const startFreeTrial = useCallback(async (): Promise<boolean> => {
    const success = await premiumService.startFreeTrial();
    if (success) {
      setSubscription(premiumService.getSubscriptionStatus());
    }
    return success;
  }, []);

  // Upgrade to premium
  const upgradeToPremium = useCallback(
    async (plan: 'monthly' | 'yearly'): Promise<boolean> => {
      const success = await premiumService.upgradeToPremium(plan);
      if (success) {
        setSubscription(premiumService.getSubscriptionStatus());
        setUsageQuota(premiumService.getUsageQuota());
      }
      return success;
    },
    [],
  );

  // Get remaining quota
  const getRemainingQuota = useCallback(() => {
    return premiumService.getRemainingQuota();
  }, []);

  // Get premium status
  const getPremiumStatus = useCallback((): PremiumStatus => {
    return subscription?.status || 'free';
  }, [subscription]);

  // Check if user is on trial
  const isOnTrial = useCallback((): boolean => {
    return subscription?.status === 'trial';
  }, [subscription]);

  // Get trial days remaining
  const getTrialDaysRemaining = useCallback((): number => {
    if (
      !subscription ||
      subscription.status !== 'trial' ||
      !subscription.trialEndDate
    ) {
      return 0;
    }

    const now = new Date();
    const trialEnd = new Date(subscription.trialEndDate);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }, [subscription]);

  // Reset to free (for testing)
  const resetToFree = useCallback(async () => {
    await premiumService.resetToFree();
    setSubscription(premiumService.getSubscriptionStatus());
    setUsageQuota(premiumService.getUsageQuota());
  }, []);

  return {
    // State
    subscription,
    usageQuota,
    isLoading,

    // Premium status checks
    hasPremiumAccess,
    getPremiumStatus,
    isOnTrial,
    getTrialDaysRemaining,

    // Content access checks
    canAccessContent,
    canStartWorkout,
    canStartProgram,

    // Usage tracking
    recordWorkoutUsage,
    recordProgramUsage,
    getRemainingQuota,

    // Subscription management
    startFreeTrial,
    upgradeToPremium,
    resetToFree,
  };
};
