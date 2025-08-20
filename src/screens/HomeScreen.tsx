import React, { useMemo } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { TRAINING_TYPES, TrainingType } from '../data/trainingTypes';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ExerciseIcon from '../components/ExerciseIcons';

const TabButton: React.FC<{
  icon: string;
  label: string;
  active?: boolean;
}> = ({ icon, label, active }) => (
  <Pressable style={styles.tabItem}>
    <Ionicons
      name={icon}
      size={20}
      color={active ? 'white' : 'rgba(255,255,255,0.6)'}
    />
    <Text style={active ? styles.tabTextActive : styles.tabText}>
      {label}
    </Text>
  </Pressable>
);

type Props = {
  onSelect?: (t: TrainingType) => void;
  onStart?: () => void;
};

export const HomeScreen: React.FC<Props> = ({ onSelect, onStart }) => {
  const isDark = useColorScheme() === 'dark';
  const data = useMemo(() => TRAINING_TYPES.slice(0, 6), []);
  const bgColor = isDark ? '#060A18' : '#0A1224';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <FlatList
        contentContainerStyle={styles.grid}
        data={data}
        keyExtractor={(item) => item.id}
        numColumns={2}
        scrollEnabled={false}
        ListFooterComponent={
          <Pressable style={styles.quickStartBtn} onPress={onStart}>
            <Text style={styles.quickStartText}>Quick Start</Text>
            <View style={styles.quickChipsRow}>
              <QuickChip label="3 min" />
              <QuickChip label="5 middle" active />
              <QuickChip label="Pro" />
            </View>
          </Pressable>
        }
        renderItem={({ item, index }) => (
          <Pressable
            style={[styles.card, gradientByIndex(index)]}
            onPress={() => onSelect?.(item)}
          >
            <View style={styles.cardIconWrap}>
              <ExerciseIcon id={item.id as any} />
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
          </Pressable>
        )}
      />

<View style={styles.bottomBarWrap}>
  <TabButton icon="home" label="Home" active />
  <TabButton icon="library" label="Library" />
  <TabButton icon="heart" label="Favorites" />
  <TabButton icon="time" label="History" />
</View>
    </SafeAreaView>
  );
};

const QuickChip: React.FC<{ label: string; active?: boolean }> = ({
  label,
  active,
}) => (
  <View
    style={[
      styles.quickChip,
      active ? styles.quickChipActive : styles.quickChipGhost,
    ]}
  >
    <Text
      style={[
        styles.quickChipText,
        active && styles.quickChipTextActive,
      ]}
    >
      {label}
    </Text>
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
  grid: {
    paddingHorizontal: 12,
    paddingBottom: 120,
    paddingTop: 12,
  },

  card: {
    flex: 1,
    margin: 6,
    borderRadius: 24,
    padding: 18,
    minHeight: 160,
    justifyContent: 'flex-end',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
  },
  cardIconWrap: {
    position: 'absolute',
    top: 12,
    right: 12,
    opacity: 0.9,
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },

  quickStartBtn: {
    backgroundColor: '#5B9BFF',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginTop: 12,
    alignItems: 'center',
  },
  quickStartText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
  },
  quickChipsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  quickChipGhost: {
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  quickChipActive: {
    borderColor: 'transparent',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  quickChipText: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '700',
    fontSize: 13,
  },
  quickChipTextActive: {
    color: 'white',
  },

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
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  tabItemActive: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  tabText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  tabTextActive: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default HomeScreen;