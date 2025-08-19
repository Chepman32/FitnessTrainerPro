import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, Pressable } from 'react-native';

type Props = {
  onComplete?: () => void;
  onExit?: () => void;
};

export const TrainingScreen: React.FC<Props> = ({ onComplete, onExit }) => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Training — Timer + Animation (placeholder)</Text>
      <View style={styles.row}>
        <Pressable style={styles.buttonGhost} onPress={onExit}>
          <Text>Exit</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={onComplete}>
          <Text style={{ color: 'white', fontWeight: '700' }}>Complete</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 16, marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12 },
  button: { backgroundColor: '#5B9BFF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  buttonGhost: { borderColor: '#5B9BFF', borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
});

export default TrainingScreen;
