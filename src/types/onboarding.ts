import { Goal, Level, Equipment, Location } from '../types/library';

export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'low' | 'moderate' | 'high';

export type OnboardingProfile = {
  age?: number;
  heightCm?: number;
  weightKg?: number;
  gender?: Gender;
  goals: Goal[];
  level?: Level;
  equipment: Equipment[];
  locations: Location[];
  motivation?: string;
  notificationsOptIn?: boolean;
};

export type OnboardingState = {
  loading: boolean;
  hasOnboarded: boolean;
  profile: OnboardingProfile;
};

export type OnboardingActions = {
  updateProfile: (patch: Partial<OnboardingProfile>) => void;
  setHasOnboarded: (val: boolean) => Promise<void>;
  resetOnboarding: () => Promise<void>;
};

export const DEFAULT_ONBOARDING_PROFILE: OnboardingProfile = {
  goals: [],
  equipment: [],
  locations: [],
};