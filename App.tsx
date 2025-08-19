/**
 * Fitness Trainer Pro App bootstrap
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PreferencesProvider } from './src/state/PreferencesContext';
import { SessionProvider, useSession } from './src/state/SessionContext';
import HomeScreen from './src/screens/HomeScreen';
import SetupScreen from './src/screens/SetupScreen';
import TrainingScreen from './src/screens/TrainingScreen';
import DoneScreen from './src/screens/DoneScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

type RootStackParamList = {
  home: undefined;
  setup: undefined;
  training: undefined;
  done: undefined;
};
const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <PreferencesProvider>
          <SessionProvider>
            <NavigationContainer>
              <AppStack />
            </NavigationContainer>
          </SessionProvider>
        </PreferencesProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

function AppStack() {
  const { setSetup } = useSession();
  return (
    <Stack.Navigator
      initialRouteName="home"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="home">
        {({ navigation }) => (
          <HomeScreen
            onSelect={t => {
              setSetup({ typeId: t.id });
              navigation.navigate('setup');
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="setup">
        {({ navigation }) => (
          <SetupScreen
            onStart={() => navigation.navigate('training')}
            onBack={() => navigation.navigate('home')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="training">
        {({ navigation }) => (
          <TrainingScreen
            onComplete={() => navigation.navigate('done')}
            onExit={() => navigation.navigate('home')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="done">
        {({ navigation }) => (
          <DoneScreen
            onReplay={() => navigation.navigate('training')}
            onChangeSetup={() => navigation.navigate('setup')}
            onHome={() => navigation.navigate('home')}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export default App;
