import React, { useEffect, useReducer, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  StatusBar,
  useColorScheme,
  Alert,
  AppState,
  AppStateStatus,
  Vibration
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { CountdownRing } from '../components/training/SimpleCountdownRing';
import {
  trainingReducer,
  TrainingSessionState,
  TrainingEvent,
  selectors
} from '../state/trainingStateMachine';
import { Program, Step, formatDuration } from '../types/program';

interface TrainingScreenProps {
  program: Program;
  soundsEnabled: boolean;
  vibrationsEnabled: boolean;
  onComplete: (results: any) => void;
  onExit: () => void;
}

const TICK_INTERVAL = 100; // Update every 100ms for smooth animation
const FIVE_SECOND_WARNING_MS = 5000;

export const TrainingScreen: React.FC<TrainingScreenProps> = ({
  program,
  soundsEnabled,
  vibrationsEnabled,
  onComplete,
  onExit
}) => {
  const isDark = useColorScheme() === 'dark';
  
  // State management
  const [state, dispatch] = useReducer(trainingReducer, {
    state: 'idle',
    program: null,
    currentStepIndex: 0,
    currentStep: null,
    remainingMs: 0,
    totalElapsedMs: 0,
    stepStartTime: null,
    pausedAt: null,
    pausedDurationMs: 0,
    showNextUpBanner: false,
    nextUpStep: null,
    isLastStep: false,
    stepResults: [],
    soundsEnabled,
    vibrationsEnabled,
    error: null
  });
  
  // Refs for timer management
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  
  // Animated values
  const nextUpOpacity = useSharedValue(0);
  const nextUpTranslateY = useSharedValue(24);
  const stepTransitionOpacity = useSharedValue(1);
  const stepTransitionScale = useSharedValue(1);
  
  // Start the program when component mounts
  useEffect(() => {
    dispatch({ type: 'START', program });
  }, [program]);
  
  // Timer management
  const startTimer = useCallback(() => {
    if (intervalRef.current) return;
    
    lastUpdateRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const deltaMs = now - lastUpdateRef.current;
      lastUpdateRef.current = now;
      
      if (state.state === 'running' && state.stepStartTime) {
        const elapsed = now - state.stepStartTime - state.pausedDurationMs;
        const stepDurationMs = (state.currentStep?.durationSec || 0) * 1000;
        const remaining = Math.max(0, stepDurationMs - elapsed);
        
        dispatch({ type: 'TICK', remainingMs: remaining });
      }
    }, TICK_INTERVAL);
  }, [state.state, state.stepStartTime, state.pausedDurationMs, state.currentStep]);
  
  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  
  // Handle app state changes for background management
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground - timer will auto-resume
        if (state.state === 'running') {
          startTimer();
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App going to background
        stopTimer();
        // TODO: Schedule local notification for step completion
      }
      appStateRef.current = nextAppState;
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [state.state, startTimer, stopTimer]);
  
  // Start/stop timer based on training state
  useEffect(() => {
    if (state.state === 'running') {
      startTimer();
    } else {
      stopTimer();
    }
    
    return stopTimer;
  }, [state.state, startTimer, stopTimer]);
  
  // Handle next up banner animation
  useEffect(() => {
    if (state.showNextUpBanner) {
      nextUpOpacity.value = withTiming(1, {
        duration: 250,
        easing: Easing.out(Easing.ease)
      });
      nextUpTranslateY.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.ease)
      });
    } else {
      nextUpOpacity.value = withTiming(0, { duration: 200 });
      nextUpTranslateY.value = withTiming(24, { duration: 200 });
    }
  }, [state.showNextUpBanner, nextUpOpacity, nextUpTranslateY]);
  
  // Handle step transitions
  const previousStepIndexRef = useRef(state.currentStepIndex);
  useEffect(() => {
    if (previousStepIndexRef.current !== state.currentStepIndex) {
      // Animate step transition
      stepTransitionOpacity.value = 0;
      stepTransitionScale.value = 0.98;
      
      stepTransitionOpacity.value = withTiming(1, { duration: 200 });
      stepTransitionScale.value = withTiming(1, { duration: 200 });
      
      previousStepIndexRef.current = state.currentStepIndex;
    }
  }, [state.currentStepIndex, stepTransitionOpacity, stepTransitionScale]);
  
  // Handle completion
  useEffect(() => {
    if (state.state === 'finished') {
      stopTimer();
      onComplete({
        program: state.program,
        stepResults: state.stepResults,
        totalElapsedMs: state.totalElapsedMs
      });
    }
  }, [state.state, onComplete, stopTimer, state.program, state.stepResults, state.totalElapsedMs]);
  
  // Sound and vibration effects
  useEffect(() => {
    const remainingSeconds = Math.ceil(state.remainingMs / 1000);
    
    if (state.state === 'running' && soundsEnabled) {
      if (selectors.shouldPlayCountdownSound(state.remainingMs)) {
        // TODO: Play countdown tick sound
        console.log('Play countdown sound:', remainingSeconds);
      }
      
      if (selectors.shouldPlayStepCompleteSound(state.remainingMs)) {
        // TODO: Play step complete sound
        console.log('Play step complete sound');
      }
    }
    
    if (state.state === 'running' && vibrationsEnabled) {
      if (remainingSeconds <= 3 && remainingSeconds > 0 && state.remainingMs % 1000 < TICK_INTERVAL) {
        Vibration.vibrate(100);
      }
    }
  }, [state.remainingMs, state.state, soundsEnabled, vibrationsEnabled]);
  
  // Event handlers
  const handlePauseResume = () => {
    if (state.state === 'running') {
      dispatch({ type: 'PAUSE' });
    } else if (state.state === 'paused') {
      dispatch({ type: 'RESUME' });
    }
  };
  
  const handleNextStep = () => {
    dispatch({ type: 'NEXT_STEP' });
  };
  
  const handleSkipRest = () => {
    if (state.currentStep?.type === 'rest') {
      dispatch({ type: 'SKIP_REST' });
    }
  };
  
  const handleAddTenSeconds = () => {
    if (state.currentStep?.type === 'rest') {
      dispatch({ type: 'ADD_TEN_SECONDS' });
    }
  };
  
  const handleExit = () => {
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
            dispatch({ type: 'EXIT' });
            onExit();
          }
        }
      ]
    );
  };
  
  // Animated styles
  const nextUpBannerStyle = useAnimatedStyle(() => ({
    opacity: nextUpOpacity.value,
    transform: [{ translateY: nextUpTranslateY.value }]
  }));
  
  const stepContentStyle = useAnimatedStyle(() => ({
    opacity: stepTransitionOpacity.value,
    transform: [{ scale: stepTransitionScale.value }]
  }));
  
  // Computed values
  const currentProgress = selectors.getCurrentProgress(state);
  const totalProgress = selectors.getTotalProgress(state);
  const formattedTime = selectors.getFormattedTime(state.remainingMs);
  
  if (!state.currentStep) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
            No current step available
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const isRestStep = state.currentStep.type === 'rest';

  return (
    <SafeAreaView style={[
      styles.container, 
      isDark && styles.containerDark,
      isRestStep && styles.containerRest,
      isRestStep && isDark && styles.containerRestDark
    ]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleExit} style={styles.exitButton}>
          <Text style={[styles.exitButtonText, isDark && styles.exitButtonTextDark]}>
            Exit
          </Text>
        </Pressable>
        
        <View style={styles.progressContainer}>
          <Text style={[styles.progressText, isDark && styles.progressTextDark]}>
            {state.currentStepIndex + 1} of {state.program?.steps.length || 0}
          </Text>
          <View style={[styles.progressBar, isDark && styles.progressBarDark]}>
            <View 
            style={[
                styles.progressFill,
                { width: `${totalProgress * 100}%` }
              ]} 
            />
          </View>
        </View>
        
        <View style={styles.headerSpacer} />
      </View>
      
      {/* Main Content */}
      <Animated.View style={[styles.mainContent, stepContentStyle]}>
        {/* Step Info */}
        <View style={styles.stepInfo}>
          <Text style={[
            styles.stepType, 
            isDark && styles.stepTypeDark,
            isRestStep && styles.stepTypeRest,
            isRestStep && isDark && styles.stepTypeRestDark
          ]}>
            {isRestStep ? 'Rest Break' : 'Exercise'}
          </Text>
          
          <Text style={[
            styles.stepTitle, 
            isDark && styles.stepTitleDark,
            isRestStep && styles.stepTitleRest,
            isRestStep && isDark && styles.stepTitleRestDark
          ]}>
            {state.currentStep.title}
          </Text>
          
          {state.currentStep.type === 'exercise' && 'description' in state.currentStep && state.currentStep.description && (
            <Text style={[
              styles.stepDescription, 
              isDark && styles.stepDescriptionDark
            ]}>
              {state.currentStep.description}
            </Text>
          )}
          
          {state.currentStep.type === 'rest' && 'tip' in state.currentStep && state.currentStep.tip && (
            <Text style={[
              styles.restTip, 
              isDark && styles.restTipDark
            ]}>
              💡 {state.currentStep.tip}
            </Text>
          )}
        </View>
        
        {/* Timer and Ring */}
        <View style={styles.timerContainer}>
          <View style={styles.ringContainer}>
            <CountdownRing
              progress={currentProgress}
              size={240}
              strokeWidth={16}
              colors={{
                track: isDark ? '#333333' : '#E5E5E5',
                progress: isRestStep 
                  ? (isDark ? '#FF9500' : '#FF8C00')
                  : (isDark ? '#0A84FF' : '#007AFF'),
                progressCritical: '#FF3B30'
              }}
            />
            <View style={styles.timerTextContainer}>
              <Text style={[
                styles.timerText, 
                isDark && styles.timerTextDark,
                isRestStep && styles.timerTextRest,
                isRestStep && isDark && styles.timerTextRestDark
              ]}>
                {formattedTime}
              </Text>
              {state.currentStep.type === 'exercise' && 'targetReps' in state.currentStep && state.currentStep.targetReps && (
                <Text style={[styles.targetReps, isDark && styles.targetRepsDark]}>
                  Target: {state.currentStep.targetReps} reps
                </Text>
              )}
            </View>
          </View>
        </View>
        
        {/* Exercise Animation Placeholder */}
        {state.currentStep.type === 'exercise' && (
          <View style={styles.animationContainer}>
            <View style={[styles.animationPlaceholder, isDark && styles.animationPlaceholderDark]}>
              <Text style={styles.exerciseIcon}>
                {'icon' in state.currentStep && state.currentStep.icon ? state.currentStep.icon : '💪'}
              </Text>
              <Text style={[styles.animationLabel, isDark && styles.animationLabelDark]}>
                Exercise Animation
            </Text>
          </View>
        </View>
      )}
      </Animated.View>
      
      {/* Controls */}
      <View style={styles.controls}>
        {isRestStep ? (
          <View style={styles.restControls}>
          <Pressable
              style={[styles.restButton, styles.skipButton, isDark && styles.restButtonDark]}
              onPress={handleSkipRest}
            >
              <Text style={[styles.restButtonText, isDark && styles.restButtonTextDark]}>
                Skip Rest
              </Text>
            </Pressable>
            
            <Pressable
              style={[styles.restButton, styles.addTimeButton, isDark && styles.restButtonDark]}
              onPress={handleAddTenSeconds}
            >
              <Text style={[styles.restButtonText, isDark && styles.restButtonTextDark]}>
                +10s
              </Text>
            </Pressable>
          </View>
        ) : null}
        
        <View style={styles.mainControls}>
          <Pressable 
            style={[styles.controlButton, styles.nextButton, isDark && styles.controlButtonDark]}
            onPress={handleNextStep}
          >
            <Text style={[styles.controlButtonText, isDark && styles.controlButtonTextDark]}>
              Next
            </Text>
          </Pressable>
          
          <Pressable 
            style={[
              styles.controlButton, 
              styles.pauseButton,
              isDark && styles.controlButtonDark,
              state.state === 'paused' && styles.resumeButton
            ]}
            onPress={handlePauseResume}
          >
            <Text style={[
              styles.controlButtonText, 
              styles.pauseButtonText,
              isDark && styles.controlButtonTextDark
            ]}>
              {state.state === 'paused' ? 'Resume' : 'Pause'}
            </Text>
          </Pressable>
        </View>
      </View>
      
      {/* Next Up Banner */}
      {state.showNextUpBanner && (
        <Animated.View style={[styles.nextUpBanner, nextUpBannerStyle, isDark && styles.nextUpBannerDark]}>
          <Text style={[styles.nextUpText, isDark && styles.nextUpTextDark]}>
            Next up:
          </Text>
          <Text style={[styles.nextUpTitle, isDark && styles.nextUpTitleDark]}>
            {state.isLastStep ? 'Finish!' : (state.nextUpStep?.title || 'Rest')}
          </Text>
        </Animated.View>
      )}
      
      {/* Paused Overlay */}
      {state.state === 'paused' && (
        <View style={[styles.pausedOverlay, isDark && styles.pausedOverlayDark]}>
          <Text style={[styles.pausedText, isDark && styles.pausedTextDark]}>
            Paused
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  containerDark: {
    backgroundColor: '#000000'
  },
  containerRest: {
    backgroundColor: '#FFF8F0'
  },
  containerRestDark: {
    backgroundColor: '#1A1512'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16
  },
  exitButton: {
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  exitButtonText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '500'
  },
  exitButtonTextDark: {
    color: '#FF453A'
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20
  },
  progressText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    fontWeight: '500'
  },
  progressTextDark: {
    color: '#AAAAAA'
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    overflow: 'hidden'
  },
  progressBarDark: {
    backgroundColor: '#333333'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF'
  },
  headerSpacer: {
    width: 60
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-around'
  },
  stepInfo: {
    alignItems: 'center',
    marginBottom: 20
  },
  stepType: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8
  },
  stepTypeDark: {
    color: '#AAAAAA'
  },
  stepTypeRest: {
    color: '#FF8C00'
  },
  stepTypeRestDark: {
    color: '#FF9500'
  },
  stepTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 16
  },
  stepTitleDark: {
    color: '#FFFFFF'
  },
  stepTitleRest: {
    color: '#FF8C00'
  },
  stepTitleRestDark: {
    color: '#FF9500'
  },
  stepDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20
  },
  stepDescriptionDark: {
    color: '#AAAAAA'
  },
  restTip: {
    fontSize: 16,
    color: '#FF8C00',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    fontStyle: 'italic'
  },
  restTipDark: {
    color: '#FF9500'
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 40
  },
  ringContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center'
  },
  timerTextContainer: {
    position: 'absolute',
    alignItems: 'center'
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#000000',
    fontVariant: ['tabular-nums']
  },
  timerTextDark: {
    color: '#FFFFFF'
  },
  timerTextRest: {
    color: '#FF8C00'
  },
  timerTextRestDark: {
    color: '#FF9500'
  },
  targetReps: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
    fontWeight: '500'
  },
  targetRepsDark: {
    color: '#AAAAAA'
  },
  animationContainer: {
    alignItems: 'center',
    marginTop: 20
  },
  animationPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: '#F8F9FA',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed'
  },
  animationPlaceholderDark: {
    backgroundColor: '#1A1A1A',
    borderColor: '#333333'
  },
  exerciseIcon: {
    fontSize: 32,
    marginBottom: 8
  },
  animationLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center'
  },
  animationLabelDark: {
    color: '#AAAAAA'
  },
  controls: {
    paddingHorizontal: 20,
    paddingBottom: 34
  },
  restControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20
  },
  restButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#FF8C00',
    minWidth: 100,
    alignItems: 'center'
  },
  restButtonDark: {
    backgroundColor: '#FF9500'
  },
  skipButton: {
    backgroundColor: '#FF3B30'
  },
  addTimeButton: {
    backgroundColor: '#FF8C00'
  },
  restButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  restButtonTextDark: {
    color: '#FFFFFF'
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16
  },
  controlButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#007AFF'
  },
  controlButtonDark: {
    backgroundColor: '#0A84FF'
  },
  nextButton: {
    backgroundColor: '#34C759'
  },
  pauseButton: {
    backgroundColor: '#FF9500'
  },
  resumeButton: {
    backgroundColor: '#34C759'
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600'
  },
  controlButtonTextDark: {
    color: '#FFFFFF'
  },
  pauseButtonText: {
    color: '#FFFFFF'
  },
  nextUpBanner: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  nextUpBannerDark: {
    backgroundColor: '#0A84FF'
  },
  nextUpText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8
  },
  nextUpTextDark: {
    color: '#FFFFFF'
  },
  nextUpTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    flex: 1
  },
  nextUpTitleDark: {
    color: '#FFFFFF'
  },
  pausedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  pausedOverlayDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  },
  pausedText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700'
  },
  pausedTextDark: {
    color: '#FFFFFF'
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B30',
    textAlign: 'center'
  },
  errorTextDark: {
    color: '#FF453A'
  }
});