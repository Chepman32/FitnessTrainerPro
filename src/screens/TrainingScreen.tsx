import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Animated,
} from 'react-native';
import { useSession } from '../state/SessionContext';
import { createTimerEngine } from '../timer/timerEngine';
import ProgressRing from '../components/ProgressRing';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

type Props = {
  onComplete?: () => void;
  onExit?: () => void;
};

export const TrainingScreen: React.FC<Props> = ({ onComplete, onExit }) => {
  const { setup, setState } = useSession();
  const totalMs = useMemo(
    () => Math.max(1, (setup?.durationMin ?? 5) * 60 * 1000),
    [setup?.durationMin],
  );

  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(true);
  const engineRef = useRef<ReturnType<typeof createTimerEngine> | null>(null);

  // Animation values for countdown - slide-in-back effect
  const countdownScale = useRef(new Animated.Value(0.3)).current;
  const countdownOpacity = useRef(new Animated.Value(0)).current;
  const countdownTranslateY = useRef(new Animated.Value(-50)).current;

  // Countdown effect
  useEffect(() => {
    if (showCountdown && countdown > 0) {
      // Reset animation values for slide-back effect (start large and in front)
      countdownScale.setValue(1.5);
      countdownOpacity.setValue(1);
      countdownTranslateY.setValue(0);

      // Animate digit dropping back into the screen (getting smaller and moving away)
      Animated.parallel([
        Animated.spring(countdownScale, {
          toValue: 0.3,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(countdownOpacity, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(countdownTranslateY, {
          toValue: 50,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        if (countdown === 1) {
          setShowCountdown(false);
        } else {
          setCountdown(countdown - 1);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [
    countdown,
    showCountdown,
    countdownScale,
    countdownOpacity,
    countdownTranslateY,
  ]);

  // create engine once per totalMs change
  useEffect(() => {
    if (!showCountdown) {
      engineRef.current?.reset?.();
      engineRef.current = createTimerEngine(
        { totalMs },
        {
          onTick: setElapsed,
          onComplete: () => {
            setRunning(false);
            setState('completed');
            // light haptic on completion
            ReactNativeHapticFeedback.trigger('notificationSuccess', {
              enableVibrateFallback: true,
              ignoreAndroidSystemSettings: false,
            });
            onComplete?.();
          },
        },
      );
      // autostart
      engineRef.current.start();
      setRunning(true);
      setState('running');
    }
    return () => {
      engineRef.current?.reset?.();
    };
  }, [totalMs, onComplete, setState, showCountdown]);

  const progress = Math.min(1, elapsed / totalMs);
  const mm = Math.floor((totalMs - elapsed) / 60000);
  const ss = Math.max(0, Math.floor(((totalMs - elapsed) % 60000) / 1000));

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Training</Text>

      {showCountdown ? (
        <View style={styles.countdownContainer}>
          <Animated.Text
            style={[
              styles.countdownText,
              {
                transform: [
                  { scale: countdownScale },
                  { translateY: countdownTranslateY },
                ],
                opacity: countdownOpacity,
              },
            ]}
          >
            {countdown}
          </Animated.Text>
        </View>
      ) : (
        <View style={styles.ringWrap}>
          <ProgressRing size={220} strokeWidth={14} progress={progress} />
          <View style={styles.ringCenter}>
            <Text style={styles.timer}>
              {String(mm).padStart(2, '0')}:{String(ss).padStart(2, '0')}
            </Text>
          </View>
        </View>
      )}

      {!showCountdown && (
        <View style={styles.row}>
          <Pressable
            style={styles.buttonGhost}
            onPress={() => {
              engineRef.current?.reset?.();
              setElapsed(0);
              setRunning(false);
              setState('idle');
              onExit?.();
            }}
          >
            <Text>Exit</Text>
          </Pressable>

          {running ? (
            <Pressable
              style={styles.buttonGhost}
              onPress={() => {
                engineRef.current?.pause?.();
                setRunning(false);
                setState('paused');
              }}
            >
              <Text>Pause</Text>
            </Pressable>
          ) : (
            <Pressable
              style={styles.button}
              onPress={() => {
                engineRef.current?.start?.();
                setRunning(true);
                setState('running');
              }}
            >
              <Text style={styles.buttonText}>Start</Text>
            </Pressable>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  text: { fontSize: 16, marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12 },
  button: {
    backgroundColor: '#5B9BFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  buttonGhost: {
    borderColor: '#5B9BFF',
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  ringWrap: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timer: { fontSize: 28, fontWeight: '700' },
  buttonText: { color: 'white', fontWeight: '700' },
  countdownContainer: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  countdownText: {
    fontSize: 120,
    fontWeight: '800',
    color: '#5B9BFF',
    textAlign: 'center',
  },
});

export default TrainingScreen;
