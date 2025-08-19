/**
 * Fitness Trainer Pro App bootstrap
 */

import React, { useMemo, useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PreferencesProvider } from './src/state/PreferencesContext';
import { SessionProvider, useSession } from './src/state/SessionContext';
import HomeScreen from './src/screens/HomeScreen';
import SetupScreen from './src/screens/SetupScreen';
import TrainingScreen from './src/screens/TrainingScreen';
import DoneScreen from './src/screens/DoneScreen';

type Route = 'home' | 'setup' | 'training' | 'done';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <PreferencesProvider>
        <SessionProvider>
          <AppRouter />
        </SessionProvider>
      </PreferencesProvider>
    </SafeAreaProvider>
  );
}

function AppRouter() {
  const [route, setRoute] = useState<Route>('home');
  const { setSetup } = useSession();

  const screens = useMemo(() => ({
    home: (
      <HomeScreen
        onSelect={t => {
          setSetup({ typeId: t.id });
          setRoute('setup');
        }}
      />
    ),
    setup: <SetupScreen />,
    training: <TrainingScreen />,
    done: <DoneScreen />,
  }), [setSetup]);

  return <View style={styles.container}>{screens[route]}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
