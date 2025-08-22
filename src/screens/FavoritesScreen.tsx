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
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { useFavorites } from '../state/FavoritesContext';

type FavoritesScreenProps = {
  onArticlePress?: (article: any) => void;
};

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({
  onArticlePress,
}) => {
  const isDark = useColorScheme() === 'dark';
  const { state: favoritesState, actions: favoritesActions } = useFavorites();

  if (favoritesState.isLoading) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? '#FFFFFF' : '#000000'} />
          <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
            Loading favorites...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (favoritesState.favorites.length === 0) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.titleDark]}>Favorites</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💔</Text>
          <Text style={[styles.emptyTitle, isDark && styles.emptyTitleDark]}>
            No favorites yet
          </Text>
          <Text style={[styles.emptySubtitle, isDark && styles.emptySubtitleDark]}>
            Tap the heart icon on articles to save them here
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.titleDark]}>Favorites</Text>
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
          {favoritesState.favorites.length} saved {favoritesState.favorites.length === 1 ? 'article' : 'articles'}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {favoritesState.favorites.map((favorite, index) => (
          <Pressable
            key={favorite.id}
            style={[styles.favoriteCard, isDark && styles.favoriteCardDark]}
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
              <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
                {favorite.title}
              </Text>
              <Text style={[styles.cardExcerpt, isDark && styles.cardExcerptDark]}>
                {favorite.data.excerpt}
              </Text>
              <View style={styles.cardMeta}>
                <Text style={[styles.cardReadTime, isDark && styles.cardReadTimeDark]}>
                  {favorite.data.readTimeMinutes} min read
                </Text>
                <Text style={[styles.cardAuthor, isDark && styles.cardAuthorDark]}>
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
  containerDark: {
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  titleDark: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  subtitleDark: {
    color: '#AAAAAA',
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
  loadingTextDark: {
    color: '#AAAAAA',
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
  emptyTitleDark: {
    color: '#FFFFFF',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  emptySubtitleDark: {
    color: '#AAAAAA',
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
  favoriteCardDark: {
    backgroundColor: '#1A1A1A',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.05,
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
  cardTitleDark: {
    color: '#FFFFFF',
  },
  cardExcerpt: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardExcerptDark: {
    color: '#AAAAAA',
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
  cardReadTimeDark: {
    color: '#777777',
  },
  cardAuthor: {
    fontSize: 12,
    color: '#999999',
  },
  cardAuthorDark: {
    color: '#777777',
  },
});
