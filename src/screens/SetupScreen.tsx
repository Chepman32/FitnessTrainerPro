import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useSession } from '../state/SessionContext';
import { useTheme } from '../state/ThemeContext';
import { TRAINING_TYPES } from '../data/trainingTypes';

type Props = {
  onStart?: () => void;
};

const DURATIONS: Array<0.05 | 3 | 5 | 10 | 15 | 20> = [0.05, 3, 5, 10, 15, 20]; // 0.05 = 3 seconds
const DIFFICULTIES = [
  'Light',
  'Easy',
  'Middle',
  'Stunt',
  'Hardcore',
  'Pro',
] as const;

export const SetupScreen: React.FC<Props> = ({ onStart }) => {
  const { setup, setSetup } = useSession();
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';

  const [useCustom, setUseCustom] = useState<boolean>(
    ![0.05, 3, 5, 10, 15, 20].includes(Number(setup.durationMin)),
  );
  const [customMin, setCustomMin] = useState<number>(
    typeof setup.durationMin === 'number' &&
      ![0.05, 3, 5, 10, 15, 20].includes(Number(setup.durationMin))
      ? setup.durationMin
      : 15,
  );

  // Refs for ScrollViews to control scrolling
  const durationScrollRef = useRef<ScrollView>(null);
  const difficultyScrollRef = useRef<ScrollView>(null);

  const selectedTypeTitle = useMemo(() => {
    const tt = TRAINING_TYPES.find(t => t.id === setup.typeId);
    return tt?.title ?? 'Custom Training';
  }, [setup.typeId]);

  const selectedDuration = useCustom
    ? customMin
    : (setup.durationMin as number);
  const canStart =
    selectedDuration >= 0.05 &&
    selectedDuration <= 180 &&
    !!setup.difficulty &&
    !!setup.typeId;

  // Auto-scroll to selected values when component mounts
  useEffect(() => {
    const scrollToSelectedValues = () => {
      // Scroll to selected duration
      if (!useCustom && setup.durationMin) {
        const durationIndex = DURATIONS.findIndex(d => d === setup.durationMin);
        if (durationIndex >= 0) {
          const chipWidth = 104; // minWidth 80 + padding 20 + gap 12
          const scrollX = Math.max(0, durationIndex * chipWidth - 50); // Center the chip
          durationScrollRef.current?.scrollTo({ x: scrollX, animated: true });
        }
      }

      // Scroll to selected difficulty
      if (setup.difficulty) {
        const difficultyIndex = DIFFICULTIES.findIndex(
          d => d === setup.difficulty,
        );
        if (difficultyIndex >= 0) {
          const chipWidth = 104; // minWidth 80 + padding 20 + gap 12
          const scrollX = Math.max(0, difficultyIndex * chipWidth - 50); // Center the chip
          difficultyScrollRef.current?.scrollTo({ x: scrollX, animated: true });
        }
      }
    };

    // Delay to ensure ScrollViews are rendered
    const timer = setTimeout(scrollToSelectedValues, 100);
    return () => clearTimeout(timer);
  }, [setup.durationMin, setup.difficulty, useCustom]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{selectedTypeTitle}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Duration</Text>
        <ScrollView
          ref={durationScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
        >
          {DURATIONS.map(min => {
            const active = !useCustom && setup.durationMin === min;
            const label = min === 0.05 ? '3 sec' : `${min} min`;
            return (
              <Chip
                key={min}
                label={label}
                active={active}
                isDark={isDark}
                onPress={() => {
                  setUseCustom(false);
                  setSetup({ durationMin: min });
                }}
              />
            );
          })}
          <Chip
            label="Custom"
            active={useCustom}
            isDark={isDark}
            onPress={() => {
              setUseCustom(true);
              setSetup({ durationMin: customMin });
            }}
          />
        </ScrollView>

        {useCustom && (
          <View style={styles.stepperRow}>
            <Pressable
              accessibilityLabel="Decrease minutes"
              style={[styles.stepperBtn, styles.stepperGhost]}
              onPress={() => {
                const v = Math.max(1, customMin - 1);
                setCustomMin(v);
                setSetup({ durationMin: v });
              }}
            >
              <Text style={styles.stepperBtnText}>-1</Text>
            </Pressable>
            <Text style={[styles.stepperValue, { color: theme.colors.text }]}>{customMin} min</Text>
            <Pressable
              accessibilityLabel="Increase minutes"
              style={[styles.stepperBtn, styles.stepperGhost]}
              onPress={() => {
                const v = Math.min(180, customMin + 1);
                setCustomMin(v);
                setSetup({ durationMin: v });
              }}
            >
              <Text style={styles.stepperBtnText}>+1</Text>
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Difficulty</Text>
        <ScrollView
          ref={difficultyScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
        >
          {DIFFICULTIES.map(label => (
            <Chip
              key={label}
              label={label}
              active={setup.difficulty === label}
              isDark={isDark}
              onPress={() => setSetup({ difficulty: label })}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.startButtonContainer}>
        <Pressable
          disabled={!canStart}
          style={[styles.startButton, !canStart && styles.buttonDisabled]}
          onPress={onStart}
        >
          <Text style={styles.startButtonText}>Start</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const Chip: React.FC<{
  label: string;
  active?: boolean;
  isDark?: boolean;
  onPress?: () => void;
}> = ({ label, active, isDark, onPress }) => (
  <Pressable
    onPress={onPress}
    style={[
      styles.chip,
      active ? styles.chipActive : (isDark ? styles.chipGhostDark : styles.chipGhost)
    ]}
  >
    <Text style={[
      styles.chipText,
      active && styles.chipTextActive,
      !active && isDark && styles.chipTextDark
    ]}>
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    textAlign: 'center',
    color: '#000',
  },

  section: { marginTop: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#000',
  },

  carouselContent: { paddingRight: 12, gap: 12 },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#e5e5e5',
    minWidth: 80,
    alignItems: 'center',
  },
  chipGhost: {
    backgroundColor: '#e5e5e5',
  },
  chipGhostDark: {
    backgroundColor: '#333333',
  },
  chipActive: {
    backgroundColor: '#5B9BFF',
  },
  chipText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
  chipTextDark: {
    color: '#FFFFFF',
  },
  chipTextActive: {
    color: 'white',
    fontSize: 16,
  },

  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  stepperBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    minWidth: 50,
    alignItems: 'center',
  },
  stepperGhost: { borderColor: '#5B9BFF' },
  stepperBtnText: {
    color: '#5B9BFF',
    fontWeight: '600',
    fontSize: 16,
  },
  stepperValue: {
    fontSize: 16,
    fontWeight: '700',
    minWidth: 72,
    textAlign: 'center',
  },

  startButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  startButton: {
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#4ade80',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 24,
  },
  buttonDisabled: { opacity: 0.5 },
});

export default SetupScreen;
