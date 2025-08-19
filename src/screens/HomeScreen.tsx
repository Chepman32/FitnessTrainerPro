import React, { useMemo } from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { TRAINING_TYPES, TrainingType } from '../data/trainingTypes';

export const HomeScreen: React.FC<{ onSelect?: (t: TrainingType) => void }> = ({ onSelect }) => {
  const isDark = useColorScheme() === 'dark';
  const data = useMemo(() => TRAINING_TYPES, []);
  const bgColor = isDark ? '#0B1020' : '#0F172A';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={styles.header}>Choose Training</Text>
      <FlatList
        contentContainerStyle={styles.grid}
        data={data}
        keyExtractor={item => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => onSelect?.(item)}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardTag}>{item.tags.join(' • ')}</Text>
            <View style={styles.durationRow}>
              <Chip label="3" />
              <Chip label="5" />
              <Chip label="10" />
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
};

const Chip: React.FC<{ label: string }> = ({ label }) => (
  <View style={styles.chip}>
    <Text style={styles.chipText}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: 28, fontWeight: '700', color: 'white', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  grid: { paddingHorizontal: 12, paddingBottom: 24 },
  card: {
    flex: 1,
    margin: 8,
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cardTitle: { color: 'white', fontSize: 18, fontWeight: '600' },
  cardTag: { color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  durationRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  chip: {
    borderRadius: 28,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  chipText: { color: 'white', fontWeight: '600' },
});

export default HomeScreen;
