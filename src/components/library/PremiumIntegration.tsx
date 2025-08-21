import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Content } from '../../types/library';
import { usePremium } from '../../hooks/usePremium';
import { PremiumGate } from './PremiumGate';
import { ContentCard } from './ContentCard';

type PremiumIntegrationProps = {
  content: Content;
  onContentPress?: (content: Content) => void;
  onStartWorkout?: (content: Content) => void;
  onStartProgram?: (content: Content) => void;
  style?: any;
};

export const PremiumIntegration: React.FC<PremiumIntegrationProps> = ({
  content,
  onContentPress,
  onStartWorkout,
  onStartProgram,
  style,
}) => {
  const {
    canAccessContent,
    canStartWorkout,
    canStartProgram,
    recordWorkoutUsage,
    recordProgramUsage,
    startFreeTrial,
    upgradeToPremium,
  } = usePremium();

  const [showPremiumGate, setShowPremiumGate] = useState(false);
  const [gateConfig, setGateConfig] = useState<{
    trigger: 'tap_locked' | 'quota_exceeded' | 'download_offline';
    content?: Content;
  }>({ trigger: 'tap_locked' });

  const handleContentPress = useCallback(async () => {
    // Check content access
    const accessCheck = canAccessContent(content);

    if (!accessCheck.canAccess) {
      // Show premium gate for locked content
      setGateConfig({
        trigger: 'tap_locked',
        content,
      });
      setShowPremiumGate(true);
      return;
    }

    // Check usage limits for workouts
    if (content.type === 'workout') {
      const workoutCheck = canStartWorkout();
      if (!workoutCheck.canStart) {
        setGateConfig({
          trigger: 'quota_exceeded',
          content,
        });
        setShowPremiumGate(true);
        return;
      }

      // Record usage and proceed
      await recordWorkoutUsage();
      onStartWorkout?.(content);
    }

    // Check usage limits for programs
    else if (content.type === 'program') {
      const programCheck = canStartProgram();
      if (!programCheck.canStart) {
        setGateConfig({
          trigger: 'quota_exceeded',
          content,
        });
        setShowPremiumGate(true);
        return;
      }

      // Record usage and proceed
      await recordProgramUsage();
      onStartProgram?.(content);
    }

    // For other content types or general navigation
    else {
      onContentPress?.(content);
    }
  }, [
    content,
    canAccessContent,
    canStartWorkout,
    canStartProgram,
    recordWorkoutUsage,
    recordProgramUsage,
    onContentPress,
    onStartWorkout,
    onStartProgram,
  ]);

  const handlePremiumGateClose = useCallback(() => {
    setShowPremiumGate(false);
  }, []);

  const handleUpgrade = useCallback(() => {
    // In a real app, this would navigate to the subscription flow
    console.log('Navigate to subscription flow');
    setShowPremiumGate(false);

    // For demo purposes, simulate upgrade
    upgradeToPremium('yearly').then(success => {
      if (success) {
        console.log('Upgrade successful');
        // Retry the original action
        handleContentPress();
      }
    });
  }, [upgradeToPremium, handleContentPress]);

  const handleTrial = useCallback(() => {
    startFreeTrial().then(success => {
      if (success) {
        console.log('Trial started successfully');
        setShowPremiumGate(false);
        // Retry the original action
        handleContentPress();
      }
    });
  }, [startFreeTrial, handleContentPress]);

  return (
    <View style={style}>
      <ContentCard content={content} onPress={handleContentPress} />

      <PremiumGate
        visible={showPremiumGate}
        content={gateConfig.content}
        trigger={gateConfig.trigger}
        onClose={handlePremiumGateClose}
        onUpgrade={handleUpgrade}
        onTrial={handleTrial}
      />
    </View>
  );
};

// Enhanced ContentCard with premium integration
export const PremiumContentCard: React.FC<{
  content: Content;
  onPress?: (content: Content) => void;
  style?: any;
}> = ({ content, onPress, style }) => {
  const { canAccessContent, hasPremiumAccess } = usePremium();
  const [showPremiumGate, setShowPremiumGate] = useState(false);

  const accessCheck = canAccessContent(content);
  const isPremium = hasPremiumAccess();

  const handlePress = useCallback(() => {
    if (!accessCheck.canAccess && !isPremium) {
      setShowPremiumGate(true);
      return;
    }

    onPress?.(content);
  }, [accessCheck.canAccess, isPremium, onPress, content]);

  const handleUpgrade = useCallback(() => {
    // Navigate to subscription flow
    console.log('Navigate to subscription');
    setShowPremiumGate(false);
  }, []);

  return (
    <View style={style}>
      <ContentCard content={content} onPress={handlePress} />

      <PremiumGate
        visible={showPremiumGate}
        content={content}
        trigger="tap_locked"
        onClose={() => setShowPremiumGate(false)}
        onUpgrade={handleUpgrade}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Add any container styles if needed
  },
});
