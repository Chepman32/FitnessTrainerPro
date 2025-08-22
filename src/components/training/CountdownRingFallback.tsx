import React, { useEffect } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming
} from 'react-native-reanimated';

interface CountdownRingProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  duration?: number; // Animation duration in ms
  colors?: {
    track: string;
    progress: string;
    progressCritical?: string; // Color when progress > 0.8
  };
}

export const CountdownRing: React.FC<CountdownRingProps> = ({
  progress,
  size = 200,
  strokeWidth = 12,
  duration = 300,
  colors
}) => {
  const isDark = useColorScheme() === 'dark';
  
  // Default colors with theme support
  const defaultColors = {
    track: isDark ? '#333333' : '#E5E5E5',
    progress: isDark ? '#0A84FF' : '#007AFF',
    progressCritical: '#FF3B30'
  };
  
  const ringColors = { ...defaultColors, ...colors };
  
  // Calculate circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Animated values
  const animatedProgress = useSharedValue(0);
  
  // Update progress with animation
  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration
    });
  }, [progress, duration, animatedProgress]);
  
  // Create animated style for the progress indicator
  const progressStyle = useAnimatedStyle(() => {
    const angle = animatedProgress.value * 360;
    const progressColor = progress > 0.8 ? ringColors.progressCritical : ringColors.progress;
    
    return {
      transform: [{ rotate: `${angle - 90}deg` }],
      borderTopColor: progressColor,
      borderRightColor: angle > 90 ? progressColor : 'transparent',
      borderBottomColor: angle > 180 ? progressColor : 'transparent',
      borderLeftColor: angle > 270 ? progressColor : 'transparent',
    };
  });
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background track */}
      <View 
        style={[
          styles.track, 
          { 
            width: size, 
            height: size, 
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: ringColors.track
          }
        ]} 
      />
      
      {/* Progress indicator - simplified circular progress */}
      <Animated.View
        style={[
          styles.progressIndicator,
          {
            width: size - strokeWidth,
            height: size - strokeWidth,
            borderRadius: (size - strokeWidth) / 2,
            borderWidth: strokeWidth / 2,
            top: strokeWidth / 2,
            left: strokeWidth / 2,
          },
          progressStyle
        ]}
      />
      
      {/* Center content area */}
      <View style={[
        styles.centerArea,
        {
          width: size - strokeWidth * 2,
          height: size - strokeWidth * 2,
          borderRadius: (size - strokeWidth * 2) / 2,
          top: strokeWidth,
          left: strokeWidth,
        }
      ]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  track: {
    position: 'absolute',
  },
  progressIndicator: {
    position: 'absolute',
    borderTopColor: '#007AFF',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  centerArea: {
    position: 'absolute',
    backgroundColor: 'transparent',
  }
});
