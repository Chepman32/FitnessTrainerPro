import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, Pressable } from 'react-native';

type Props = {
  onReplay?: () => void;
  onChangeSetup?: () => void;
  onHome?: () => void;
};

export const DoneScreen: React.FC<Props> = ({ onReplay, onChangeSetup, onHome }) => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Done — Completion (placeholder)</Text>
      <View style={styles.row}>
        <Pressable style={styles.buttonGhost} onPress={onHome}>
          <Text>Home</Text>
        </Pressable>
        <Pressable style={styles.buttonGhost} onPress={onChangeSetup}>
          <Text>Change Setup</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={onReplay}>
          <Text style={{ color: 'white', fontWeight: '700' }}>Replay</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 16, marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12 },
  button: { backgroundColor: '#22C55E', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  buttonGhost: { borderColor: '#22C55E', borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
});

export default DoneScreen;
