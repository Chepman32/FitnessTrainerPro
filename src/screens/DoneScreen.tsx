import React, { useMemo } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useSession } from '../state/SessionContext';
import { TRAINING_TYPES } from '../data/trainingTypes';

type Props = {
  onReplay?: () => void;
  onChangeSetup?: () => void;
  onHome?: () => void;
};

export const DoneScreen: React.FC<Props> = ({
  onReplay: _onReplay,
  onChangeSetup,
  onHome,
}) => {
  const { setup } = useSession();

  // Get the selected training type title
  const selectedTrainingTitle = useMemo(() => {
    const trainingType = TRAINING_TYPES.find(t => t.id === setup.typeId);
    return trainingType?.title ?? 'Custom Training';
  }, [setup.typeId]);

  // Format duration for display
  const formattedDuration = useMemo(() => {
    if (setup.durationMin === 0.05) {
      return '00:03';
    }
    const minutes = Math.floor(setup.durationMin);
    return `${minutes.toString().padStart(2, '0')}:00`;
  }, [setup.durationMin]);

  // Calculate estimated calories (rough estimate: 5-10 calories per minute depending on exercise)
  const estimatedCalories = useMemo(() => {
    const minutes = setup.durationMin === 0.05 ? 0.05 : setup.durationMin;
    return Math.round(minutes * 8.6); // Average calories per minute
  }, [setup.durationMin]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>WORKOUT{'\n'}COMPLETE</Text>

      <Text style={styles.exerciseName}>{selectedTrainingTitle}</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Time</Text>
          <Text style={styles.statValue}>{formattedDuration}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Calories</Text>
          <Text style={styles.statValue}>{estimatedCalories}</Text>
        </View>
      </View>

      <View style={styles.doneButtonContainer}>
        <Pressable style={styles.doneButton} onPress={onHome}>
          <Text style={styles.doneButtonText}>Done</Text>
        </Pressable>
      </View>

      <Pressable style={styles.changeSetupButton} onPress={onChangeSetup}>
        <Text style={styles.changeSetupButtonText}>Change Setup</Text>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5B9BFF',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 38,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
    marginBottom: 32,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
    maxWidth: 300,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 36,
    fontWeight: '700',
    color: 'white',
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 20,
  },
  doneButtonContainer: {
    marginBottom: 24,
  },
  doneButton: {
    backgroundColor: '#4ade80',
    paddingHorizontal: 60,
    paddingVertical: 20,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
  },
  changeSetupButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    width: '100%',
  },
  changeSetupButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default DoneScreen;
