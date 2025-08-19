import React from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';

export const SplashScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Fitness Trainer Pro</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F172A' },
  title: { color: 'white', fontWeight: '700', fontSize: 24 },
});

export default SplashScreen;
