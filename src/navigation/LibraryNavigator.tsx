import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useColorScheme, Text, View } from 'react-native';
import { Content, LibrarySection } from '../types/library';
import { LibraryScreen } from '../screens/LibraryScreen';

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

const Stack = createStackNavigator<LibraryStackParamList>();

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
        component={SeeAllSectionScreen}
        options={({ route }) => ({
          title: route.params.section.title,
          headerBackTitleVisible: false,
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
        component={ArticleDetailScreen}
        options={({ route }) => ({
          title: route.params.content.title,
          headerBackTitleVisible: false,
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
const SearchResultsScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation: _navigation,
}) => {
  const { query, filters } = route.params;
  console.log('Search:', query, filters);
  return <View><Text>Search Results</Text></View>;
};

const SeeAllSectionScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation: _navigation,
}) => {
  const { section } = route.params;
  console.log('Section:', section.title);
  return <View><Text>See All Section</Text></View>;
};

const ContentDetailScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation: _navigation,
}) => {
  const { content, source } = route.params;
  console.log('Content:', content.id, 'Source:', source);
  return <View><Text>Content Detail</Text></View>;
};

const ProgramDetailScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation: _navigation,
}) => {
  const { programId, content } = route.params;
  console.log('Program:', programId, content.title);
  return <View><Text>Program Detail</Text></View>;
};

const ChallengeDetailScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation: _navigation,
}) => {
  const { challengeId, content } = route.params;
  console.log('Challenge:', challengeId, content.title);
  return <View><Text>Challenge Detail</Text></View>;
};

const ArticleDetailScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation: _navigation,
}) => {
  const { articleId, content } = route.params;
  console.log('Article:', articleId, content.title);
  return <View><Text>Article Detail</Text></View>;
};

const WorkoutPlayerScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation: _navigation,
}) => {
  const { workoutId, content, fromProgram, programId } = route.params;
  console.log('Workout:', workoutId, content.title, 'From program:', fromProgram, programId);
  return <View><Text>Workout Player</Text></View>;
};
