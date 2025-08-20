import React, { useMemo } from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { TRAINING_TYPES, TrainingType } from '../data/trainingTypes';
import ExerciseIcon from '../components/ExerciseIcons';

type Props = {
  onSelect?: (t: TrainingType) => void;
  onStart?: () => void;
};

export const HomeScreen: React.FC<Props> = ({ onSelect, onStart }) => {
  const isDark = useColorScheme() === 'dark';
  const data = useMemo(() => TRAINING_TYPES.slice(0, 8), []);
  const bgTop = isDark ? '#060A18' : '#0A1224';
  const bgBottom = isDark ? '#0B1020' : '#0F172A';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgBottom }]}>
      <View style={[styles.headerWrap, { backgroundColor: bgTop }]}>
        <Text style={styles.quickTitle}>Quick Start</Text>
        <View style={styles.quickChipsRow}>
          <QuickChip label="3 min" active />
          <QuickChip label="5 middle" />
          <QuickChip label="Pro" />
        </View>
      </View>

      <FlatList
        contentContainerStyle={styles.grid}
        data={data}
        keyExtractor={item => item.id}
        numColumns={2}
        scrollEnabled={false}
        renderItem={({ item, index }) => (
          <Pressable style={[styles.card, gradientByIndex(index)]} onPress={() => onSelect?.(item)}>
            <View style={styles.cardIconWrap}>
              <ExerciseIcon id={item.id as any} />
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
          </Pressable>
        )}
      />

      <View style={styles.bottomBarWrap}>
        <Pressable style={styles.tabItemActive}><Text style={styles.tabTextActive}>Home</Text></Pressable>
        <Pressable style={styles.tabItem}><Text style={styles.tabText}>Library</Text></Pressable>
        <Pressable style={styles.tabItem}><Text style={styles.tabText}>Favorites</Text></Pressable>
        <Pressable style={styles.tabItem}><Text style={styles.tabText}>History</Text></Pressable>
        <Pressable style={styles.tabItem}><Text style={styles.tabText}>Settings</Text></Pressable>
        <Pressable style={styles.fabStart} onPress={onStart} accessibilityLabel="Start">
          <Text style={styles.fabStartText}>Start</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const QuickChip: React.FC<{ label: string; active?: boolean }> = ({ label, active }) => (
  <View style={[styles.quickChip, active ? styles.quickChipActive : styles.quickChipGhost]}>
    <Text style={[styles.quickChipText, active && styles.quickChipTextActive]}>{label}</Text>
  </View>
);

const gradientByIndex = (i: number) => {
  const presets = [
    { backgroundColor: '#FF7A30' },
    { backgroundColor: '#B84DFF' },
    { backgroundColor: '#2DC7FF' },
    { backgroundColor: '#2D7BFF' },
    { backgroundColor: '#3BA3FF' },
    { backgroundColor: '#1E62D0' },
  ];
  return presets[i % presets.length];
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerWrap: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  quickTitle: { fontSize: 34, fontWeight: '800', color: 'white' },
  quickChipsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  quickChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth },
  quickChipGhost: { borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(255,255,255,0.06)' },
  quickChipActive: { borderColor: 'transparent', backgroundColor: 'rgba(255,255,255,0.18)' },
  quickChipText: { color: 'rgba(255,255,255,0.85)', fontWeight: '700' },
  quickChipTextActive: { color: 'white' },

  grid: { paddingHorizontal: 12, paddingBottom: 100 },
  card: {
    flex: 1,
    margin: 6,
    borderRadius: 24,
    padding: 18,
    minHeight: 144,
    justifyContent: 'flex-end',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
  },
  cardIconWrap: { position: 'absolute', top: 12, right: 12, opacity: 0.9 },
  cardTitle: { color: 'white', fontSize: 18, fontWeight: '700' },

  bottomBarWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingBottom: 10,
    paddingTop: 8,
    backgroundColor: 'rgba(10,15,25,0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  tabItemActive: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  tabText: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  tabTextActive: { color: 'white', fontSize: 12, fontWeight: '700' },
  fabStart: {
    position: 'absolute',
    right: 12,
    bottom: 18,
    backgroundColor: '#5B9BFF',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  fabStartText: { color: 'white', fontWeight: '800' },
});

export default HomeScreen;
