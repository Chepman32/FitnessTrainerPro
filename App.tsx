import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PreferencesProvider } from './src/state/PreferencesContext';
import { SessionProvider, useSession } from './src/state/SessionContext';
// Add Library, UserProgress, and Favorites providers
import { LibraryProvider } from './src/state/LibraryContext';
import { UserProgressProvider } from './src/state/UserProgressContext';
import { FavoritesProvider } from './src/state/FavoritesContext';
import { WorkoutHistoryProvider, useWorkoutHistory } from './src/state/WorkoutHistoryContext';
import HomeScreen from './src/screens/HomeScreen';
import SetupScreen from './src/screens/SetupScreen';
import { TrainingScreen } from './src/screens/TrainingScreen';
import { SimpleTrainingScreen } from './src/screens/SimpleTrainingScreen';
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
import { ThemeProvider, useTheme } from './src/state/ThemeContext';
import { Program, ExerciseStep } from './src/types/program';
import { TRAINING_TYPES } from './src/data/trainingTypes';
import { remoteImageCacheService } from './src/services/remoteImageCacheService';

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

// Function to create a simple single-exercise program for HomeScreen training
const createDynamicTrainingProgram = (setup: any): Program => {
  const { typeId, durationMin, difficulty } = setup;
  
  // Convert duration to seconds (0.05 = 3 seconds, others are in minutes)
  const totalDurationSec = durationMin === 0.05 ? 3 : durationMin * 60;
  
  // Get the selected training type
  const trainingType = TRAINING_TYPES.find(t => t.id === typeId);
  const exerciseTitle = trainingType?.title || 'Custom Exercise';
  
  // Create a simple single-step program for HomeScreen training
  const steps: ExerciseStep[] = [{
    id: 'single_exercise',
    type: 'exercise',
    title: exerciseTitle,
    durationSec: totalDurationSec,
    description: `${exerciseTitle} session for ${durationMin === 0.05 ? '3 seconds' : `${durationMin} minutes`}`,
    icon: '💪',
    animationRef: typeId || 'pushups',
    targetReps: Math.max(1, Math.floor(totalDurationSec / 2)),
    equipment: []
  }];
  
  return {
    id: `simple_${typeId}_${durationMin}`,
    title: `${exerciseTitle} - ${durationMin === 0.05 ? '3 sec' : `${durationMin} min`}`,
    level: difficulty,
    description: `Simple ${exerciseTitle.toLowerCase()} workout for ${durationMin === 0.05 ? '3 seconds' : `${durationMin} minutes`}`,
    totalActiveSec: totalDurationSec,
    totalRestSec: 0,
    stepsCount: 1,
    tags: ['Simple', 'Single', difficulty],
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
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { 
          backgroundColor: theme.colors.tabBarBackground, 
          borderTopWidth: 0 
        },
        tabBarActiveTintColor: theme.colors.tabBarActive,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
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
  const { setup, setState } = useSession();
  const { addSession } = useWorkoutHistory();
  const dynamicProgram = createDynamicTrainingProgram(setup);

  // Check if this is a simple single-step program from HomeScreen
  const isSimpleTraining = dynamicProgram.stepsCount === 1 && dynamicProgram.tags.includes('Simple');

  const handleComplete = (results: any) => {
    addSession({
      completedAt: new Date().toISOString(),
      totalElapsedMs: results?.totalElapsedMs ?? 0,
      estimatedCalories: results?.program?.estimatedCalories ?? dynamicProgram.estimatedCalories ?? 0,
      programTitle: results?.program?.title ?? dynamicProgram.title,
    });
    setState('idle');
    navigation.navigate('done');
  };
  
  const handleExit = ({ totalElapsedMs }: { totalElapsedMs: number }) => {
    if (totalElapsedMs > 0) {
      addSession({
        completedAt: new Date().toISOString(),
        totalElapsedMs,
        estimatedCalories: Math.round((dynamicProgram.estimatedCalories ?? 0) * (totalElapsedMs / (dynamicProgram.totalActiveSec * 1000))),
        programTitle: dynamicProgram.title,
      });
    }
    setState('idle');
    navigation.navigate('home');
  };
  
  if (isSimpleTraining) {
    return (
      <SimpleTrainingScreen
        program={dynamicProgram}
        _soundsEnabled={true}
        vibrationsEnabled={true}
        onComplete={handleComplete}
        onExit={handleExit}
      />
    );
  }
  
  // Use complex TrainingScreen for multi-step programs
  return (
    <TrainingScreen
      program={dynamicProgram}
      soundsEnabled={true}
      vibrationsEnabled={true}
      onComplete={handleComplete}
      onExit={handleExit}
    />
  );
};

const ComplexTrainingWrapper: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { addSession } = useWorkoutHistory();
  const { program, soundsEnabled, vibrationsEnabled } = route.params;
  return (
    <TrainingScreen
      program={program}
      soundsEnabled={soundsEnabled}
      vibrationsEnabled={vibrationsEnabled}
      onComplete={(completionData) => {
        addSession({
          completedAt: new Date().toISOString(),
          totalElapsedMs: completionData?.totalElapsedMs ?? 0,
          estimatedCalories: completionData?.program?.estimatedCalories ?? program.estimatedCalories ?? 0,
          programTitle: completionData?.program?.title ?? program.title,
        });
        navigation.replace('programFinish', { completionData });
      }}
      onExit={({ totalElapsedMs }) => {
        if (totalElapsedMs > 0) {
          addSession({
            completedAt: new Date().toISOString(),
            totalElapsedMs,
            estimatedCalories: Math.round((program.estimatedCalories ?? 0) * (totalElapsedMs / (program.totalActiveSec * 1000))),
            programTitle: program.title,
          });
        }
        navigation.goBack();
      }}
    />
  );
};

function AppStack() {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      initialRouteName="home"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="home" component={HomeTabs} />
      <Stack.Screen
        name="setup"
        options={{
          headerShown: true,
          title: 'Setup',
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
            color: theme.colors.text,
          },
        }}
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
        component={ComplexTrainingWrapper}
      />
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

  useEffect(() => {
    void remoteImageCacheService.init();
  }, []);

  return (
    <GestureHandlerRootView style={styles.flex1}>
      <SafeAreaProvider>
        <ThemeProvider>
          <PreferencesProvider>
            <LibraryProvider>
              <UserProgressProvider>
                <WorkoutHistoryProvider>
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
                </WorkoutHistoryProvider>
              </UserProgressProvider>
            </LibraryProvider>
          </PreferencesProvider>
        </ThemeProvider>
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
