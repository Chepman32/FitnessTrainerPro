import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Pressable } from 'react-native';
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
  const totalMs = useMemo(() => Math.max(1, (setup?.durationMin ?? 5) * 60 * 1000), [setup?.durationMin]);

  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const engineRef = useRef<ReturnType<typeof createTimerEngine> | null>(null);

  // create engine once per totalMs change
  useEffect(() => {
    engineRef.current?.reset?.();
    engineRef.current = createTimerEngine(
      { totalMs },
      {
        onTick: setElapsed,
        onComplete: () => {
          setRunning(false);
          setState('completed');
          // light haptic on completion
          ReactNativeHapticFeedback.trigger('notificationSuccess', { enableVibrateFallback: true, ignoreAndroidSystemSettings: false });
          onComplete?.();
        },
      },
    );
    // autostart
    engineRef.current.start();
    setRunning(true);
    setState('running');
    return () => {
      engineRef.current?.reset?.();
    };
  }, [totalMs, onComplete, setState]);

  const progress = Math.min(1, elapsed / totalMs);
  const mm = Math.floor((totalMs - elapsed) / 60000);
  const ss = Math.max(0, Math.floor(((totalMs - elapsed) % 60000) / 1000));

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Training</Text>
      <View style={styles.ringWrap}>
        <ProgressRing size={220} strokeWidth={14} progress={progress} />
        <View style={styles.ringCenter}>
          <Text style={styles.timer}>{String(mm).padStart(2, '0')}:{String(ss).padStart(2, '0')}</Text>
        </View>
      </View>

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  text: { fontSize: 16, marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12 },
  button: { backgroundColor: '#5B9BFF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  buttonGhost: { borderColor: '#5B9BFF', borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  ringWrap: { width: 240, height: 240, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  ringCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  timer: { fontSize: 28, fontWeight: '700' },
  buttonText: { color: 'white', fontWeight: '700' },
});

export default TrainingScreen;
