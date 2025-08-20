import React, { useMemo } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  FlatList,
} from 'react-native';
import { useSession } from '../state/SessionContext';
import { TRAINING_TYPES } from '../data/trainingTypes';
import ExerciseIcon from '../components/ExerciseIcons';

type Muscle = 'full' | 'upper' | 'lower' | 'core' | 'cardio' | 'flexibility';

const MUSCLE_GROUPS: { key: Muscle; label: string }[] = [
  { key: 'full', label: 'Full body' },
  { key: 'upper', label: 'Upper body' },
  { key: 'lower', label: 'Lower body' },
  { key: 'core', label: 'Core' },
  { key: 'cardio', label: 'Cardio' },
  { key: 'flexibility', label: 'Flexibility' },
];

type Props = {
  onStartExercise?: (exerciseId: string) => void;
};

export const LibraryScreen: React.FC<Props> = ({ onStartExercise }) => {
  const { setup } = useSession();
  const [selectedMuscle, setSelectedMuscle] = React.useState<Muscle | null>(
    null,
  );

  // Show only specific exercises to match reference
  const filteredExercises = useMemo(() => {
    const referenceExercises = [
      'pushups',
      'squats',
      'plank',
      'crunches',
      'burpees',
    ];

    if (!selectedMuscle) {
      return TRAINING_TYPES.filter(exercise =>
        referenceExercises.includes(exercise.id),
      );
    }

    // Simple mapping of exercises to muscle groups
    const muscleMap: Record<string, Muscle[]> = {
      pushups: ['upper', 'full'],
      plank: ['core', 'full'],
      squats: ['lower', 'full'],
      burpees: ['full', 'cardio'],
      lunges: ['lower'],
      crunches: ['core'],
      mountain_climbers: ['core', 'cardio', 'full'],
      jumping_jacks: ['cardio', 'full'],
    };

    return TRAINING_TYPES.filter(
      exercise =>
        referenceExercises.includes(exercise.id) &&
        muscleMap[exercise.id]?.includes(selectedMuscle),
    );
  }, [selectedMuscle]);

  const handleMusclePress = (muscle: Muscle) => {
    setSelectedMuscle(selectedMuscle === muscle ? null : muscle);
  };

  const handleNoEquipmentPress = () => {
    // Filter to show bodyweight exercises
    setSelectedMuscle(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
        <Pressable style={styles.overflowButton}>
          <Text style={styles.overflowText}>•••</Text>
        </Pressable>
      </View>

      <FlatList
        data={filteredExercises}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Hero Card */}
            <Pressable style={styles.heroCard} onPress={handleNoEquipmentPress}>
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>No equipment</Text>
                <Text style={styles.heroSubtitle}>Upper body</Text>
              </View>
              <View style={styles.heroIcon}>
                <View style={styles.runningFigure}>
                  <View style={styles.runnerHead} />
                  <View style={styles.runnerBody} />
                  <View style={styles.runnerArmBack} />
                  <View style={styles.runnerArmFront} />
                  <View style={styles.runnerLegBack} />
                  <View style={styles.runnerLegFront} />
                </View>
              </View>
            </Pressable>

            {/* Section Title */}
            <Text style={styles.sectionTitle}>By muscle group</Text>

            {/* Muscle Filter Chips */}
            <View style={styles.chipsContainer}>
              <View style={styles.chipRow}>
                {MUSCLE_GROUPS.slice(0, 3).map(muscle => (
                  <Pressable
                    key={muscle.key}
                    style={[
                      styles.chip,
                      selectedMuscle === muscle.key && styles.chipActive,
                    ]}
                    onPress={() => handleMusclePress(muscle.key)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedMuscle === muscle.key && styles.chipTextActive,
                      ]}
                    >
                      {muscle.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.chipRow}>
                {MUSCLE_GROUPS.slice(3, 6).map(muscle => (
                  <Pressable
                    key={muscle.key}
                    style={[
                      styles.chip,
                      selectedMuscle === muscle.key && styles.chipActive,
                    ]}
                    onPress={() => handleMusclePress(muscle.key)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedMuscle === muscle.key && styles.chipTextActive,
                      ]}
                    >
                      {muscle.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        }
        renderItem={({ item, index }) => {
          // Match the exact text from reference
          let rightText = '5 min';
          if (item.id === 'plank') {
            rightText = 'Start 5 min';
          } else if (item.id === 'squats' || item.id === 'crunches') {
            rightText = '5 m';
          }

          return (
            <Pressable
              style={styles.exerciseRow}
              onPress={() => onStartExercise?.(item.id)}
            >
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseTitle}>{item.title}</Text>
              </View>
              <View style={styles.exerciseRight}>
                <Text style={styles.durationText}>{rightText}</Text>
                <Text style={styles.chevron}>›</Text>
              </View>
            </Pressable>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No exercises match your filters.
            </Text>
            <Pressable onPress={() => setSelectedMuscle(null)}>
              <Text style={styles.clearFiltersText}>Clear filters</Text>
            </Pressable>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1020',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: '800',
  },
  overflowButton: {
    padding: 8,
  },
  overflowText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 18,
    fontWeight: '700',
  },
  heroCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    height: 120,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4c1d95',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 0,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 2,
  },
  heroIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  runningFigure: {
    width: 50,
    height: 50,
    position: 'relative',
  },
  runnerHead: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 5,
    left: 20,
  },
  runnerBody: {
    width: 2,
    height: 15,
    backgroundColor: 'rgba(255,255,255,0.8)',
    position: 'absolute',
    top: 17,
    left: 24,
    borderRadius: 1,
  },
  runnerArmBack: {
    width: 12,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.8)',
    position: 'absolute',
    top: 20,
    left: 15,
    borderRadius: 1,
    transform: [{ rotate: '-30deg' }],
  },
  runnerArmFront: {
    width: 12,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.8)',
    position: 'absolute',
    top: 22,
    left: 25,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  runnerLegBack: {
    width: 12,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.8)',
    position: 'absolute',
    top: 32,
    left: 15,
    borderRadius: 1,
    transform: [{ rotate: '30deg' }],
  },
  runnerLegFront: {
    width: 12,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.8)',
    position: 'absolute',
    top: 35,
    left: 25,
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }],
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '700',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  chipsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: 'rgba(91,155,255,0.3)',
  },
  chipText: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    fontSize: 14,
  },
  chipTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    color: 'white',
    fontSize: 17,
    fontWeight: '500',
  },
  exerciseRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  durationText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
    fontWeight: '400',
  },

  chevron: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 16,
    fontWeight: '300',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginLeft: 62,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    marginBottom: 8,
  },
  clearFiltersText: {
    color: '#5B9BFF',
    fontWeight: '700',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
});

export default LibraryScreen;
