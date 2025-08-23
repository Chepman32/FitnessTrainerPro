declare module 'react-native-vector-icons/Ionicons' {
  import * as React from 'react';
  import { TextProps, StyleProp, TextStyle } from 'react-native';

  export interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
    style?: StyleProp<TextStyle>;
  }

  export default class Ionicons extends React.Component<IconProps> {}
}