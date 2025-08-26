import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BackButton } from '../components/BackButton';
import { useFavorites } from '../state/FavoritesContext';
import { useTheme } from '../state/ThemeContext';

type FavoritesScreenProps = {
  onArticlePress?: (article: any) => void;
  onBack?: () => void;
};

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({
  onArticlePress,
  onBack,
}) => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const { state: favoritesState, actions: favoritesActions } = useFavorites();

  if (favoritesState.isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading favorites...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (favoritesState.favorites.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        
        {/* Header with Back Button */}
        <View style={styles.header}>
          {onBack && (
            <BackButton onPress={onBack} />
          )}
          <Text style={[styles.title, { color: theme.colors.text }]}>Favorites</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💔</Text>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No favorites yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
            Tap the heart icon on articles to save them here
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header with Back Button */}
      <View style={styles.header}>
        {onBack && (
          <BackButton onPress={onBack} />
        )}
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Favorites</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {favoritesState.favorites.length} saved {favoritesState.favorites.length === 1 ? 'article' : 'articles'}
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {favoritesState.favorites.map((favorite) => (
          <Pressable
            key={favorite.id}
            style={[styles.favoriteCard, { backgroundColor: theme.colors.card }]}
            onPress={() => onArticlePress?.(favorite.data)}
          >
            <ImageBackground
              source={{ uri: favorite.data.coverUrl }}
              style={styles.cardImage}
              imageStyle={styles.cardImageStyle}
            >
              <View style={styles.cardOverlay}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardCategory}>{favorite.data.topic}</Text>
                  <Pressable
                    onPress={() => favoritesActions.removeFavorite(favorite.id)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeIcon}>❤️</Text>
                  </Pressable>
                </View>
              </View>
            </ImageBackground>
            
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                {favorite.title}
              </Text>
              <Text style={[styles.cardExcerpt, { color: theme.colors.textSecondary }]}>
                {favorite.data.excerpt}
              </Text>
              <View style={styles.cardMeta}>
                <Text style={[styles.cardReadTime, { color: theme.colors.textTertiary }]}>
                  {favorite.data.readTimeMinutes} min read
                </Text>
                <Text style={[styles.cardAuthor, { color: theme.colors.textTertiary }]}>
                  By {favorite.data.author}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerContent: {
    flex: 1,
  },
  headerSpacer: {
    width: 44, // Same width as back button for balance
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  favoriteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardImage: {
    height: 160,
    width: '100%',
  },
  cardImageStyle: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    resizeMode: 'cover',
  },
  cardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  cardCategory: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  removeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  removeIcon: {
    fontSize: 16,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    lineHeight: 24,
  },
  cardExcerpt: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardReadTime: {
    fontSize: 12,
    color: '#999999',
  },
  cardAuthor: {
    fontSize: 12,
    color: '#999999',
  },
});
