import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  LibraryFilters,
  Goal,
  Level,
  Location,
  Equipment,
  ContentType,
} from '../../types/library';
import { useLibrary } from '../../state/LibraryContext';
import { AccessibilityUtils, useAccessibility } from '../../utils/accessibility';

type FilterChipData = {
  id: string;
  label: string;
  icon?: string;
  type:
    | 'contentType'
    | 'goal'
    | 'level'
    | 'location'
    | 'equipment'
    | 'duration'
    | 'sort';
  value: any;
};

const QUICK_FILTERS: FilterChipData[] = [
  { id: 'all', label: 'All', type: 'contentType', value: [] },
  {
    id: 'programs',
    label: 'Programs',
    type: 'contentType',
    value: ['program'],
  },
  {
    id: 'challenges',
    label: 'Challenges',
    type: 'contentType',
    value: ['challenge'],
  },
  {
    id: 'workouts',
    label: 'Workouts',
    type: 'contentType',
    value: ['workout'],
  },
  {
    id: 'articles',
    label: 'Articles',
    type: 'contentType',
    value: ['article'],
  },
];

const GOAL_FILTERS: FilterChipData[] = [
  {
    id: 'fat_loss',
    label: 'Fat Loss',
    icon: 'flame-outline',
    type: 'goal',
    value: 'fat_loss',
  },
  {
    id: 'muscle',
    label: 'Muscle',
    icon: 'fitness-outline',
    type: 'goal',
    value: 'muscle',
  },
  {
    id: 'cardio',
    label: 'Cardio',
    icon: 'heart-outline',
    type: 'goal',
    value: 'cardio',
  },
  {
    id: 'strength',
    label: 'Strength',
    icon: 'barbell-outline',
    type: 'goal',
    value: 'strength',
  },
  {
    id: 'mobility',
    label: 'Mobility',
    icon: 'body-outline',
    type: 'goal',
    value: 'mobility',
  },
];

const LEVEL_FILTERS: FilterChipData[] = [
  { id: 'beginner', label: 'Beginner', type: 'level', value: 'Beginner' },
  {
    id: 'intermediate',
    label: 'Intermediate',
    type: 'level',
    value: 'Intermediate',
  },
  { id: 'advanced', label: 'Advanced', type: 'level', value: 'Advanced' },
];

const LOCATION_FILTERS: FilterChipData[] = [
  {
    id: 'home',
    label: 'At Home',
    icon: 'home-outline',
    type: 'location',
    value: 'home',
  },
  {
    id: 'gym',
    label: 'Gym',
    icon: 'barbell-outline',
    type: 'location',
    value: 'gym',
  },
  {
    id: 'outdoor',
    label: 'Outdoor',
    icon: 'leaf-outline',
    type: 'location',
    value: 'outdoor',
  },
  {
    id: 'office',
    label: 'Office',
    icon: 'business-outline',
    type: 'location',
    value: 'office',
  },
];

const EQUIPMENT_FILTERS: FilterChipData[] = [
  {
    id: 'none',
    label: 'No Equipment',
    icon: 'body-outline',
    type: 'equipment',
    value: 'none',
  },
  {
    id: 'dumbbells',
    label: 'Dumbbells',
    icon: 'barbell-outline',
    type: 'equipment',
    value: 'dumbbells',
  },
  { id: 'bands', label: 'Bands', type: 'equipment', value: 'bands' },
  {
    id: 'kettlebell',
    label: 'Kettlebell',
    type: 'equipment',
    value: 'kettlebell',
  },
];

const DURATION_FILTERS: FilterChipData[] = [
  { id: 'under-10', label: 'Under 10 min', type: 'duration', value: [0, 10] },
  { id: '10-20', label: '10-20 min', type: 'duration', value: [10, 20] },
  { id: '20-40', label: '20-40 min', type: 'duration', value: [20, 40] },
  { id: 'over-40', label: '40+ min', type: 'duration', value: [40, 180] },
];

const SORT_FILTERS: FilterChipData[] = [
  {
    id: 'recommended',
    label: 'Recommended',
    type: 'sort',
    value: 'recommended',
  },
  { id: 'popular', label: 'Popular', type: 'sort', value: 'popular' },
  { id: 'newest', label: 'Newest', type: 'sort', value: 'newest' },
  { id: 'shortest', label: 'Shortest', type: 'sort', value: 'shortest' },
];

type FilterBarProps = {
  showExtended?: boolean;
  onToggleExtended?: () => void;
};

export const FilterBar: React.FC<FilterBarProps> = ({
  showExtended = false,
  onToggleExtended,
}) => {
  const isDark = useColorScheme() === 'dark';
  const { state, actions } = useLibrary();
  const scrollViewRef = useRef<ScrollView>(null);

  const hasActiveFilters = () => {
    const { filters } = state;
    return (
      filters.contentTypes.length > 0 ||
      filters.goals.length > 0 ||
      filters.levels.length > 0 ||
      filters.locations.length > 0 ||
      filters.equipment.length > 0 ||
      filters.sortBy !== 'recommended'
    );
  };

  const isFilterActive = (filter: FilterChipData): boolean => {
    const { filters } = state;

    switch (filter.type) {
      case 'contentType':
        if (filter.value.length === 0) {
          return filters.contentTypes.length === 0;
        }
        return filter.value.every((type: ContentType) =>
          filters.contentTypes.includes(type),
        );

      case 'goal':
        return filters.goals.includes(filter.value);

      case 'level':
        return filters.levels.includes(filter.value);

      case 'location':
        return filters.locations.includes(filter.value);

      case 'equipment':
        return filters.equipment.includes(filter.value);

      case 'duration':
        const [min, max] = filter.value;
        return (
          filters.durationRange[0] === min && filters.durationRange[1] === max
        );

      case 'sort':
        return filters.sortBy === filter.value;

      default:
        return false;
    }
  };

  const handleFilterPress = (filter: FilterChipData) => {
    const { filters } = state;
    let newFilters: Partial<LibraryFilters> = {};

    switch (filter.type) {
      case 'contentType':
        newFilters.contentTypes = filter.value;
        break;

      case 'goal':
        const currentGoals = [...filters.goals];
        const goalIndex = currentGoals.indexOf(filter.value);
        if (goalIndex >= 0) {
          currentGoals.splice(goalIndex, 1);
        } else {
          currentGoals.push(filter.value);
        }
        newFilters.goals = currentGoals;
        break;

      case 'level':
        const currentLevels = [...filters.levels];
        const levelIndex = currentLevels.indexOf(filter.value);
        if (levelIndex >= 0) {
          currentLevels.splice(levelIndex, 1);
        } else {
          currentLevels.push(filter.value);
        }
        newFilters.levels = currentLevels;
        break;

      case 'location':
        const currentLocations = [...filters.locations];
        const locationIndex = currentLocations.indexOf(filter.value);
        if (locationIndex >= 0) {
          currentLocations.splice(locationIndex, 1);
        } else {
          currentLocations.push(filter.value);
        }
        newFilters.locations = currentLocations;
        break;

      case 'equipment':
        const currentEquipment = [...filters.equipment];
        const equipmentIndex = currentEquipment.indexOf(filter.value);
        if (equipmentIndex >= 0) {
          currentEquipment.splice(equipmentIndex, 1);
        } else {
          currentEquipment.push(filter.value);
        }
        newFilters.equipment = currentEquipment;
        break;

      case 'duration':
        newFilters.durationRange = filter.value;
        break;

      case 'sort':
        newFilters.sortBy = filter.value;
        break;
    }

    actions.updateFilters(newFilters);
  };

  const renderFilterChip = (filter: FilterChipData) => {
    const isActive = isFilterActive(filter);

    return (
      <Pressable
        key={filter.id}
        style={[
          styles.chip,
          isDark ? styles.chipDark : styles.chipLight,
          isActive && (isDark ? styles.chipActiveDark : styles.chipActiveLight),
        ]}
        onPress={() => handleFilterPress(filter)}
        accessibilityRole="button"
        accessibilityLabel={`Filter by ${filter.label}`}
        accessibilityState={{ selected: isActive }}
      >
        {filter.icon && (
          <Ionicons
            name={filter.icon}
            size={16}
            color={isActive ? '#FFFFFF' : isDark ? '#FFFFFF' : '#333333'}
            style={styles.chipIcon}
          />
        )}
        <Text
          style={[
            styles.chipText,
            isDark ? styles.chipTextDark : styles.chipTextLight,
            isActive && styles.chipTextActive,
          ]}
        >
          {filter.label}
        </Text>
      </Pressable>
    );
  };

  const renderFilterSection = (title: string, filters: FilterChipData[]) => (
    <View style={styles.filterSection}>
      <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
        {title}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {filters.map(renderFilterChip)}
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Quick Filters Row */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickFiltersRow}
      >
        {QUICK_FILTERS.map(renderFilterChip)}

        {/* Clear Filters Button */}
        {hasActiveFilters() && (
          <Pressable
            style={[styles.chip, styles.clearChip]}
            onPress={actions.clearFilters}
            accessibilityRole="button"
            accessibilityLabel="Clear all filters"
          >
            <Ionicons name="close" size={16} color="#FF6B6B" />
            <Text style={styles.clearChipText}>Clear</Text>
          </Pressable>
        )}

        {/* More Filters Button */}
        <Pressable
          style={[styles.chip, styles.moreChip]}
          onPress={onToggleExtended}
          accessibilityRole="button"
          accessibilityLabel={
            showExtended ? 'Hide filters' : 'Show more filters'
          }
        >
          <Ionicons
            name={showExtended ? 'chevron-up' : 'tune'}
            size={16}
            color="#5B9BFF"
          />
          <Text style={styles.moreChipText}>
            {showExtended ? 'Less' : 'Filters'}
          </Text>
        </Pressable>
      </ScrollView>

      {/* Extended Filters */}
      {showExtended && (
        <View style={styles.extendedFilters}>
          {renderFilterSection('Goals', GOAL_FILTERS)}
          {renderFilterSection('Level', LEVEL_FILTERS)}
          {renderFilterSection('Location', LOCATION_FILTERS)}
          {renderFilterSection('Equipment', EQUIPMENT_FILTERS)}
          {renderFilterSection('Duration', DURATION_FILTERS)}
          {renderFilterSection('Sort by', SORT_FILTERS)}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  containerDark: {
    backgroundColor: '#1A1A1A',
    borderBottomColor: '#333333',
  },

  quickFiltersRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 36,
  },
  chipLight: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E5E5E5',
  },
  chipDark: {
    backgroundColor: '#2A2A2A',
    borderColor: '#404040',
  },
  chipActiveLight: {
    backgroundColor: '#5B9BFF',
    borderColor: '#5B9BFF',
  },
  chipActiveDark: {
    backgroundColor: '#5B9BFF',
    borderColor: '#5B9BFF',
  },

  chipIcon: {
    marginRight: 6,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextLight: {
    color: '#333333',
  },
  chipTextDark: {
    color: '#FFFFFF',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },

  clearChip: {
    backgroundColor: '#FFE5E5',
    borderColor: '#FF6B6B',
  },
  clearChipText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },

  moreChip: {
    backgroundColor: '#E3F2FD',
    borderColor: '#5B9BFF',
  },
  moreChipText: {
    color: '#5B9BFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },

  extendedFilters: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  sectionTitleDark: {
    color: '#FFFFFF',
  },
  chipRow: {
    gap: 8,
  },
});
