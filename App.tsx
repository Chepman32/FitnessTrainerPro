import React from 'react';
import { StatusBar, useColorScheme, View, Text, Alert } from 'react-native';
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
import { LibraryScreen } from './src/screens/LibraryScreen';
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
// Temporarily removing Ionicons import due to icon display issues
// import Ionicons from 'react-native-vector-icons/Ionicons';

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

// Temporary emoji icon component until vector icons are properly configured
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const getIcon = () => {
    switch (name) {
      case 'home': return '🏠';
      case 'library': return '📚';
      case 'favorites': return '❤️';
      case 'programs': return '🎯';
      case 'history': return '🕐';
      default: return '📱';
    }
  };

  return (
    <Text style={[
      styles.tabIcon,
      focused ? styles.tabIconFocused : styles.tabIconUnfocused
    ]}>
      {getIcon()}
    </Text>
  );
}

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
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" focused={focused} />
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
          tabBarIcon: ({ focused }) => (
            <TabIcon name="library" focused={focused} />
          ),
        }}
      >
        {({ navigation }) => (
          <LibraryScreen 
            onContentPress={(content) => {
              console.log('Content pressed:', content.title, content.type);
              if (content.type === 'program') {
                console.log('Program details:', {
                  hasComplexProgram: !!(content as any).complexProgram,
                  weeks: (content as any).weeks,
                  tags: (content as any).tags
                });
              }
              if (content.type === 'article') {
                navigation.navigate('articleDetail', { article: content });
              } else if (content.type === 'program' && (content as any).complexProgram) {
                // Handle Complex Training Programs (timed workouts)
                console.log('Starting Complex Training Program:', content.title);
                navigation.navigate('programStart', { program: (content as any).complexProgram });
              } else if (content.type === 'program') {
                // Handle traditional programs (multi-week programs)
                const program = content as any;
                console.log('Traditional program tapped:', content.title);
                console.log('This is a', program.weeks, 'week program with', program.totalWorkouts, 'workouts');
                
                Alert.alert(
                  'Traditional Program',
                  `"${content.title}" is a ${program.weeks}-week program with ${program.totalWorkouts} total workouts.\n\nFor immediate timed workouts with step-by-step guidance, check out the Programs tab (🎯).`,
                  [
                    { text: 'Go to Programs Tab', onPress: () => navigation.navigate('Programs') },
                    { text: 'OK' }
                  ]
                );
              } else {
                // Handle other content types (workouts, challenges)
                console.log('Other content type tapped - detail screen not implemented yet');
              }
            }}
            onSeeAllPress={(section) => {
              console.log('See all pressed for section:', section.title);
              // Later you can add navigation.navigate('SectionDetail', { section })
            }}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Favorites"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="favorites" focused={focused} />
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
          tabBarIcon: ({ focused }) => (
            <TabIcon name="programs" focused={focused} />
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
                vibrationsEnabled: true
              });
            }}
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
                <FavoritesProvider>
                  <NavigationContainer>
                    <AppStack />
                  </NavigationContainer>
                </FavoritesProvider>
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
