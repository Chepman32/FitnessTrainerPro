import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_ONBOARDING_PROFILE,
  OnboardingActions,
  OnboardingState,
  OnboardingProfile,
} from '../types/onboarding';

const STORAGE_PROFILE = '@onboarding_profile';
const STORAGE_COMPLETE = '@onboarding_complete';

const OnboardingContext = createContext<{
  state: OnboardingState;
  actions: OnboardingActions;
}>({
  state: { loading: true, hasOnboarded: false, profile: DEFAULT_ONBOARDING_PROFILE },
  actions: {
    updateProfile: () => {},
    setHasOnboarded: async () => {},
    resetOnboarding: async () => {},
  },
});

export const OnboardingProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [hasOnboarded, setHasOnboardedState] = useState(false);
  const [profile, setProfile] = useState<OnboardingProfile>(DEFAULT_ONBOARDING_PROFILE);

  // load on mount
  useEffect(() => {
    (async () => {
      try {
        const [pStr, cStr] = await Promise.all([
          AsyncStorage.getItem(STORAGE_PROFILE),
          AsyncStorage.getItem(STORAGE_COMPLETE),
        ]);
        if (pStr) setProfile(JSON.parse(pStr));
        if (cStr === 'true') setHasOnboardedState(true);
      } catch (e) {
        console.warn('Onboarding load failed', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persistProfile = useCallback(async (p: OnboardingProfile) => {
    try {
      await AsyncStorage.setItem(STORAGE_PROFILE, JSON.stringify(p));
    } catch (e) {
      console.warn('Failed to save onboarding profile', e);
    }
  }, []);

  const updateProfile = useCallback((patch: Partial<OnboardingProfile>) => {
    setProfile(prev => {
      const next = { ...prev, ...patch } as OnboardingProfile;
      // fire and forget
      persistProfile(next);
      return next;
    });
  }, [persistProfile]);

  const setHasOnboarded = useCallback(async (val: boolean) => {
    setHasOnboardedState(val);
    try {
      await AsyncStorage.setItem(STORAGE_COMPLETE, val ? 'true' : 'false');
    } catch (e) {
      console.warn('Failed to set onboarding complete', e);
    }
  }, []);

  const resetOnboarding = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_PROFILE),
        AsyncStorage.removeItem(STORAGE_COMPLETE),
      ]);
    } finally {
      setProfile(DEFAULT_ONBOARDING_PROFILE);
      setHasOnboardedState(false);
    }
  }, []);

  const state = useMemo<OnboardingState>(() => ({ loading, hasOnboarded, profile }), [loading, hasOnboarded, profile]);
  const actions = useMemo<OnboardingActions>(() => ({ updateProfile, setHasOnboarded, resetOnboarding }), [updateProfile, setHasOnboarded, resetOnboarding]);

  return (
    <OnboardingContext.Provider value={{ state, actions }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return {
    loading: ctx.state.loading,
    hasOnboarded: ctx.state.hasOnboarded,
    profile: ctx.state.profile,
    updateProfile: ctx.actions.updateProfile,
    setHasOnboarded: ctx.actions.setHasOnboarded,
    resetOnboarding: ctx.actions.resetOnboarding,
  };
};