import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../state/ThemeContext';

type BackButtonProps = {
  onPress: () => void;
  accessibilityLabel?: string;
  color?: string;
  size?: number;
  style?: ViewStyle | ViewStyle[];
};

export const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  accessibilityLabel = 'Go back',
  color,
  size = 24,
  style,
}) => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const iconColor = color ?? (isDark ? '#FFFFFF' : '#000000');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[styles.button, style as any]}
      hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
    >
      <Ionicons name="chevron-back" size={size} color={iconColor} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 4,
  },
});

export default BackButton;


