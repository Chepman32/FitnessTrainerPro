import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LibraryProvider } from '../state/LibraryContext';
import { UserProgressProvider } from '../state/UserProgressContext';
import { LibraryScreen } from '../screens/LibraryScreen';
import { Content, LibrarySection } from '../types/library';

const Stack = createStackNavigator();

// Example of how to integrate the Library Screen
export const LibraryScreenExample: React.FC = () => {
  const handleContentPress = (content: Content) => {
    console.log('Navigate to content:', content.id, content.type);
    // Navigate to appropriate detail screen based on content type
    switch (content.type) {
      case 'program':
        // Navigate to ProgramDetailScreen
        break;
      case 'challenge':
        // Navigate to ChallengeDetailScreen
        break;
      case 'workout':
        // Navigate to WorkoutScreen or TrainingScreen
        break;
      case 'article':
        // Navigate to ArticleDetailScreen
        break;
    }
  };

  const handleContinuePress = (content: Content) => {
    console.log('Continue content:', content.id, content.type);
    // Navigate to the appropriate screen to continue the content
    // This might be the same as handleContentPress but with different analytics
  };

  const handleSeeAllPress = (section: LibrarySection) => {
    console.log('See all for section:', section.id);
    // Navigate to a filtered view showing all items from this section
    // This could be the same LibraryScreen with pre-applied filters
    // or a dedicated SeeAllScreen
  };

  return (
    <NavigationContainer>
      <LibraryProvider>
        <UserProgressProvider>
          <Stack.Navigator>
            <Stack.Screen
              name="Library"
              options={{
                title: 'Library',
                headerStyle: {
                  backgroundColor: '#FFFFFF',
                },
                headerTitleStyle: {
                  fontSize: 24,
                  fontWeight: '700',
                },
              }}
            >
              {() => (
                <LibraryScreen
                  onContentPress={handleContentPress}
                  onContinuePress={handleContinuePress}
                  onSeeAllPress={handleSeeAllPress}
                />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        </UserProgressProvider>
      </LibraryProvider>
    </NavigationContainer>
  );
};

// Example of how to integrate with existing app structure
export const IntegrateWithExistingApp = () => {
  // In your main App.tsx or navigation setup:

  // 1. Wrap your app with the providers
  // <LibraryProvider>
  //   <UserProgressProvider>
  //     <YourExistingApp />
  //   </UserProgressProvider>
  // </LibraryProvider>

  // 2. Add LibraryScreen to your navigation stack
  // <Stack.Screen
  //   name="Library"
  //   component={LibraryScreen}
  //   options={{ title: 'Library' }}
  // />

  // 3. Navigate to library from your existing screens
  // navigation.navigate('Library');

  return null;
};
