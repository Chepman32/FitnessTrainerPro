import React from 'react';
import { StatusBar, useColorScheme, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PreferencesProvider } from './src/state/PreferencesContext';
import { SessionProvider, useSession } from './src/state/SessionContext';
// Add Library and UserProgress providers
import { LibraryProvider } from './src/state/LibraryContext';
import { UserProgressProvider } from './src/state/UserProgressContext';
import HomeScreen from './src/screens/HomeScreen';
import SetupScreen from './src/screens/SetupScreen';
import TrainingScreen from './src/screens/TrainingScreen';
import DoneScreen from './src/screens/DoneScreen';
import { LibraryScreen } from './src/screens/LibraryScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type RootStackParamList = {
  home: undefined;
  setup: undefined;
  training: undefined;
  done: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function PlaceholderScreen({ title }: { title: string }) {
  return (
    <SafeAreaProvider>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#060A18',
        }}
      >
        <Text style={{ color: 'white', fontSize: 24 }}>{title}</Text>
      </View>
    </SafeAreaProvider>
  );
}

function HomeTabs() {
  const { setSetup } = useSession();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0A1224', borderTopWidth: 0 },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.6)',
      }}
    >
      <Tab.Screen
        name="HomeTab"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      >
        {({ navigation }) => (
          <HomeScreen
            onSelect={t => {
              setSetup({ typeId: t.id });
              navigation.navigate('setup');
            }}
            onStart={() => navigation.navigate('training')}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Library"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library-outline" size={size} color={color} />
          ),
        }}
      >
        {() => (
          <LibraryScreen />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Favorites"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }}
      >
        {() => <PlaceholderScreen title="Favorites" />}
      </Tab.Screen>
      <Tab.Screen
        name="History"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      >
        {() => <PlaceholderScreen title="History" />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator
      initialRouteName="home"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="home" component={HomeTabs} />
      <Stack.Screen
        name="setup"
        options={{ headerShown: true, title: 'Setup' }}
      >
        {({ navigation }) => (
          <SetupScreen onStart={() => navigation.navigate('training')} />
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

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.flex1}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <PreferencesProvider>
          <SessionProvider>
            <LibraryProvider>
              <UserProgressProvider>
                <NavigationContainer>
                  <AppStack />
                </NavigationContainer>
              </UserProgressProvider>
            </LibraryProvider>
          </SessionProvider>
        </PreferencesProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
});

export default App;
