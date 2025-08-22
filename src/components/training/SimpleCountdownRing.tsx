import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';

interface CountdownRingProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  duration?: number; // Animation duration in ms (ignored in simple version)
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
  
  // Calculate progress angle
  const progressAngle = progress * 360;
  const progressColor = progress > 0.8 ? ringColors.progressCritical : ringColors.progress;
  
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
      
      {/* Progress indicator using simple rotation */}
      <View
        style={[
          styles.progressContainer,
          {
            width: size,
            height: size,
          }
        ]}
      >
        <View
          style={[
            styles.progressIndicator,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: 'transparent',
              borderTopColor: progressColor,
              transform: [{ rotate: `${progressAngle - 90}deg` }],
            }
          ]}
        />
        
        {/* Second half of the circle for progress > 50% */}
        {progress > 0.5 && (
          <View
            style={[
              styles.progressIndicator,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: strokeWidth,
                borderColor: 'transparent',
                borderBottomColor: progressColor,
                transform: [{ rotate: `${progressAngle - 270}deg` }],
              }
            ]}
          />
        )}
      </View>
      
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
  progressContainer: {
    position: 'absolute',
  },
  progressIndicator: {
    position: 'absolute',
  },
  centerArea: {
    position: 'absolute',
    backgroundColor: 'transparent',
  }
});
