import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Pressable,
} from 'react-native';
import { useTheme } from '../state/ThemeContext';
import { FriendsChallengeScreen } from './FriendsChallengeScreen';

export const FriendsChallengeDemoScreen: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const [showChallenge, setShowChallenge] = useState(false);

  const backgroundColor = theme.colors.background;
  const statusBarStyle = isDark ? 'light-content' : 'dark-content';

  if (showChallenge) {
    return <FriendsChallengeScreen />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColor} />
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          Friend's Challenge Demo
        </Text>
        
        <Text style={[styles.description, { color: isDark ? '#CCCCCC' : '#666666' }]}>
          This demo showcases the Friend's Challenge screen with different challenge types and layouts.
        </Text>
        
        <Pressable
          style={styles.button}
          onPress={() => setShowChallenge(true)}
        >
          <Text style={styles.buttonText}>Launch Friend's Challenge</Text>
        </Pressable>
        
        <View style={styles.features}>
          <Text style={[styles.featuresTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Features:
          </Text>
          <Text style={[styles.feature, { color: isDark ? '#CCCCCC' : '#666666' }]}>
            • 8 different challenge types (Steps, Push-ups, Burpees, Plank, etc.)
          </Text>
          <Text style={[styles.feature, { color: isDark ? '#CCCCCC' : '#666666' }]}>
            • Unique layouts for each challenge type
          </Text>
          <Text style={[styles.feature, { color: isDark ? '#CCCCCC' : '#666666' }]}>
            • Overview and Friends tabs (Chat tab excluded as requested)
          </Text>
          <Text style={[styles.feature, { color: isDark ? '#CCCCCC' : '#666666' }]}>
            • Progress indicators, friend leaderboards, and action buttons
          </Text>
          <Text style={[styles.feature, { color: isDark ? '#CCCCCC' : '#666666' }]}>
            • Challenge selector with horizontal scrolling
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 40,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  features: {
    alignItems: 'flex-start',
    maxWidth: 300,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  feature: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
});
