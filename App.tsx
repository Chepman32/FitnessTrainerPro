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
import { TrainingScreen } from './src/screens/TrainingScreen';
import DoneScreen from './src/screens/DoneScreen';
import { LibraryNavigator } from './src/navigation/LibraryNavigator';
import { ProfileNavigator } from './src/navigation/ProfileNavigator';
import { ArticleDetailScreen } from './src/screens/ArticleDetailScreen';
import { ProgramStartScreen } from './src/screens/ProgramStartScreen';
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
import { Program, ExerciseStep, RestStep } from './src/types/program';
import { TRAINING_TYPES } from './src/data/trainingTypes';

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

// Function to create a dynamic training program based on session setup
const createDynamicTrainingProgram = (setup: any): Program => {
  const { typeId, durationMin, difficulty } = setup;
  
  // Convert duration to seconds (0.05 = 3 seconds, others are in minutes)
  const totalDurationSec = durationMin === 0.05 ? 3 : durationMin * 60;
  
  // Get the selected training type
  const trainingType = TRAINING_TYPES.find(t => t.id === typeId);
  const exerciseTitle = trainingType?.title || 'Custom Exercise';
  
  // Create a simple program with the specified duration
  const steps: (ExerciseStep | RestStep)[] = [];
  
  if (totalDurationSec <= 10) {
    // For very short durations (3-10 seconds), just do one exercise
    steps.push({
      id: 'quick_exercise',
      type: 'exercise',
      title: exerciseTitle,
      durationSec: totalDurationSec,
      description: `Quick ${exerciseTitle.toLowerCase()} session`,
      icon: '⚡',
      animationRef: typeId || 'pushups',
      targetReps: Math.max(1, Math.floor(totalDurationSec / 2)),
      equipment: []
    });
  } else {
    // For longer durations, create a proper workout structure
    const exerciseDuration = Math.floor(totalDurationSec * 0.8); // 80% exercise, 20% rest
    const restDuration = totalDurationSec - exerciseDuration;
    
    // Split into multiple exercises if duration allows
    const numExercises = Math.max(1, Math.floor(exerciseDuration / 30)); // 30 seconds per exercise
    const exerciseTimePerStep = Math.floor(exerciseDuration / numExercises);
    
    for (let i = 0; i < numExercises; i++) {
      steps.push({
        id: `exercise_${i + 1}`,
        type: 'exercise',
        title: `${exerciseTitle} ${i + 1}`,
        durationSec: exerciseTimePerStep,
        description: `Round ${i + 1} of ${exerciseTitle.toLowerCase()}`,
        icon: '💪',
        animationRef: typeId || 'pushups',
        targetReps: Math.max(1, Math.floor(exerciseTimePerStep / 2)),
        equipment: []
      });
      
      // Add rest between exercises (except after the last one)
      if (i < numExercises - 1 && restDuration > 0) {
        const restTime = Math.min(15, Math.floor(restDuration / (numExercises - 1)));
        steps.push({
          id: `rest_${i + 1}`,
          type: 'rest',
          title: 'Rest',
          durationSec: restTime,
          tip: 'Take a quick breather'
        });
      }
    }
  }
  
  return {
    id: `dynamic_${typeId}_${durationMin}`,
    title: `${exerciseTitle} - ${durationMin === 0.05 ? '3 sec' : `${durationMin} min`}`,
    level: difficulty,
    description: `Custom ${exerciseTitle.toLowerCase()} workout for ${durationMin === 0.05 ? '3 seconds' : `${durationMin} minutes`}`,
    totalActiveSec: steps.filter(s => s.type === 'exercise').reduce((sum, s) => sum + s.durationSec, 0),
    totalRestSec: steps.filter(s => s.type === 'rest').reduce((sum, s) => sum + s.durationSec, 0),
    stepsCount: steps.length,
    tags: ['Custom', 'Dynamic', difficulty],
    steps,
    estimatedCalories: Math.round((durationMin === 0.05 ? 0.05 : durationMin) * 8.6),
    thumbnailUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    difficulty: difficulty === 'Light' ? 1 : difficulty === 'Easy' ? 2 : difficulty === 'Middle' ? 3 : difficulty === 'Stunt' ? 4 : difficulty === 'Hardcore' ? 5 : 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

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
      <Tab.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size ?? 24} color={color as string} />
          ),
        }}
      >
        {() => <ProfileNavigator />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// Wrapper component to use hooks properly
const TrainingScreenWrapper: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { setup } = useSession();
  const dynamicProgram = createDynamicTrainingProgram(setup);
  
  return (
    <TrainingScreen
      program={dynamicProgram}
      soundsEnabled={true}
      vibrationsEnabled={true}
      onComplete={() => navigation.navigate('done')}
      onExit={() => navigation.navigate('home')}
    />
  );
};

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
        {({ navigation }) => {
          return <TrainingScreenWrapper navigation={navigation} />;
        }}
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
          <TrainingScreen
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
