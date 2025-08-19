import React from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';

export const DoneScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Done — Completion (placeholder)</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 16 },
});

export default DoneScreen;
