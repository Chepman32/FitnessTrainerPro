import React from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';

export const SetupScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Setup — Duration & Difficulty (placeholder)</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 16 },
});

export default SetupScreen;
