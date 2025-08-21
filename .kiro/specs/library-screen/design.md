# Design Document

## Overview

The Library Screen serves as the primary content discovery interface for the fitness app, providing users with organized access to programs, challenges, quick workouts, and knowledge content. The design integrates seamlessly with the existing React Native architecture while introducing new data models and state management patterns for content browsing, filtering, and premium feature gating.

## Architecture

### Component Hierarchy

```
LibraryScreen
├── LibraryHeader (search + filters)
├── FilterChips (sticky horizontal scroll)
├── LibrarySections (vertical scroll)
│   ├── ContinueSection
│   ├── RecommendedSection  
│   ├── QuickStartSection
│   ├── ProgramsSection
│   ├── ChallengesSection
│   ├── TrainAnywhereSection
│   └── KnowledgeSection
└── LibraryBottomSheet (filters/sort)
```

### State Management

Building on the existing context pattern, we'll introduce:

- `LibraryContext` - Content state, filters, search
- `UserProgressContext` - Progress tracking for programs/challenges
- Integration with existing `PreferencesContext` for personalization

### Navigation Integration

The Library Screen integrates with the existing navigation structure:
- Replaces or supplements the current HomeScreen as primary discovery
- Navigates to new detail screens (ProgramDetail, ChallengeDetail, ArticleDetail)
- Maintains existing navigation to TrainingScreen for workout execution

## Components and Interfaces

### Core Data Models

```typescript
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

export type Program = BaseContent & {
  type: 'program';
  weeks: number;
  sessionsPerWeek: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  equipment: Equipment[];
  locations: Location[];
  goals: Goal[];
  totalWorkouts: number;
  estimatedCalories: number;
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
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  equipment: Equipment[];
  locations: Location[];
  goals: Goal[];
  exercises: Exercise[];
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

// Filter Types
export type Equipment = 'none' | 'dumbbells' | 'bands' | 'kettlebell' | 'barbell' | 'machines';
export type Location = 'home' | 'gym' | 'outdoor' | 'office';
export type Goal = 'fat_loss' | 'muscle' | 'mobility' | 'cardio' | 'strength';
export type Level = 'Beginner' | 'Intermediate' | 'Advanced';

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
  type: 'continue' | 'recommended' | 'quickStart' | 'programs' | 'challenges' | 'trainAnywhere' | 'knowledge' | 'popular';
  title: string;
  items: (Program | Challenge | Workout | Article)[];
  hasMore: boolean;
  nextCursor?: string;
};
```

### Context Definitions

```typescript
// LibraryContext
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

// UserProgressContext  
export type ProgressState = {
  userProgress: Record<string, UserProgress>;
  isLoading: boolean;
};

export type ProgressActions = {
  updateProgress: (entityId: string, progress: Partial<UserProgress>) => void;
  getProgress: (entityId: string) => UserProgress | null;
  getContinueItems: () => UserProgress[];
};
```

### Component Specifications

#### LibraryScreen
- **Purpose**: Main container managing overall library state and navigation
- **Props**: Navigation props
- **State**: Manages filter visibility, search focus, scroll position
- **Key Features**: Pull-to-refresh, infinite scroll, search integration

#### LibraryHeader
- **Purpose**: Search input and primary navigation
- **Props**: `searchQuery`, `onSearchChange`, `onSearchFocus`
- **Features**: Search suggestions, voice search icon (future), clear button

#### FilterChips
- **Purpose**: Horizontal scrollable filter chips with sticky behavior
- **Props**: `filters`, `onFilterChange`, `activeFilters`
- **Features**: Multi-select, reset button, smooth scrolling to active chips

#### ContentCard Components

**ProgramCard**
- Shows cover image, title, duration, level badge, equipment icons
- Progress ring for enrolled programs
- Premium badge and lock state
- CTA: "Start", "Continue", or "Sample"

**ChallengeCard**  
- Shows title, duration, participant count, friends indicator
- Join status and CTA
- Premium badge for creation features

**WorkoutCard**
- Shows title, duration, equipment, level
- Quick start CTA
- Difficulty and calorie indicators

**ArticleCard**
- Shows thumbnail, title, reading time, topic tag
- Publication date and author
- Premium badge where applicable

#### LibrarySections
- **Purpose**: Vertical scrolling container for all content sections
- **Features**: Lazy loading, skeleton states, error boundaries
- **Sections**: Continue, Recommended, Quick Start, Programs, Challenges, Train Anywhere, Knowledge

## Data Models

### API Integration

The design assumes a REST API with the following endpoints:

```typescript
// API Endpoints
GET /api/library/sections
- Query: userId, filters, search, cursor
- Response: { sections: LibrarySection[], nextCursor?: string }

GET /api/library/search  
- Query: q, filters, cursor
- Response: { items: Content[], suggestions: string[], nextCursor?: string }

GET /api/library/section/{sectionId}
- Query: cursor, limit
- Response: { items: Content[], nextCursor?: string }

POST /api/user/progress
- Body: { entityId, entityType, progress }
- Response: { success: boolean }

GET /api/user/progress
- Response: { progress: UserProgress[] }
```

### Local Storage Strategy

```typescript
// AsyncStorage Keys
const STORAGE_KEYS = {
  LIBRARY_CACHE: '@library_cache',
  USER_PROGRESS: '@user_progress', 
  FILTER_PREFERENCES: '@filter_preferences',
  SEARCH_HISTORY: '@search_history'
};

// Cache Strategy
type CacheEntry = {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
};

// Cache TTL Configuration
const CACHE_TTL = {
  LIBRARY_SECTIONS: 24 * 60 * 60 * 1000, // 24 hours
  SEARCH_RESULTS: 60 * 60 * 1000, // 1 hour
  USER_PROGRESS: 7 * 24 * 60 * 60 * 1000, // 7 days
};
```

## Error Handling

### Error States and Recovery

1. **Network Errors**
   - Show cached content with offline indicator
   - Retry mechanism with exponential backoff
   - Graceful degradation to essential features

2. **Content Loading Errors**
   - Per-section error states with retry buttons
   - Skeleton loading states during retries
   - Fallback to cached content

3. **Search Errors**
   - Show recent searches and suggestions
   - Clear error state on new search
   - Maintain filter state during errors

4. **Premium Content Errors**
   - Clear messaging about subscription requirements
   - Graceful paywall presentation
   - Maintain free content access

### Error Boundaries

```typescript
// LibraryErrorBoundary
export class LibraryErrorBoundary extends React.Component {
  // Catches errors in library components
  // Provides fallback UI with retry options
  // Logs errors for analytics
}

// SectionErrorBoundary  
export class SectionErrorBoundary extends React.Component {
  // Isolates errors to individual sections
  // Allows other sections to continue working
  // Provides section-specific retry
}
```

## Testing Strategy

### Unit Testing
- Context providers and reducers
- Individual component rendering and interactions
- Filter logic and search functionality
- Progress tracking calculations
- Cache management utilities

### Integration Testing
- API integration with mock responses
- Navigation flows between screens
- Filter application and result updates
- Premium content gating
- Offline functionality

### E2E Testing
- Complete user journeys from library to workout
- Search and filter combinations
- Premium upgrade flows
- Progress tracking across sessions
- Performance under various network conditions

### Performance Testing
- Large content list rendering
- Image loading and caching
- Search response times
- Memory usage during extended browsing
- Battery impact assessment

## Accessibility Implementation

### Screen Reader Support
- Semantic labeling for all interactive elements
- Content descriptions for images and icons
- Progress announcements for loading states
- Filter state announcements

### Navigation Support
- Logical focus order through sections
- Keyboard navigation for all interactions
- Focus management during screen transitions
- Skip links for long content lists

### Visual Accessibility
- WCAG AA contrast compliance
- Dynamic type support with proper scaling
- Color-blind friendly filter indicators
- High contrast mode support

### Motor Accessibility
- Minimum 44x44pt touch targets
- Gesture alternatives for swipe actions
- Voice control compatibility
- Switch control support

## Performance Considerations

### Rendering Optimization
- FlatList virtualization for long content lists
- Image lazy loading with placeholder states
- Component memoization for expensive renders
- Debounced search input handling

### Memory Management
- Proper cleanup of event listeners
- Image cache size limits
- Background task management
- Memory leak prevention in contexts

### Network Optimization
- Request deduplication for concurrent calls
- Intelligent prefetching based on user behavior
- Compression for API responses
- CDN integration for media assets

### Battery Optimization
- Reduced background processing
- Efficient animation usage
- Location services optimization
- Network request batching

This design provides a comprehensive foundation for implementing the Library Screen while maintaining consistency with the existing app architecture and ensuring scalability for future enhancements.