import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Image as SvgImage } from 'react-native-svg';

const ICON_SOURCE = require('../assets/default_icon.png');
const PIECE_COLUMNS = 20;
const PIECE_ROWS = 15;
const TOTAL_PIECES = PIECE_COLUMNS * PIECE_ROWS;

type SplashScreenProps = {
  onComplete?: () => void;
};

type PieceConfig = {
  id: number;
  col: number;
  row: number;
  dx: number;
  dy: number;
  delay: number;
};

const pseudoRandom = (value: number): number => {
  const x = Math.sin(value * 91.3453) * 43758.5453;
  return x - Math.floor(x);
};

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const { width, height } = useWindowDimensions();
  const assembleProgress = useRef(new Animated.Value(0)).current;
  const zoomProgress = useRef(new Animated.Value(1)).current;
  const hasCompletedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const iconSize = Math.min(width * 0.62, 280);
  const pieceWidth = iconSize / PIECE_COLUMNS;
  const pieceHeight = iconSize / PIECE_ROWS;
  const leftOffset = (width - iconSize) / 2;
  const topOffset = (height - iconSize) / 2;

  const pieces = useMemo<PieceConfig[]>(() => {
    return Array.from({ length: TOTAL_PIECES }, (_, id) => {
      const col = id % PIECE_COLUMNS;
      const row = Math.floor(id / PIECE_COLUMNS);
      const targetX = leftOffset + col * pieceWidth;
      const targetY = topOffset + row * pieceHeight;

      const side = id % 4;
      const spreadX = width * (0.2 + pseudoRandom(id + 11) * 0.7);
      const spreadY = height * (0.2 + pseudoRandom(id + 23) * 0.7);
      const extra = 30 + pseudoRandom(id + 31) * 120;

      let startX = targetX;
      let startY = targetY;

      if (side === 0) {
        startX = -extra;
        startY = spreadY;
      } else if (side === 1) {
        startX = width + extra;
        startY = spreadY;
      } else if (side === 2) {
        startX = spreadX;
        startY = -extra;
      } else {
        startX = spreadX;
        startY = height + extra;
      }

      return {
        id,
        col,
        row,
        dx: startX - targetX,
        dy: startY - targetY,
        delay: pseudoRandom(id + 43) * 0.35,
      };
    });
  }, [height, leftOffset, pieceHeight, pieceWidth, topOffset, width]);

  useEffect(() => {
    hasCompletedRef.current = false;
    assembleProgress.setValue(0);
    zoomProgress.setValue(1);

    Animated.sequence([
      Animated.timing(assembleProgress, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(zoomProgress, {
        toValue: 7,
        duration: 500,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (!hasCompletedRef.current) {
        hasCompletedRef.current = true;
        onCompleteRef.current?.();
      }
    });
  }, [assembleProgress, zoomProgress]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.stage, { transform: [{ scale: zoomProgress }] }]}>
        {pieces.map(piece => {
          const localProgress = assembleProgress.interpolate({
            inputRange: [piece.delay, 1],
            outputRange: [0, 1],
            extrapolate: 'clamp',
          });

          const translateX = localProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [piece.dx, 0],
          });

          const translateY = localProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [piece.dy, 0],
          });

          const opacity = localProgress.interpolate({
            inputRange: [0, 0.25, 1],
            outputRange: [0, 1, 1],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={piece.id}
              style={[
                styles.piece,
                {
                  width: pieceWidth + 0.5,
                  height: pieceHeight + 0.5,
                  left: leftOffset + piece.col * pieceWidth,
                  top: topOffset + piece.row * pieceHeight,
                  opacity,
                  transform: [{ translateX }, { translateY }],
                },
              ]}
            >
              <Svg width={pieceWidth + 1} height={pieceHeight + 1}>
                <SvgImage
                  href={ICON_SOURCE}
                  width={iconSize}
                  height={iconSize}
                  x={-piece.col * pieceWidth}
                  y={-piece.row * pieceHeight}
                  preserveAspectRatio="none"
                />
              </Svg>
            </Animated.View>
          );
        })}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  stage: {
    ...StyleSheet.absoluteFillObject,
  },
  piece: {
    position: 'absolute',
    overflow: 'hidden',
  },
});

export default SplashScreen;
