import React, { useEffect } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedProps, 
  withTiming
} from 'react-native-reanimated';
import Svg, { Circle, G } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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
  const center = size / 2;
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
  
  // Animated properties for the progress circle
  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - (animatedProgress.value * circumference);
    
    return {
      strokeDashoffset,
      stroke: progress > 0.8 ? ringColors.progressCritical : ringColors.progress
    };
  });
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <G rotation="-90" origin={`${center}, ${center}`}>
          {/* Background track */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={ringColors.track}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
          />
          {/* Progress circle */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeLinecap="round"
            animatedProps={animatedProps}
          />
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  svg: {
    position: 'absolute'
  }
});
