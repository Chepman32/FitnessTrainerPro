// Content Types
export type ContentType = 'program' | 'challenge' | 'workout' | 'article';

export type BaseContent = {
  id: string;
  title: string;
  coverUrl?: string;
  premium: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

// Filter Types
export type Equipment =
  | 'none'
  | 'dumbbells'
  | 'bands'
  | 'kettlebell'
  | 'barbell'
  | 'machines';
export type Location = 'home' | 'gym' | 'outdoor' | 'office';
export type Goal = 'fat_loss' | 'muscle' | 'mobility' | 'cardio' | 'strength';
export type Level = 'Beginner' | 'Intermediate' | 'Advanced';

export type Program = BaseContent & {
  type: 'program';
  weeks: number;
  sessionsPerWeek: number;
  level: Level;
  equipment: Equipment[];
  locations: Location[];
  goals: Goal[];
  totalWorkouts: number;
  estimatedCalories: number;
  // Optional: Complex Training Program data for timed workouts
  complexProgram?: import('../types/program').Program;
};

export type Challenge = BaseContent & {
  type: 'challenge';
  durationDays: number;
  metricType: 'time' | 'reps' | 'distance' | 'calories';
  participantsCount: number;
  friendsCount: number;
  joined: boolean;
  startDate?: string;
  endDate?: string;
};

export type Workout = BaseContent & {
  type: 'workout';
  durationMinutes: number;
  level: Level;
  equipment: Equipment[];
  locations: Location[];
  goals: Goal[];
  exercises: string[]; // Exercise IDs from existing trainingTypes
  estimatedCalories: number;
};

export type Article = BaseContent & {
  type: 'article';
  readTimeMinutes: number;
  topic: string;
  publishedAt: string;
  thumbnailUrl?: string;
  excerpt: string;
  author: string;
};

// Union type for all content
export type Content = Program | Challenge | Workout | Article;

// Progress Tracking
export type UserProgress = {
  entityId: string;
  entityType: ContentType;
  progressPercent: number;
  currentWeek?: number;
  currentSession?: number;
  lastAccessedAt: string;
  completedAt?: string;
};

// Library State
export type LibraryFilters = {
  contentTypes: ContentType[];
  goals: Goal[];
  levels: Level[];
  locations: Location[];
  equipment: Equipment[];
  durationRange: [number, number]; // [min, max] minutes
  programWeeksRange: [number, number]; // [min, max] weeks
  sortBy: 'recommended' | 'popular' | 'newest' | 'shortest';
};

export type LibrarySection = {
  id: string;
  type:
    | 'continue'
    | 'recommended'
    | 'quickStart'
    | 'programs'
    | 'challenges'
    | 'trainAnywhere'
    | 'knowledge'
    | 'popular';
  title: string;
  items: Content[];
  hasMore: boolean;
  nextCursor?: string;
};

// Context State Types
export type LibraryState = {
  sections: LibrarySection[];
  filters: LibraryFilters;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  lastRefresh: string | null;
};

export type LibraryActions = {
  updateFilters: (filters: Partial<LibraryFilters>) => void;
  setSearchQuery: (query: string) => void;
  refreshLibrary: () => Promise<void>;
  loadMoreSection: (sectionId: string) => Promise<void>;
  clearFilters: () => void;
};

export type ProgressState = {
  userProgress: Record<string, UserProgress>;
  isLoading: boolean;
};

export type ProgressActions = {
  updateProgress: (entityId: string, progress: Partial<UserProgress>) => void;
  getProgress: (entityId: string) => UserProgress | null;
  getContinueItems: () => UserProgress[];
};

// Default filter state
export const DEFAULT_FILTERS: LibraryFilters = {
  contentTypes: [],
  goals: [],
  levels: [],
  locations: [],
  equipment: [],
  durationRange: [0, 180], // 0 to 180 minutes
  programWeeksRange: [1, 52], // 1 to 52 weeks
  sortBy: 'recommended',
};
