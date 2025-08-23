import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PreferencesProvider } from './src/state/PreferencesContext';
import { SessionProvider, useSession } from './src/state/SessionContext';
// Add Library, UserProgress, and Favorites providers
import { LibraryProvider } from './src/state/LibraryContext';
import { UserProgressProvider } from './src/state/UserProgressContext';
import { FavoritesProvider } from './src/state/FavoritesContext';
import HomeScreen from './src/screens/HomeScreen';
import SetupScreen from './src/screens/SetupScreen';
import { OriginalTrainingScreen } from './src/screens/OriginalTrainingScreen';
import DoneScreen from './src/screens/DoneScreen';
import { LibraryNavigator } from './src/navigation/LibraryNavigator';
import { ArticleDetailScreen } from './src/screens/ArticleDetailScreen';
import { FavoritesScreen } from './src/screens/FavoritesScreen';
import { ProgramStartScreen } from './src/screens/ProgramStartScreen';
import { TrainingScreen as ComplexTrainingScreen } from './src/screens/TrainingScreen';
import { ProgramFinishScreen } from './src/screens/ProgramFinishScreen';
import { ProgramsTestScreen } from './src/screens/ProgramsTestScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
// Use Ionicons for vector icons in the tab bar
import Ionicons from 'react-native-vector-icons/Ionicons';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { OnboardingProvider, useOnboarding } from './src/state/OnboardingContext';

type RootStackParamList = {
  home: undefined;
  setup: undefined;
  training: undefined;
  done: undefined;
  articleDetail: { article: any };
  programStart: { program: any };
  complexTraining: { program: any; soundsEnabled: boolean; vibrationsEnabled: boolean };
  programFinish: { completionData: any };
  programsTest: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

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
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size ?? 24} color={color as string} />
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
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'book' : 'book-outline'} size={size ?? 24} color={color as string} />
          ),
        }}
      >
        {() => <LibraryNavigator />}
      </Tab.Screen>
      <Tab.Screen
        name="Favorites"
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'heart' : 'heart-outline'} size={size ?? 24} color={color as string} />
          ),
        }}
      >
        {({ navigation }) => (
          <FavoritesScreen 
            onArticlePress={(article) => {
              navigation.navigate('articleDetail', { article });
            }}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Programs"
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={size ?? 24} color={color as string} />
          ),
        }}
      >
        {({ navigation }) => (
          <ProgramsTestScreen
            onProgramSelect={(program) => {
              navigation.navigate('programStart', { program });
            }}
            onBack={() => navigation.goBack()}
          />
        )}
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
          <OriginalTrainingScreen
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
      <Stack.Screen 
        name="articleDetail"
        options={{ headerShown: false }}
      >
        {({ navigation, route }) => (
          <ArticleDetailScreen
            article={route.params.article}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="programStart"
        options={{ headerShown: false }}
      >
        {({ navigation, route }) => (
          <ProgramStartScreen
            program={route.params.program}
            onStart={(soundsEnabled, vibrationsEnabled) => {
              navigation.navigate('complexTraining', { 
                program: route.params.program, 
                soundsEnabled, 
                vibrationsEnabled 
              });
            }}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="complexTraining"
        options={{ headerShown: false }}
      >
        {({ navigation, route }) => (
          <ComplexTrainingScreen
            program={route.params.program}
            soundsEnabled={route.params.soundsEnabled}
            vibrationsEnabled={route.params.vibrationsEnabled}
            onComplete={(completionData) => {
              navigation.replace('programFinish', { completionData });
            }}
            onExit={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="programFinish"
        options={{ headerShown: false }}
      >
        {({ navigation, route }) => (
          <ProgramFinishScreen
            completionData={route.params.completionData}
            onDone={() => navigation.navigate('home')}
            onRepeat={() => {
              navigation.replace('complexTraining', { 
                program: route.params.completionData.program,
                soundsEnabled: true,
                vibrationsEnabled: true,
              });
            }}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { loading, hasOnboarded } = useOnboarding();
  if (loading) return <SplashScreen />;
  return hasOnboarded ? <AppStack /> : <OnboardingScreen />;
}

function App() {
  const colorScheme = useColorScheme();
  return (
    <GestureHandlerRootView style={styles.flex1}>
      <SafeAreaProvider>
        <PreferencesProvider>
          <LibraryProvider>
            <UserProgressProvider>
              <FavoritesProvider>
                <SessionProvider>
                  <OnboardingProvider>
                    <NavigationContainer>
                      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
                      <RootNavigator />
                    </NavigationContainer>
                  </OnboardingProvider>
                </SessionProvider>
              </FavoritesProvider>
            </UserProgressProvider>
          </LibraryProvider>
        </PreferencesProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  tabIcon: {
    textAlign: 'center',
  },
  tabIconFocused: {
    fontSize: 26,
    opacity: 1,
  },
  tabIconUnfocused: {
    fontSize: 24,
    opacity: 0.6,
  },
});

export default App;
