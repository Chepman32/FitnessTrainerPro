import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  PanResponder,
  AppState,
  AppStateStatus,
  Vibration
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';
import { useTheme } from '../state/ThemeContext';
import { CountdownRing } from '../components/training/SimpleCountdownRing';
import { Program, ExerciseStep, formatDuration } from '../types/program';

interface SimpleTrainingScreenProps {
  program: Program;
  _soundsEnabled: boolean;
  vibrationsEnabled: boolean;
  onComplete: (results: any) => void;
  onExit: () => void;
}

const TICK_INTERVAL = 100; // Update every 100ms for smooth animation
const SWIPE_EXIT_DISTANCE = 70;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PUSH_UPS_VIDEO = require('../assets/exercise-videos/push-ups.mp4');

export const SimpleTrainingScreen: React.FC<SimpleTrainingScreenProps> = ({
  program,
  _soundsEnabled,
  vibrationsEnabled,
  onComplete,
  onExit
}) => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  
  // Simple state for single exercise
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);
  const [_totalElapsedMs, setTotalElapsedMs] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(3);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const swipeTranslateY = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(1)).current;
  const ringTranslateX = useRef(new Animated.Value(0)).current;
  const ringTranslateY = useRef(new Animated.Value(0)).current;
  const hasPlayedRingTransitionRef = useRef(false);
  const isExitingRef = useRef(false);
  const startTimeRef = useRef<number>(0);
  const pausedDurationRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  
  const exercise = program.steps[0] as ExerciseStep; // Single exercise
  const totalDurationMs = exercise.durationSec * 1000;
  const exerciseVideoSource = useMemo(() => {
    const combined = `${exercise.title} ${exercise.id ?? ''} ${exercise.animationRef ?? ''}`.toLowerCase();
    const isPushUps = combined.includes('push-up') || combined.includes('pushup') || combined.includes('push_ups');
    return isPushUps ? PUSH_UPS_VIDEO : null;
  }, [exercise.title, exercise.id, exercise.animationRef]);
  
  // Initialize state when component mounts
  useEffect(() => {
    // Reset all state when component mounts
    setRemainingMs(totalDurationMs);
    setIsRunning(false);
    setIsPaused(false);
    setHasStarted(false);
    setCountdownSeconds(3);
    pausedDurationRef.current = 0;
    hasPlayedRingTransitionRef.current = false;
    ringScale.setValue(1);
    ringTranslateX.setValue(0);
    ringTranslateY.setValue(0);
  }, [totalDurationMs, ringScale, ringTranslateX, ringTranslateY]);

  useEffect(() => {
    if (!hasStarted || hasPlayedRingTransitionRef.current) return;

    hasPlayedRingTransitionRef.current = true;

    Animated.parallel([
      Animated.spring(ringScale, {
        toValue: 0.5,
        velocity: 1.8,
        tension: 90,
        friction: 10,
        useNativeDriver: true
      }),
      Animated.spring(ringTranslateX, {
        toValue: SCREEN_WIDTH * 0.31,
        velocity: 1.8,
        tension: 90,
        friction: 10,
        useNativeDriver: true
      }),
      Animated.spring(ringTranslateY, {
        toValue: -SCREEN_HEIGHT * 0.38,
        velocity: -1.5,
        tension: 90,
        friction: 10,
        useNativeDriver: true
      })
    ]).start();
  }, [hasStarted, ringScale, ringTranslateX, ringTranslateY]);
  
  // Start countdown automatically
  useEffect(() => {
    if (!hasStarted) {
      const countdownInterval = setInterval(() => {
        setCountdownSeconds(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setHasStarted(true);
            setIsRunning(true);
            startTimeRef.current = Date.now();
            lastUpdateRef.current = Date.now();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(countdownInterval);
    }
  }, [hasStarted]);
  
  // Timer management
  const startTimer = useCallback(() => {
    if (intervalRef.current) return;
    
    lastUpdateRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current - pausedDurationRef.current;
      const remaining = Math.max(0, totalDurationMs - elapsed);
      
      setRemainingMs(remaining);
      setTotalElapsedMs(elapsed);
      
      if (remaining <= 0) {
        // Exercise completed
        setIsRunning(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        // Complete the workout
        onComplete({
          program,
          totalElapsedMs: elapsed,
          completedAt: new Date().toISOString()
        });
      }
      
      lastUpdateRef.current = now;
    }, TICK_INTERVAL);
  }, [totalDurationMs, onComplete, program]);
  
  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  
  // Start/stop timer based on running state
  useEffect(() => {
    if (isRunning && !isPaused) {
      startTimer();
    } else {
      stopTimer();
    }
    
    return stopTimer;
  }, [isRunning, isPaused, startTimer, stopTimer]);
  
  // Event handlers
  const handlePause = useCallback(() => {
    if (isRunning && !isPaused) {
      setIsPaused(true);
      const pauseStartTime = Date.now();
      pausedDurationRef.current += pauseStartTime - lastUpdateRef.current;
    }
  }, [isRunning, isPaused]);
  
  const handleResume = useCallback(() => {
    if (isPaused) {
      setIsPaused(false);
      lastUpdateRef.current = Date.now();
    }
  }, [isPaused]);
  
  const handleExit = useCallback(() => {
    stopTimer();
    onExit();
  }, [stopTimer, onExit]);

  const handleScreenPress = useCallback(() => {
    if (!isRunning) return;

    if (isPaused) {
      handleResume();
      return;
    }

    handlePause();
  }, [isRunning, isPaused, handlePause, handleResume]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onPanResponderGrant: () => {
          swipeTranslateY.stopAnimation();
        },
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
          swipeTranslateY.setValue(Math.max(0, gestureState.dy));
        },
        onPanResponderRelease: (_, gestureState) => {
          const isVerticalSwipeDown =
            gestureState.dy > SWIPE_EXIT_DISTANCE &&
            Math.abs(gestureState.dy) > Math.abs(gestureState.dx);

          if (isVerticalSwipeDown) {
            isExitingRef.current = true;
            Animated.timing(swipeTranslateY, {
              toValue: SCREEN_HEIGHT,
              duration: 220,
              useNativeDriver: true
            }).start(() => {
              swipeTranslateY.setValue(0);
              isExitingRef.current = false;
              handleExit();
            });
            return;
          }

          Animated.spring(swipeTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            speed: 20,
            bounciness: 6
          }).start();

          if (Math.abs(gestureState.dy) < 10 && Math.abs(gestureState.dx) < 10 && !isExitingRef.current) {
            handleScreenPress();
          }
        },
        onPanResponderTerminate: () => {
          Animated.spring(swipeTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            speed: 20,
            bounciness: 6
          }).start();
        }
      }),
    [handleExit, handleScreenPress, swipeTranslateY]
  );
  
  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState.match(/inactive|background/) && isRunning && !isPaused) {
        // Auto-pause when going to background
        handlePause();
      }
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isRunning, isPaused, handlePause]);
  
  // Sound and vibration effects
  useEffect(() => {
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    
    if (isRunning && !isPaused && vibrationsEnabled) {
      if (remainingSeconds <= 3 && remainingSeconds > 0 && remainingMs % 1000 < TICK_INTERVAL * 2) {
        Vibration.vibrate(100);
      }
    }
  }, [remainingMs, isRunning, isPaused, vibrationsEnabled]);
  
  // Calculate progress
  const progress = totalDurationMs > 0 ? Math.max(0, Math.min(1, (totalDurationMs - remainingMs) / totalDurationMs)) : 0;
  const formattedTime = formatDuration(Math.ceil(remainingMs / 1000));
  
  // Countdown phase
  if (!hasStarted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        
        <View style={styles.countdownContainer}>
          <Text style={[styles.countdownText, { color: theme.colors.text }]}>
            Get Ready!
          </Text>
          <Text style={[styles.exerciseTitle, { color: theme.colors.text }]}>
            {exercise.title}
          </Text>
          <Text style={[styles.countdownNumber, { color: theme.colors.primary }]}>
            {countdownSeconds}
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      {...panResponder.panHandlers}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <Animated.View
        style={[
          styles.fullScreenPressable,
          {
            transform: [{ translateY: swipeTranslateY }],
            opacity: swipeTranslateY.interpolate({
              inputRange: [0, SCREEN_HEIGHT * 0.75],
              outputRange: [1, 0.92],
              extrapolate: 'clamp'
            })
          }
        ]}
        {...panResponder.panHandlers}
      >
        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Exercise Info */}
          <View style={styles.exerciseInfo}>
            <Text style={[styles.exerciseType, { color: theme.colors.textSecondary }]}>
              Push-ups
            </Text>
            <Text style={[styles.exerciseTitle, { color: theme.colors.text }]}>
              {exercise.title}
            </Text>
            <Text style={[styles.exerciseDescription, { color: theme.colors.textSecondary }]}>
              swipe down to exit the session
            </Text>
          </View>
          
          {exerciseVideoSource ? (
            <View style={styles.videoArea} pointerEvents="none">
              <View style={styles.videoContainer}>
                <Video
                  source={exerciseVideoSource}
                  style={styles.video}
                  resizeMode="cover"
                  repeat
                  muted
                  paused={isPaused}
                  ignoreSilentSwitch="ignore"
                />
              </View>
            </View>
          ) : (
            <View style={styles.videoSpacer} />
          )}
        </View>

        {/* Timer and Ring Overlay */}
        <View style={styles.timerOverlayContainer} pointerEvents="none">
          <Animated.View
            style={[
              styles.ringContainer,
              {
                transform: [
                  { translateX: ringTranslateX },
                  { translateY: ringTranslateY },
                  { scale: ringScale }
                ]
              }
            ]}
          >
            <CountdownRing
              progress={progress}
              size={240}
              strokeWidth={16}
              colors={{
                track: isDark ? '#333333' : '#E5E5E5',
                progress: theme.colors.primary,
                progressCritical: '#FF3B30'
              }}
            />
            <View style={styles.timerTextContainer}>
              <Text style={[styles.timerText, { color: theme.colors.text }]}>
                {formattedTime}
              </Text>
              {exercise.targetReps && (
                <Text style={[styles.targetReps, { color: theme.colors.textSecondary }]}>
                  Target: {exercise.targetReps} reps
                </Text>
              )}
            </View>
          </Animated.View>
        </View>

        <View style={styles.pauseIconOverlay} pointerEvents="none">
          <Ionicons
            name={isPaused ? 'play' : 'pause'}
            size={110}
            color={isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.18)'}
          />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  countdownContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  countdownText: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  countdownNumber: {
    fontSize: 72,
    fontWeight: '700',
    marginTop: 32,
  },
  fullScreenPressable: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    justifyContent: 'flex-start',
  },
  exerciseInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseType: {
    fontSize: 16,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  exerciseTitle: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  exerciseDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  timerOverlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    elevation: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  ringContainer: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerTextContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 56,
  },
  targetReps: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  videoContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  videoArea: {
    flex: 1,
    width: '100%',
    marginTop: 12,
    marginBottom: 18,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoSpacer: {
    flex: 1,
  },
  pauseIconOverlay: {
    position: 'absolute',
    right: 0,
    bottom: 48,
    left: 0,
    alignItems: 'center',
  },
});
