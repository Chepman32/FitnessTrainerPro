import React, { useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { useSession } from '../state/SessionContext';
import { TRAINING_TYPES } from '../data/trainingTypes';

type Props = {
  onStart?: () => void;
};

const DURATIONS: Array<3 | 5 | 10> = [3, 5, 10];
const DIFFICULTIES = ['Light', 'Easy', 'Middle', 'Stunt', 'Hardcore', 'Pro'] as const;

export const SetupScreen: React.FC<Props> = ({ onStart }) => {
  const { setup, setSetup } = useSession();

  const [useCustom, setUseCustom] = useState<boolean>(![3, 5, 10].includes(Number(setup.durationMin)));
  const [customMin, setCustomMin] = useState<number>(
    typeof setup.durationMin === 'number' && ![3, 5, 10].includes(Number(setup.durationMin)) ? setup.durationMin : 10,
  );

  const selectedTypeTitle = useMemo(() => {
    const tt = TRAINING_TYPES.find(t => t.id === setup.typeId);
    return tt?.title ?? 'Custom Training';
  }, [setup.typeId]);

  const selectedDuration = useCustom ? customMin : (setup.durationMin as number);
  const canStart = selectedDuration >= 1 && selectedDuration <= 180 && !!setup.difficulty && !!setup.typeId;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Setup</Text>
        <Text style={styles.subtitle}>{selectedTypeTitle}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Duration</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
        >
          {DURATIONS.map(min => {
            const active = !useCustom && setup.durationMin === min;
            return (
              <Chip
                key={min}
                label={`${min} min`}
                active={active}
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
                const v = Math.max(1, Math.floor(customMin - 1));
                setCustomMin(v);
                setSetup({ durationMin: v });
              }}
            >
              <Text>-</Text>
            </Pressable>
            <Text style={styles.stepperValue}>{customMin} min</Text>
            <Pressable
              accessibilityLabel="Increase minutes"
              style={[styles.stepperBtn, styles.stepperGhost]}
              onPress={() => {
                const v = Math.min(180, Math.floor(customMin + 1));
                setCustomMin(v);
                setSetup({ durationMin: v });
              }}
            >
              <Text>+</Text>
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Difficulty</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
        >
          {DIFFICULTIES.map(label => (
            <Chip
              key={label}
              label={label}
              active={setup.difficulty === label}
              onPress={() => setSetup({ difficulty: label })}
            />
          ))}
        </ScrollView>
      </View>

      <View style={[styles.row, styles.rowTopMargin] }>
        <Pressable
          disabled={!canStart}
          style={[styles.button, !canStart && styles.buttonDisabled]}
          onPress={onStart}
        >
          <Text style={styles.buttonText}>Start</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const Chip: React.FC<{ label: string; active?: boolean; onPress?: () => void }> = ({ label, active, onPress }) => (
  <Pressable
    onPress={onPress}
    style={[styles.chip, active ? styles.chipActive : styles.chipGhost]}
  >
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  header: { marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 2 },

  section: { marginTop: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },

  chipsRow: { flexDirection: 'row', gap: 8 },
  carouselContent: { paddingRight: 12, gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth },
  chipGhost: { borderColor: '#93c5fd' },
  chipActive: { backgroundColor: '#5B9BFF', borderColor: '#5B9BFF' },
  chipText: { color: '#1f2937', fontWeight: '600' },
  chipTextActive: { color: 'white' },

  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  stepperBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth },
  stepperGhost: { borderColor: '#5B9BFF' },
  stepperValue: { fontSize: 16, fontWeight: '700', minWidth: 72, textAlign: 'center' },

  row: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end' },
  rowTopMargin: { marginTop: 12 },
  button: { backgroundColor: '#5B9BFF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  buttonGhost: { borderColor: '#5B9BFF', borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: 'white', fontWeight: '700' },
});

export default SetupScreen;
