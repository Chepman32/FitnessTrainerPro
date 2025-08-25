import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme, Text, View, StyleSheet, Pressable, Alert } from 'react-native';
import { Content, LibrarySection, Workout } from '../types/library';
import { Program, Step } from '../types/program';
import { LibraryScreen } from '../screens/LibraryScreen';
import { SeeAllScreen } from '../screens/SeeAllScreen';
import { ArticleDetailScreen } from '../screens/ArticleDetailScreen';

// Navigation parameter types
export type LibraryStackParamList = {
  LibraryMain: undefined;
  SearchResults: {
    query?: string;
    filters?: any;
  };
  SeeAllSection: {
    section: LibrarySection;
  };
  ContentDetail: {
    content: Content;
    source?: 'library' | 'search' | 'continue';
  };
  ProgramDetail: {
    programId: string;
    content: Content;
  };
  ChallengeDetail: {
    challengeId: string;
    content: Content;
  };
  ArticleDetail: {
    articleId: string;
    content: Content;
  };
  WorkoutPlayer: {
    workoutId: string;
    content: Content;
    fromProgram?: boolean;
    programId?: string;
  };
};

const Stack = createNativeStackNavigator<LibraryStackParamList>();

export const LibraryNavigator: React.FC = () => {
  const isDark = useColorScheme() === 'dark';

  const screenOptions = {
    headerStyle: {
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
      shadowColor: 'transparent',
      elevation: 0,
    },
    headerTintColor: isDark ? '#FFFFFF' : '#000000',
    headerTitleStyle: {
      fontWeight: '600' as const,
      fontSize: 18,
    },
    cardStyle: {
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
    },
  };

  return (
    <Stack.Navigator
      initialRouteName="LibraryMain"
      screenOptions={screenOptions}
    >
      <Stack.Screen
        name="LibraryMain"
        component={LibraryMainScreen}
        options={{
          title: 'Library',
          headerShown: false, // Custom header in component
        }}
      />

      <Stack.Screen
        name="SearchResults"
        component={SearchResultsScreen}
        options={{
          title: 'Search Results',
          headerShown: false, // Custom header in component
        }}
      />

      <Stack.Screen
        name="SeeAllSection"
        component={SeeAllScreen}
        options={({ route }) => ({
          title: route.params.section.title,
          headerBackTitleVisible: false,
          headerShown: false, // Using custom header in component
        })}
      />

      <Stack.Screen
        name="ContentDetail"
        component={ContentDetailScreen}
        options={({ route }) => ({
          title: route.params.content.title,
          headerBackTitleVisible: false,
        })}
      />

      <Stack.Screen
        name="ProgramDetail"
        component={ProgramDetailScreen}
        options={({ route }) => ({
          title: route.params.content.title,
          headerBackTitleVisible: false,
        })}
      />

      <Stack.Screen
        name="ChallengeDetail"
        component={ChallengeDetailScreen}
        options={({ route }) => ({
          title: route.params.content.title,
          headerBackTitleVisible: false,
        })}
      />

      <Stack.Screen
        name="ArticleDetail"
        component={ArticleDetailScreenWrapper}
        options={({ route }) => ({
          title: route.params.content.title,
          headerBackTitleVisible: false,
          headerShown: false, // Using custom header in component
        })}
      />

      <Stack.Screen
        name="WorkoutPlayer"
        component={WorkoutPlayerScreen}
        options={({ route }) => ({
          title: route.params.content.title,
          headerBackTitleVisible: false,
          gestureEnabled: false, // Prevent accidental swipe during workout
        })}
      />
    </Stack.Navigator>
  );
};

// Screen components with navigation integration
const LibraryMainScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const handleContentPress = (content: Content) => {
    // Navigate based on content type
    switch (content.type) {
      case 'program':
        navigation.navigate('ProgramDetail', {
          programId: content.id,
          content,
        });
        break;

      case 'challenge':
        navigation.navigate('ChallengeDetail', {
          challengeId: content.id,
          content,
        });
        break;

      case 'article':
        navigation.navigate('ArticleDetail', {
          articleId: content.id,
          content,
        });
        break;

      case 'workout':
        navigation.navigate('WorkoutPlayer', {
          workoutId: content.id,
          content,
        });
        break;

      default:
        navigation.navigate('ContentDetail', {
          content,
          source: 'library',
        });
    }
  };

  const handleSeeAllPress = (section: LibrarySection) => {
    navigation.navigate('SeeAllSection', { section });
  };

  return (
    <LibraryScreen
      onContentPress={handleContentPress}
      onSeeAllPress={handleSeeAllPress}
    />
  );
};

// Screen components

// SeeAllSectionScreen is now implemented as SeeAllScreen component

const SearchResultsScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation: _navigation,
}) => {
  const { query } = route.params;
  const isDark = useColorScheme() === 'dark';
  
  return (
    <View style={[
      styles.screenContainer, 
      { backgroundColor: isDark ? '#000000' : '#FFFFFF' }
    ]}>
      <Text style={[
        styles.screenTitle,
        { color: isDark ? '#FFFFFF' : '#000000' }
      ]}>
        Search Results
      </Text>
      <Text style={[
        styles.screenSubtitle,
        { color: isDark ? '#CCCCCC' : '#666666' }
      ]}>
        Results for "{query || 'your search'}"
      </Text>
      <Text style={[
        styles.screenDescription,
        { color: isDark ? '#AAAAAA' : '#888888' }
      ]}>
        Search functionality coming soon!
      </Text>
    </View>
  );
};

const ContentDetailScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation: _navigation,
}) => {
  const { content, source } = route.params;
  const isDark = useColorScheme() === 'dark';
  
  return (
    <View style={[
      styles.screenContainer, 
      { backgroundColor: isDark ? '#000000' : '#FFFFFF' }
    ]}>
      <Text style={[
        styles.screenTitle,
        { color: isDark ? '#FFFFFF' : '#000000' }
      ]}>
        {content.title}
      </Text>
      <Text style={[
        styles.screenSubtitle,
        { color: isDark ? '#CCCCCC' : '#666666' }
      ]}>
        Content Type: {content.type} | Source: {source}
      </Text>
      <Text style={[
        styles.screenDescription,
        { color: isDark ? '#AAAAAA' : '#888888' }
      ]}>
        This is the content detail screen for {content.title}. 
        Implementation coming soon!
      </Text>
    </View>
  );
};

const ProgramDetailScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { content } = route.params;
  const program = content as any; // Program type from library
  const isDark = useColorScheme() === 'dark';
  
  const handleStartProgram = () => {
    console.log('Start Program button pressed!', program.title);
    console.log('Program data:', program);
    
    // Show alert to confirm button is working
    Alert.alert(
      'Starting Program',
      `Starting ${program.title}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => navigateToWorkout() }
      ]
    );
  };
  
  const navigateToWorkout = () => {
    try {
      // Check if this program has a complexProgram (timed workout) or is a traditional program
      if (program.complexProgram) {
        console.log('Navigating to complex training screen');
        // Navigate to complex training screen for timed workouts
        navigation.navigate('WorkoutPlayer', {
          workoutId: program.id,
          content: {
            ...program,
            type: 'workout',
            durationMinutes: Math.ceil(program.complexProgram.totalDurationSec / 60),
            level: program.level,
            equipment: program.equipment,
            locations: program.locations,
            goals: program.goals,
            exercises: [],
            estimatedCalories: program.estimatedCalories
          }
        });
      } else {
        console.log('Traditional program - creating workout conversion');
        // For traditional programs, convert to workout format and navigate
        const workoutContent = {
          id: program.id,
          type: 'workout',
          title: program.title,
          coverUrl: program.coverUrl,
          premium: program.premium,
          tags: program.tags,
          createdAt: program.createdAt,
          updatedAt: program.updatedAt,
          durationMinutes: 30, // Default workout duration
          level: program.level,
          equipment: program.equipment,
          locations: program.locations,
          goals: program.goals,
          exercises: [],
          estimatedCalories: program.estimatedCalories || 200
        };
        
        navigation.navigate('WorkoutPlayer', {
          workoutId: program.id,
          content: workoutContent
        });
      }
    } catch (error) {
      console.error('Error starting program:', error);
    }
  };
  
  return (
    <View style={[
      styles.programDetailContainer, 
      { backgroundColor: isDark ? '#000000' : '#FFFFFF' }
    ]}>
      {/* Program Header */}
      <View style={styles.programHeader}>
        <Text style={[
          styles.programTitle,
          { color: isDark ? '#FFFFFF' : '#000000' }
        ]}>
          {program.title}
        </Text>
        
        <View style={styles.programMeta}>
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: isDark ? '#CCCCCC' : '#666666' }]}>
              Duration
            </Text>
            <Text style={[styles.metaValue, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              {program.weeks} weeks
            </Text>
          </View>
          
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: isDark ? '#CCCCCC' : '#666666' }]}>
              Sessions
            </Text>
            <Text style={[styles.metaValue, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              {program.sessionsPerWeek}/week
            </Text>
          </View>
          
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: isDark ? '#CCCCCC' : '#666666' }]}>
              Level
            </Text>
            <Text style={[styles.metaValue, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              {program.level}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Program Details */}
      <View style={styles.programDetails}>
        <Text style={[
          styles.sectionTitle,
          { color: isDark ? '#FFFFFF' : '#000000' }
        ]}>
          About This Program
        </Text>
        
        <Text style={[
          styles.programDescription,
          { color: isDark ? '#CCCCCC' : '#666666' }
        ]}>
          {program.complexProgram 
            ? `A ${Math.ceil(program.complexProgram.totalDurationSec / 60)} minute ${program.level.toLowerCase()} workout focusing on ${program.goals.join(', ')}.`
            : `A ${program.weeks}-week program with ${program.totalWorkouts} total workouts designed for ${program.level.toLowerCase()} level.`
          }
        </Text>
        
        <View style={styles.equipmentSection}>
          <Text style={[
            styles.sectionTitle,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            Equipment Needed
          </Text>
          <Text style={[
            styles.equipmentText,
            { color: isDark ? '#CCCCCC' : '#666666' }
          ]}>
            {program.equipment.includes('none') ? 'No equipment required' : program.equipment.join(', ')}
          </Text>
        </View>
        
        <View style={styles.goalsSection}>
          <Text style={[
            styles.sectionTitle,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            Goals
          </Text>
          <View style={styles.goalsList}>
            {program.goals.map((goal: string, index: number) => (
              <View key={index} style={styles.goalBadge}>
                <Text style={styles.goalText}>{goal}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      
      {/* Start Button */}
      <View style={styles.startButtonContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.startButton,
            program.premium && styles.premiumButton,
            pressed && styles.startButtonPressed
          ]}
          onPress={handleStartProgram}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Start ${program.title} program`}
        >
          <Text style={styles.startButtonText}>
            {program.premium ? 'Start Premium Program' : 'Start Program'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const ChallengeDetailScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation: _navigation,
}) => {
  const { challengeId, content } = route.params;
  console.log('Challenge:', challengeId, content.title);
  return <View><Text>Challenge Detail</Text></View>;
};

// Wrapper for ArticleDetailScreen to connect with navigation
const ArticleDetailScreenWrapper: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { content } = route.params;
  
  const handleBack = () => {
    navigation.goBack();
  };
  
  const handleFavoriteToggle = (article: any, isFavorited: boolean) => {
    console.log('Article favorite toggled:', article.title, isFavorited);
  };
  
  return (
    <ArticleDetailScreen
      article={content}
      onBack={handleBack}
      onFavoriteToggle={handleFavoriteToggle}
    />
  );
};

// Utility function to convert Workout to Program format
const convertWorkoutToProgram = (workout: Workout): Program => {
  const steps: Step[] = [
    {
      id: 'warmup',
      type: 'exercise',
      title: 'Warm-up',
      description: 'Get ready for your workout',
      durationSec: Math.min(300, workout.durationMinutes * 12), // 5min max or 20% of workout
      equipment: workout.equipment
    },
    {
      id: 'main_exercise',
      type: 'exercise',
      title: workout.title,
      description: workout.goals.join(', '),
      durationSec: Math.round(workout.durationMinutes * 60 * 0.6), // 60% for main exercise
      equipment: workout.equipment
    },
    {
      id: 'cooldown',
      type: 'exercise',
      title: 'Cool Down',
      description: 'Stretch and recover',
      durationSec: Math.min(300, workout.durationMinutes * 12), // 5min max or 20% of workout
      equipment: ['none']
    }
  ];

  return {
    id: workout.id,
    title: workout.title,
    description: `${workout.durationMinutes} minute ${workout.level.toLowerCase()} workout`,
    difficulty: workout.level === 'Beginner' ? 2 : workout.level === 'Intermediate' ? 4 : 6,
    level: workout.level,
    tags: workout.tags,
    estimatedCalories: workout.estimatedCalories,
    thumbnailUrl: workout.coverUrl,
    totalActiveSec: steps.reduce((sum, step) => sum + step.durationSec, 0),
    totalRestSec: 0, // No rest steps in this simple conversion
    stepsCount: steps.length,
    createdAt: workout.createdAt,
    updatedAt: workout.updatedAt,
    steps
  };
};

const WorkoutPlayerScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { content } = route.params;
  const workout = content as Workout;
  const isDark = useColorScheme() === 'dark';
  
  const handleStartWorkout = () => {
    // Convert workout to program format and navigate to training
    const program = convertWorkoutToProgram(workout);
    
    // Navigate to the main app's training screen
    navigation.navigate('complexTraining', {
      program,
      soundsEnabled: true,
      vibrationsEnabled: true,
    });
  };
  
  return (
    <View style={[
      styles.workoutPlayerContainer, 
      { backgroundColor: isDark ? '#000000' : '#FFFFFF' }
    ]}>
      {/* Workout Header */}
      <View style={styles.workoutHeader}>
        <Text style={[
          styles.workoutTitle,
          { color: isDark ? '#FFFFFF' : '#000000' }
        ]}>
          {workout.title}
        </Text>
        
        <View style={styles.workoutMeta}>
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: isDark ? '#CCCCCC' : '#666666' }]}>
              Duration
            </Text>
            <Text style={[styles.metaValue, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              {workout.durationMinutes} min
            </Text>
          </View>
          
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: isDark ? '#CCCCCC' : '#666666' }]}>
              Level
            </Text>
            <Text style={[styles.metaValue, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              {workout.level}
            </Text>
          </View>
          
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: isDark ? '#CCCCCC' : '#666666' }]}>
              Calories
            </Text>
            <Text style={[styles.metaValue, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              ~{workout.estimatedCalories}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Workout Details */}
      <View style={styles.workoutDetails}>
        <Text style={[
          styles.sectionTitle,
          { color: isDark ? '#FFFFFF' : '#000000' }
        ]}>
          About This Workout
        </Text>
        
        <Text style={[
          styles.workoutDescription,
          { color: isDark ? '#CCCCCC' : '#666666' }
        ]}>
          A {workout.durationMinutes}-minute {workout.level.toLowerCase()} workout focusing on {workout.goals.join(', ')}.
        </Text>
        
        <View style={styles.equipmentSection}>
          <Text style={[
            styles.sectionTitle,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            Equipment Needed
          </Text>
          <Text style={[
            styles.equipmentText,
            { color: isDark ? '#CCCCCC' : '#666666' }
          ]}>
            {workout.equipment.includes('none') ? 'No equipment required' : workout.equipment.join(', ')}
          </Text>
        </View>
        
        <View style={styles.goalsSection}>
          <Text style={[
            styles.sectionTitle,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            Goals
          </Text>
          <View style={styles.goalsList}>
            {workout.goals.map((goal: string, index: number) => (
              <View key={index} style={styles.goalBadge}>
                <Text style={styles.goalText}>{goal}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      
      {/* Start Button */}
      <View style={styles.startButtonContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.startButton,
            workout.premium && styles.premiumButton,
            pressed && styles.startButtonPressed
          ]}
          onPress={handleStartWorkout}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Start ${workout.title} workout`}
        >
          <Text style={styles.startButtonText}>
            {workout.premium ? 'Start Premium Workout' : 'Start Workout'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  screenSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16,
  },
  screenDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  screenAuthor: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Program Detail Styles
  programDetailContainer: {
    flex: 1,
    padding: 20,
  },
  programHeader: {
    marginBottom: 30,
  },
  programTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  programMeta: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(91, 155, 255, 0.1)',
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  programDetails: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 20,
  },
  programDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  equipmentSection: {
    marginTop: 20,
  },
  equipmentText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  goalsSection: {
    marginTop: 20,
  },
  goalsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalBadge: {
    backgroundColor: '#5B9BFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  goalText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  startButtonContainer: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  startButton: {
    backgroundColor: '#5B9BFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  premiumButton: {
    backgroundColor: '#FFD700',
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  
  // Workout Player Styles
  workoutPlayerContainer: {
    flex: 1,
    padding: 20,
  },
  workoutHeader: {
    marginBottom: 30,
  },
  workoutTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  workoutMeta: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(91, 155, 255, 0.1)',
  },
  workoutDetails: {
    flex: 1,
  },
  workoutDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
});
