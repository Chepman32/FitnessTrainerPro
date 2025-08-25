import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  StatusBar,
  Alert,
  AppState,
  AppStateStatus,
  Vibration
} from 'react-native';
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
  const startTimeRef = useRef<number>(0);
  const pausedDurationRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  
  const exercise = program.steps[0] as ExerciseStep; // Single exercise
  const totalDurationMs = exercise.durationSec * 1000;
  
  // Initialize state when component mounts
  useEffect(() => {
    // Reset all state when component mounts
    setRemainingMs(totalDurationMs);
    setIsRunning(false);
    setIsPaused(false);
    setHasStarted(false);
    setCountdownSeconds(3);
    pausedDurationRef.current = 0;
  }, [totalDurationMs]);
  
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
    Alert.alert(
      'Exit Workout',
      'Are you sure you want to exit? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Exit', 
          style: 'destructive',
          onPress: () => {
            stopTimer();
            onExit();
          }
        }
      ]
    );
  }, [stopTimer, onExit]);
  
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header - Simple with just exit button */}
      <View style={styles.header}>
        <Pressable onPress={handleExit} style={styles.exitButton}>
          <Text style={[styles.exitButtonText, { color: theme.colors.primary }]}>
            Exit
          </Text>
        </Pressable>
        <View style={styles.headerSpacer} />
      </View>
      
      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Exercise Info */}
        <View style={styles.exerciseInfo}>
          <Text style={[styles.exerciseType, { color: theme.colors.textSecondary }]}>
            EXERCISE
          </Text>
          <Text style={[styles.exerciseTitle, { color: theme.colors.text }]}>
            {exercise.title}
          </Text>
          {exercise.description && (
            <Text style={[styles.exerciseDescription, { color: theme.colors.textSecondary }]}>
              {exercise.description}
            </Text>
          )}
        </View>
        
        {/* Timer and Ring */}
        <View style={styles.timerContainer}>
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
        </View>
        
        {/* Simple Controls - Only pause/resume */}
        <View style={styles.controlsContainer}>
          {isPaused ? (
            <Pressable 
              style={[styles.controlButton, styles.resumeButton]}
              onPress={handleResume}
            >
              <Text style={styles.controlButtonText}>Resume</Text>
            </Pressable>
          ) : (
            <Pressable 
              style={[styles.controlButton, styles.pauseButton]}
              onPress={handlePause}
            >
              <Text style={styles.controlButtonText}>Pause</Text>
            </Pressable>
          )}
        </View>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  exitButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  exitButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerSpacer: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
  },
  exerciseInfo: {
    alignItems: 'center',
    marginBottom: 20,
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
  timerContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  timerTextContainer: {
    position: 'absolute',
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
  controlsContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  controlButton: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
  },
  pauseButton: {
    backgroundColor: '#FF9500',
  },
  resumeButton: {
    backgroundColor: '#34C759',
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});