import React, { useEffect } from 'react';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export type ProgressRingProps = {
  size: number;
  strokeWidth?: number;
  progress: number; // 0..1
  trackColor?: string;
  progressColor?: string;
};

export const ProgressRing: React.FC<ProgressRingProps> = ({
  size,
  strokeWidth = 10,
  progress,
  trackColor = '#eee',
  progressColor = '#5B9BFF',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const animated = useSharedValue(0);

  useEffect(() => {
    animated.value = withTiming(Math.min(1, Math.max(0, progress)), { duration: 250 });
  }, [progress, animated]);

  const animatedProps = useAnimatedProps(() => {
    const dashoffset = circumference * (1 - animated.value);
    return { strokeDashoffset: dashoffset } as any;
  });

  const center = size / 2;

  return (
    <Svg width={size} height={size}>
      <Circle
        cx={center}
        cy={center}
        r={radius}
        stroke={trackColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <AnimatedCircle
        cx={center}
        cy={center}
        r={radius}
        stroke={progressColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        animatedProps={animatedProps}
        transform={`rotate(-90 ${center} ${center})`}
      />
    </Svg>
  );
};

export default ProgressRing;
