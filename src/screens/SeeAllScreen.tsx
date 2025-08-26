import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ImageBackground,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BackButton } from '../components/BackButton';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LibraryStackParamList } from '../navigation/LibraryNavigator';
import { Content } from '../types/library';
import { useLibrary } from '../state/LibraryContext';

// Navigation types
type SeeAllScreenRouteProp = RouteProp<LibraryStackParamList, 'SeeAllSection'>;
type SeeAllScreenNavigationProp = NativeStackNavigationProp<LibraryStackParamList, 'SeeAllSection'>;

type SeeAllScreenProps = {
  route: SeeAllScreenRouteProp;
  navigation: SeeAllScreenNavigationProp;
};

// Simplified - no filtering/sorting in SeeAll view

export const SeeAllScreen: React.FC<SeeAllScreenProps> = ({ route, navigation }) => {
  const { section } = route.params;
  const isDark = useColorScheme() === 'dark';
  const { actions: libraryActions } = useLibrary();

  // State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // No filtering in this simplified view

  // Simply use section items
  const processedContent = section.items || [];



  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await libraryActions.loadMoreSection(section.id);
    } catch (error) {
      console.error('Error refreshing section:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [libraryActions, section.id]);

  // Handle load more
  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !section.hasMore) return;
    
    setLoadingMore(true);
    try {
      await libraryActions.loadMoreSection(section.id);
    } catch (error) {
      console.error('Error loading more:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [libraryActions, section.id, section.hasMore, loadingMore]);

  // Handle content press
  const handleContentPress = useCallback((content: Content) => {
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
  }, [navigation]);

  // Get content image
  const getContentImage = useCallback((item: Content, _index: number) => {
    if (item.coverUrl) return item.coverUrl;
    
    const imagesByType = {
      workout: [
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ],
      program: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1574680096145-d05b474e2155?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ],
      challenge: [
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1567013127542-490d757e51cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ],
      article: [
        'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      ],
    };
    
    const typeImages = imagesByType[item.type] || imagesByType.workout;
    const hash = item.id.split('').reduce((a, b) => { 
      a = ((a * 31) + b.charCodeAt(0)) % 1000000; 
      return a; 
    }, 0);
    
    const imageIndex = Math.abs(hash) % typeImages.length;
    return typeImages[imageIndex];
  }, []);

  // Get content subtitle
  const getContentSubtitle = useCallback((item: Content) => {
    switch (item.type) {
      case 'workout':
        return `${(item as any).durationMinutes || 20} min`;
      case 'program':
        return `${(item as any).weeks || 4} weeks`;
      case 'challenge':
        return `${(item as any).participantsCount || 100} participants`;
      case 'article':
        return `${(item as any).readTimeMinutes || 5} min read`;
      default:
        return '';
    }
  }, []);

  // Render content card (grid view)
  const renderContentCard = useCallback(({ item, index }: { item: Content; index: number }) => {
    return (
      <Pressable 
        style={[styles.gridCard, index % 2 === 1 && styles.gridCardRight]}
        onPress={() => handleContentPress(item)}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}, ${getContentSubtitle(item)}`}
      >
        <ImageBackground
          source={{ uri: getContentImage(item, index) }}
          style={styles.gridCardImage}
          imageStyle={styles.gridCardImageStyle}
        >
          <View style={styles.gridCardOverlay} />
          {item.premium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>PRO</Text>
            </View>
          )}
          <View style={styles.gridCardContent}>
            <Text style={styles.gridCardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.gridCardSubtitle}>
              {getContentSubtitle(item)}
            </Text>
          </View>
        </ImageBackground>
      </Pressable>
    );
  }, [handleContentPress, getContentImage, getContentSubtitle]);

  // Render content row (list view)
  const renderContentRow = useCallback(({ item, index }: { item: Content; index: number }) => {
    return (
      <Pressable 
        style={styles.listRow}
        onPress={() => handleContentPress(item)}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}, ${getContentSubtitle(item)}`}
      >
        <ImageBackground
          source={{ uri: getContentImage(item, index) }}
          style={styles.listRowImage}
          imageStyle={styles.listRowImageStyle}
        >
          <View style={styles.listRowImageOverlay} />
        </ImageBackground>
        
        <View style={styles.listRowContent}>
          <View style={styles.listRowHeader}>
            <Text style={[styles.listRowTitle, isDark && styles.listRowTitleDark]} numberOfLines={2}>
              {item.title}
            </Text>
            {item.premium && (
              <View style={styles.premiumBadgeSmall}>
                <Text style={styles.premiumBadgeTextSmall}>PRO</Text>
              </View>
            )}
          </View>
          
          <Text style={[styles.listRowSubtitle, isDark && styles.listRowSubtitleDark]}>
            {getContentSubtitle(item)}
          </Text>
          
          {item.tags && item.tags.length > 0 && (
            <View style={styles.listRowTags}>
              {item.tags.slice(0, 3).map((tag, tagIndex) => (
                <View key={tagIndex} style={styles.listRowTag}>
                  <Text style={styles.listRowTagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Pressable>
    );
  }, [handleContentPress, getContentImage, getContentSubtitle, isDark]);

  const backgroundColor = isDark ? '#000000' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={backgroundColor} />
      
      {/* Header Controls */}
      <View style={[styles.header, { backgroundColor }]}>
        {/* Back Button */}
        <BackButton onPress={() => navigation.goBack()} />
        
        <Text style={[styles.headerTitle, { color: textColor }]}>
          {section.title} ({processedContent.length})
        </Text>
        
        {/* View Mode Toggle */}
        <View style={styles.viewModeToggle}>
          <Pressable
            style={[styles.viewModeButton, viewMode === 'grid' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('grid')}
            accessibilityRole="button"
            accessibilityLabel="Switch to grid view"
            accessibilityState={{ selected: viewMode === 'grid' }}
          >
            <Ionicons 
              name="grid-outline" 
              size={18} 
              color={viewMode === 'grid' ? '#FFFFFF' : '#AAAAAA'} 
            />
          </Pressable>
          <Pressable
            style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('list')}
            accessibilityRole="button"
            accessibilityLabel="Switch to list view"
            accessibilityState={{ selected: viewMode === 'list' }}
          >
            <Ionicons 
              name="list-outline" 
              size={18} 
              color={viewMode === 'list' ? '#FFFFFF' : '#AAAAAA'} 
            />
          </Pressable>
        </View>
      </View>

      {/* Content */}
      {viewMode === 'grid' ? (
        <FlatList
          data={processedContent}
          renderItem={renderContentCard}
          numColumns={2}
          key="grid"
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#5B9BFF"
              colors={['#5B9BFF']}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? (
            <View style={styles.loadingMore}>
              <Text style={[styles.loadingMoreText, { color: textColor }]}>Loading more...</Text>
            </View>
          ) : null}
        />
      ) : (
        <FlatList
          data={processedContent}
          renderItem={renderContentRow}
          key="list"
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#5B9BFF"
              colors={['#5B9BFF']}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? (
            <View style={styles.loadingMore}>
              <Text style={[styles.loadingMoreText, { color: textColor }]}>Loading more...</Text>
            </View>
          ) : null}
        />
      )}
    </SafeAreaView>
  );
};

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - 48) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 2,
  },
  viewModeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
  },
  viewModeButtonActive: {
    backgroundColor: '#5B9BFF',
  },
  
  // Filters
  filtersContainer: {
    paddingVertical: 8,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterChipActive: {
    backgroundColor: '#5B9BFF',
    borderColor: '#5B9BFF',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  
  // Sort
  sortContainer: {
    paddingVertical: 8,
  },
  sortContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sortChipActive: {
    backgroundColor: 'rgba(91, 155, 255, 0.3)',
    borderColor: '#5B9BFF',
  },
  sortChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#AAAAAA',
  },
  sortChipTextActive: {
    color: '#5B9BFF',
  },
  
  // Grid View
  gridContent: {
    padding: 16,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  gridCard: {
    width: cardWidth,
    height: 200,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gridCardRight: {
    marginLeft: 16,
  },
  gridCardImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  gridCardImageStyle: {
    borderRadius: 16,
  },
  gridCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 16,
  },
  gridCardContent: {
    padding: 12,
  },
  gridCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  gridCardSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  
  // List View
  listContent: {
    padding: 16,
  },
  listRow: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  listRowImage: {
    width: 80,
    height: 80,
  },
  listRowImageStyle: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  listRowImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  listRowContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  listRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  listRowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    marginRight: 8,
  },
  listRowTitleDark: {
    color: '#FFFFFF',
  },
  listRowSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 8,
  },
  listRowSubtitleDark: {
    color: '#AAAAAA',
  },
  listRowTags: {
    flexDirection: 'row',
    gap: 6,
  },
  listRowTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(91, 155, 255, 0.2)',
  },
  listRowTagText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#5B9BFF',
  },
  
  // Premium badges
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
  },
  premiumBadgeSmall: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  premiumBadgeTextSmall: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
  },
  
  // Loading
  loadingMore: {
    padding: 20,
    alignItems: 'center',
  },
  loadingMoreText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SeeAllScreen;
