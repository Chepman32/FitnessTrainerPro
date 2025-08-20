import React from 'react';
import Svg, { Path, Circle, Line } from 'react-native-svg';

export type ExerciseIconId =
  | 'pushups'
  | 'plank'
  | 'squats'
  | 'burpees'
  | 'lunges'
  | 'crunches'
  | 'mountain_climbers'
  | 'jumping_jacks';

type IconProps = { color?: string; size?: number };

const defaultColor = 'rgba(255,255,255,0.9)';

const Pushups = ({ color = defaultColor, size = 48 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Line
      x1="6"
      y1="40"
      x2="42"
      y2="40"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <Circle cx="12" cy="24" r="3.5" fill={color} />
    <Line
      x1="15.5"
      y1="24"
      x2="28"
      y2="24"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <Line
      x1="28"
      y1="24"
      x2="36.5"
      y2="27.5"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <Line
      x1="19"
      y1="25"
      x2="16"
      y2="32"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <Line
      x1="16"
      y1="32"
      x2="25.5"
      y2="32"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
  </Svg>
);

const Plank = ({ color = defaultColor, size = 48 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Line
      x1="6"
      y1="40"
      x2="42"
      y2="40"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <Circle cx="12" cy="24" r="3.5" fill={color} />
    <Line
      x1="15.5"
      y1="24"
      x2="36"
      y2="30"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <Line
      x1="22"
      y1="26"
      x2="22"
      y2="34"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <Line
      x1="22"
      y1="34"
      x2="30"
      y2="34"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
  </Svg>
);

const Squats = ({ color = defaultColor, size = 48 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Circle cx="24" cy="9" r="4" fill={color} />
    <Line
      x1="24"
      y1="13"
      x2="24"
      y2="22"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <Line
      x1="24"
      y1="18"
      x2="34"
      y2="20"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <Line
      x1="24"
      y1="22"
      x2="30"
      y2="30"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <Line
      x1="30"
      y1="30"
      x2="36"
      y2="30"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <Line
      x1="24"
      y1="22"
      x2="18"
      y2="30"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <Line
      x1="18"
      y1="30"
      x2="12"
      y2="30"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
  </Svg>
);

const Burpees = ({ color = defaultColor, size = 48 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Line
      x1="6"
      y1="41"
      x2="42"
      y2="41"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <Circle cx="24" cy="7.5" r="4" fill={color} />
    <Line
      x1="24"
      y1="11.5"
      x2="24"
      y2="20"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <Line
      x1="24"
      y1="14.5"
      x2="16"
      y2="20"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <Line
      x1="24"
      y1="14.5"
      x2="32"
      y2="20"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <Circle cx="12.5" cy="27" r="3.2" fill={color} />
    <Line
      x1="15.5"
      y1="27"
      x2="32.5"
      y2="32.5"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <Line
      x1="22"
      y1="29"
      x2="22"
      y2="36"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <Line
      x1="22"
      y1="36"
      x2="30"
      y2="36"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
  </Svg>
);

const Lunges = ({ color = defaultColor, size = 48 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Line
      x1="6"
      y1="41"
      x2="42"
      y2="41"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <Circle cx="24" cy="9" r="4" fill={color} />
    <Line
      x1="24"
      y1="13"
      x2="24"
      y2="22"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <Line
      x1="24"
      y1="18"
      x2="32"
      y2="20"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <Line
      x1="24"
      y1="22"
      x2="16"
      y2="30"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <Line
      x1="16"
      y1="30"
      x2="10"
      y2="30"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <Line
      x1="24"
      y1="22"
      x2="34"
      y2="30"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <Line
      x1="34"
      y1="30"
      x2="34"
      y2="41"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
  </Svg>
);

const Crunches = ({ color = defaultColor, size = 48 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Line
      x1="6"
      y1="41"
      x2="42"
      y2="41"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <Circle cx="18" cy="23" r="3.8" fill={color} />
    <Path
      d="M21 24c5 0 9 1 12 3 3 2 5 4 7 7"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
      fill="none"
    />
    <Path
      d="M12 34c1.5-3.5 4.5-6.5 9-8"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
      fill="none"
    />
    <Path
      d="M13 34h10"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
      fill="none"
    />
  </Svg>
);

const MountainClimbers = ({ color = defaultColor, size = 48 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Line
      x1="6"
      y1="41"
      x2="42"
      y2="41"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <Circle cx="14" cy="22" r="3.5" fill={color} />
    <Line
      x1="17.5"
      y1="22"
      x2="33"
      y2="27"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <Line
      x1="22"
      y1="24"
      x2="22"
      y2="31"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <Line
      x1="22"
      y1="31"
      x2="30"
      y2="31"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <Line
      x1="27"
      y1="26.5"
      x2="20"
      y2="33.5"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <Line
      x1="20"
      y1="33.5"
      x2="15"
      y2="33.5"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
  </Svg>
);

const JumpingJacks = ({ color = defaultColor, size = 48 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Circle cx="24" cy="8.5" r="4" fill={color} />
    <Line
      x1="24"
      y1="12.5"
      x2="24"
      y2="22"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <Line
      x1="24"
      y1="15"
      x2="12"
      y2="10"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <Line
      x1="24"
      y1="15"
      x2="36"
      y2="10"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <Line
      x1="24"
      y1="22"
      x2="14"
      y2="34"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
    <Line
      x1="24"
      y1="22"
      x2="34"
      y2="34"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
  </Svg>
);

export function ExerciseIcon({
  id,
  color,
  size,
}: {
  id: ExerciseIconId;
  color?: string;
  size?: number;
}) {
  switch (id) {
    case 'pushups':
      return <Pushups color={color} size={size} />;
    case 'plank':
      return <Plank color={color} size={size} />;
    case 'squats':
      return <Squats color={color} size={size} />;
    case 'burpees':
      return <Burpees color={color} size={size} />;
    case 'lunges':
      return <Lunges color={color} size={size} />;
    case 'crunches':
      return <Crunches color={color} size={size} />;
    case 'mountain_climbers':
      return <MountainClimbers color={color} size={size} />;
    case 'jumping_jacks':
      return <JumpingJacks color={color} size={size} />;
    default:
      return <JumpingJacks color={color} size={size} />;
  }
}

export default ExerciseIcon;
