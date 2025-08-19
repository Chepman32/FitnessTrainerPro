import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, Pressable } from 'react-native';

type Props = {
  onStart?: () => void;
  onBack?: () => void;
};

export const SetupScreen: React.FC<Props> = ({ onStart, onBack }) => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Setup — Duration & Difficulty (placeholder)</Text>
      <View style={styles.row}>
        <Pressable style={styles.buttonGhost} onPress={onBack}>
          <Text>Back</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={onStart}>
          <Text style={{ color: 'white', fontWeight: '700' }}>Start</Text>
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

export default SetupScreen;
