import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { useTheme } from '../state/ThemeContext';

// Navigation parameter types
export type ProfileStackParamList = {
  ProfileMain: undefined;
  Favorites: undefined;
  Settings: undefined;
  About: undefined;
  ArticleDetail: {
    article: any;
  };
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileNavigator: React.FC = () => {
  const { theme } = useTheme();

  const screenOptions = {
    headerStyle: {
      backgroundColor: theme.colors.background,
      shadowColor: 'transparent',
      elevation: 0,
    },
    headerTintColor: theme.colors.text,
    headerTitleStyle: {
      fontWeight: '600' as const,
      fontSize: 18,
    },
    cardStyle: {
      backgroundColor: theme.colors.background,
    },
  };

  return (
    <Stack.Navigator
      initialRouteName="ProfileMain"
      screenOptions={screenOptions}
    >
      <Stack.Screen
        name="ProfileMain"
        component={ProfileMainScreen}
        options={{
          title: 'Profile',
          headerShown: false, // Custom header in component
        }}
      />

      <Stack.Screen
        name="Favorites"
        component={FavoritesScreenWrapper}
        options={{
          title: 'Favorites',
          headerShown: false, // Using custom header in FavoritesScreen
        }}
      />

      <Stack.Screen
        name="Settings"
        component={SettingsScreenWrapper}
        options={{
          title: 'Settings',
          headerShown: false, // Using custom header in SettingsScreen
        }}
      />

      <Stack.Screen
        name="About"
        component={AboutScreenWrapper}
        options={{
          title: 'About',
          headerShown: false, // Using custom header in AboutScreen
        }}
      />

      <Stack.Screen
        name="ArticleDetail"
        component={ArticleDetailScreen}
        options={({ route }) => ({
          title: route.params.article.title,
          headerBackTitleVisible: false,
          headerShown: false, // ArticleDetailScreen has its own header
        })}
      />
    </Stack.Navigator>
  );
};

// Screen components with navigation integration
const ProfileMainScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const handleNavigateToFavorites = () => {
    navigation.navigate('Favorites');
  };

  const handleNavigateToSettings = () => {
    navigation.navigate('Settings');
  };

  const handleNavigateToAbout = () => {
    navigation.navigate('About');
  };

  return (
    <ProfileScreen
      onNavigateToFavorites={handleNavigateToFavorites}
      onNavigateToSettings={handleNavigateToSettings}
      onNavigateToAbout={handleNavigateToAbout}
    />
  );
};

const FavoritesScreenWrapper: React.FC<{ navigation: any }> = ({ navigation }) => {
  const handleArticlePress = (article: any) => {
    navigation.navigate('ArticleDetail', { article });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <FavoritesScreen 
      onArticlePress={handleArticlePress} 
      onBack={handleBack}
    />
  );
};

const SettingsScreenWrapper: React.FC<{ navigation: any }> = ({ navigation }) => {
  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SettingsScreen onBack={handleBack} />
  );
};

const AboutScreenWrapper: React.FC<{ navigation: any }> = ({ navigation }) => {
  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <AboutScreen onBack={handleBack} />
  );
};

// Placeholder for ArticleDetailScreen - this should be imported from the actual file
const ArticleDetailScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { article } = route.params;
  
  // Import the actual ArticleDetailScreen component here
  // For now, we'll create a simple placeholder
  const { ArticleDetailScreen: ActualArticleDetailScreen } = require('../screens/ArticleDetailScreen');
  
  return (
    <ActualArticleDetailScreen
      article={article}
      onBack={() => navigation.goBack()}
    />
  );
};