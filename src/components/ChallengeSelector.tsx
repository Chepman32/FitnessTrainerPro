import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

export type ChallengeType = 'steps' | 'pushups' | 'burpees' | 'plank' | 'squats' | 'lunges' | 'crunches' | 'jumpingJacks';

interface ChallengeOption {
  type: ChallengeType;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
}

interface ChallengeSelectorProps {
  selectedChallenge: ChallengeType;
  onSelectChallenge: (challenge: ChallengeType) => void;
}

const challengeOptions: ChallengeOption[] = [
  {
    type: 'steps',
    title: '10K-Steps Streak',
    subtitle: '7 days • Steps',
    icon: '👟',
    color: '#4CAF50',
  },
  {
    type: 'pushups',
    title: '7-Day Push-Up Ladder',
    subtitle: '7 days • Reps',
    icon: '💪',
    color: '#FF9800',
  },
  {
    type: 'burpees',
    title: 'Burpees Sprint',
    subtitle: '3 days • Reps',
    icon: '🏃',
    color: '#E91E63',
  },
  {
    type: 'plank',
    title: 'Plank Hold',
    subtitle: 'Daily • Time',
    icon: '🧘',
    color: '#9C27B0',
  },
  {
    type: 'squats',
    title: 'Squats Volume',
    subtitle: 'Weekly • Reps',
    icon: '🦵',
    color: '#2196F3',
  },
  {
    type: 'lunges',
    title: 'Lunges Balance',
    subtitle: '10 days • Reps',
    icon: '⚖️',
    color: '#FF5722',
  },
  {
    type: 'crunches',
    title: 'Crunches Core Blast',
    subtitle: 'Daily • Reps',
    icon: '🔥',
    color: '#FFC107',
  },
  {
    type: 'jumpingJacks',
    title: 'Jumping Jacks Minutes',
    subtitle: '7 days • Minutes',
    icon: '🦘',
    color: '#00BCD4',
  },
];

export const ChallengeSelector: React.FC<ChallengeSelectorProps> = ({
  selectedChallenge,
  onSelectChallenge,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Challenge</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {challengeOptions.map((option) => (
          <Pressable
            key={option.type}
            style={[
              styles.challengeCard,
              selectedChallenge === option.type && styles.selectedCard,
            ]}
            onPress={() => onSelectChallenge(option.type)}
          >
            <Text style={styles.challengeIcon}>{option.icon}</Text>
            <Text style={[
              styles.challengeTitle,
              selectedChallenge === option.type && styles.selectedTitle,
            ]}>
              {option.title}
            </Text>
            <Text style={[
              styles.challengeSubtitle,
              selectedChallenge === option.type && styles.selectedSubtitle,
            ]}>
              {option.subtitle}
            </Text>
            {selectedChallenge === option.type && (
              <View style={[styles.selectedIndicator, { backgroundColor: option.color }]} />
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  challengeCard: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  challengeIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  challengeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 18,
  },
  selectedTitle: {
    color: '#4CAF50',
  },
  challengeSubtitle: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 16,
  },
  selectedSubtitle: {
    color: '#4CAF50',
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: -2,
    left: '50%',
    marginLeft: -8,
    width: 16,
    height: 4,
    borderRadius: 2,
  },
});
