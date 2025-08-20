import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export type ExerciseIconId =
  | 'pushups'
  | 'plank'
  | 'squats'
  | 'burpees'
  | 'lunges'
  | 'crunches'
  | 'mountain_climbers'
  | 'jumping_jacks';

const Runner: React.FC<{ color?: string }> = ({ color = 'rgba(255,255,255,0.85)' }) => (
  <Svg width={48} height={48} viewBox="0 0 48 48">
    <Circle cx="24" cy="10" r="4" fill={color} />
    <Path d="M18 44l6-14 6 6 4-4-8-8 2-6c.4-1.4-.2-2.9-1.5-3.6l-2.5-1.2c-1.3-.6-2.8-.3-3.7.8l-4.8 6-5 2 1.6 4 4.2-1.6-3.9 9.6L18 44z" fill={color} />
  </Svg>
);

const Plank: React.FC<{ color?: string }> = ({ color = 'rgba(255,255,255,0.85)' }) => (
  <Svg width={48} height={48} viewBox="0 0 48 48">
    <Path d="M6 30h36v4H6z" fill={color} />
    <Path d="M8 26l22-6 10 4v4H8z" fill={color} />
    <Circle cx="12" cy="22" r="3" fill={color} />
  </Svg>
);

const Pushups: React.FC<{ color?: string }> = ({ color = 'rgba(255,255,255,0.85)' }) => (
  <Svg width={48} height={48} viewBox="0 0 48 48">
    <Circle cx="10" cy="20" r="4" fill={color} />
    <Path d="M6 26h26l10 4v4H6z" fill={color} />
  </Svg>
);

const Squats: React.FC<{ color?: string }> = ({ color = 'rgba(255,255,255,0.85)' }) => (
  <Svg width={48} height={48} viewBox="0 0 48 48">
    <Circle cx="24" cy="10" r="4" fill={color} />
    <Path d="M18 46v-8l-6-6 4-4 6 6 6-6 4 4-6 6v8z" fill={color} />
  </Svg>
);

const Crunches: React.FC<{ color?: string }> = ({ color = 'rgba(255,255,255,0.85)' }) => (
  <Svg width={48} height={48} viewBox="0 0 48 48">
    <Circle cx="16" cy="18" r="4" fill={color} />
    <Path d="M10 30l10-6 14 6v4H10z" fill={color} />
  </Svg>
);

const Lunges: React.FC<{ color?: string }> = ({ color = 'rgba(255,255,255,0.85)' }) => (
  <Svg width={48} height={48} viewBox="0 0 48 48">
    <Circle cx="24" cy="10" r="4" fill={color} />
    <Path d="M12 44l8-10 8 2 8-8 4 4-10 10-10-2-4 4z" fill={color} />
  </Svg>
);

const Mountain: React.FC<{ color?: string }> = ({ color = 'rgba(255,255,255,0.85)' }) => (
  <Svg width={48} height={48} viewBox="0 0 48 48">
    <Path d="M4 40l12-16 8 10 8-12 12 18H4z" fill={color} />
  </Svg>
);

const JumpingJacks: React.FC<{ color?: string }> = ({ color = 'rgba(255,255,255,0.85)' }) => (
  <Svg width={48} height={48} viewBox="0 0 48 48">
    <Circle cx="24" cy="9" r="4" fill={color} />
    <Path d="M6 14l6-4 12 8 12-8 6 4-14 10 4 12h-6l-4-8-4 8h-6l4-12z" fill={color} />
  </Svg>
);

export function ExerciseIcon({ id, color }: { id: ExerciseIconId; color?: string }) {
  switch (id) {
    case 'pushups':
      return <Pushups color={color} />;
    case 'plank':
      return <Plank color={color} />;
    case 'squats':
      return <Squats color={color} />;
    case 'burpees':
      return <Runner color={color} />;
    case 'lunges':
      return <Lunges color={color} />;
    case 'crunches':
      return <Crunches color={color} />;
    case 'mountain_climbers':
      return <Mountain color={color} />;
    case 'jumping_jacks':
      return <JumpingJacks color={color} />;
    default:
      return <Runner color={color} />;
  }
}

export default ExerciseIcon;
