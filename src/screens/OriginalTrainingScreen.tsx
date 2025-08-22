import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, useColorScheme } from 'react-native';

interface OriginalTrainingScreenProps {
  onComplete: () => void;
  onExit: () => void;
}

export const OriginalTrainingScreen: React.FC<OriginalTrainingScreenProps> = ({
  onComplete,
  onExit
}) => {
  const isDark = useColorScheme() === 'dark';

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.content}>
        <Text style={[styles.title, isDark && styles.titleDark]}>
          Original Training Screen
        </Text>
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
          This is a placeholder for the original training screen
        </Text>
        
        <View style={styles.buttons}>
          <Pressable style={styles.button} onPress={onComplete}>
            <Text style={styles.buttonText}>Complete</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.exitButton]} onPress={onExit}>
            <Text style={styles.buttonText}>Exit</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  containerDark: {
    backgroundColor: '#000000'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center'
  },
  titleDark: {
    color: '#FFFFFF'
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 40,
    textAlign: 'center'
  },
  subtitleDark: {
    color: '#AAAAAA'
  },
  buttons: {
    gap: 16
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center'
  },
  exitButton: {
    backgroundColor: '#FF3B30'
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  }
});
