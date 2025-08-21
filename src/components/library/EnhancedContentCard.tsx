import React, { memo, useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Content } from '../../types/library';
import { useHaptics } from '../../utils/haptics';
import { useAnimations, ANIMATION_CONFIGS } from '../../utils/animations';
import { useCardAnalytics } from '../../hooks/useAnalytics';

type EnhancedContentCardProps = {
  content: Content;
  section: { id: string; title: string };
  position: number;
  onPress?: (content: Content) => void;
  style?: any;
  isVisible?: boolean;
};

export const EnhancedContentCard = memo<EnhancedContentCardProps>(
  ({ content, section, position, onPress, style, isVisible = true }) => {
    const isDark = useColorScheme() === 'dark';
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const scaleValue = useRef(new Animated.Value(1)).current;
    const fadeValue = useRef(new Animated.Value(0)).current;

    const haptics = useHaptics();
    const { createCardPressAnimation, createFadeTransition } = useAnimations();
    const { trackCardImpression } = useCardAnalytics();

    const { pressIn, pressOut } = createCardPressAnimation(scaleValue);
    const { fadeIn } = createFadeTransition(fadeValue);

    // Track card impression when visible
    React.useEffect(() => {
      trackCardImpression(content, section as any, position, isVisible);
    }, [content, section, position, isVisible, trackCardImpression]);

    // Fade in animation when component mounts
    React.useEffect(() => {
      if (isVisible) {
        fadeIn();
      }
    }, [isVisible, fadeIn]);

    // Memoized press handler with haptics and analytics
    const handlePress = useCallback(() => {
      haptics.cardTap();
      onPress?.(content);
    }, [onPress, content, haptics]);

    // Memoized image handlers
    const handleImageLoad = useCallback(() => {
      setImageLoaded(true);
    }, []);

    const handleImageError = useCallback(() => {
      setImageError(true);
      setImageLoaded(false);
    }, []);

    // Memoized press handlers with animations
    const handlePressIn = useCallback(() => {
      pressIn();
    }, [pressIn]);

    const handlePressOut = useCallback(() => {
      pressOut();
    }, [pressOut]);

    // Memoized styles
    const cardStyle = React.useMemo(
      () => [
        styles.card,
        { backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF' },
        style,
      ],
      [isDark, style],
    );

    const titleStyle = React.useMemo(
      () => [styles.title, { color: isDark ? '#FFF' : '#000' }],
      [isDark],
    );

    const metaStyle = React.useMemo(
      () => [styles.metaText, { color: isDark ? '#AAA' : '#666' }],
      [isDark],
    );

    // Render content details based on type
    const renderContentDetails = React.useMemo(() => {
      switch (content.type) {
        case 'workout':
          return (
            <>
              <Text style={metaStyle} numberOfLines={1}>
                {content.durationMinutes} min • {content.estimatedCalories} cal
              </Text>
              <View style={styles.badgeContainer}>
                <View
                  style={[styles.levelBadge, getLevelBadgeColor(content.level)]}
                >
                  <Text style={styles.levelBadgeText}>{content.level}</Text>
                </View>
                {content.equipment.includes('none') && (
                  <View style={styles.equipmentBadge}>
                    <Text style={styles.equipmentBadgeText}>No equipment</Text>
                  </View>
                )}
              </View>
              <View style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Start Workout</Text>
              </View>
            </>
          );

        case 'program':
          return (
            <>
              <Text style={metaStyle} numberOfLines={1}>
                {content.weeks} weeks • {content.sessionsPerWeek}x/week
              </Text>
              <View style={styles.badgeContainer}>
                <View
                  style={[styles.levelBadge, getLevelBadgeColor(content.level)]}
                >
                  <Text style={styles.levelBadgeText}>{content.level}</Text>
                </View>
              </View>
              <View style={styles.programInfo}>
                <Text style={[styles.programInfoText, metaStyle]}>
                  {content.totalWorkouts} workouts
                </Text>
              </View>
            </>
          );

        case 'challenge':
          return (
            <>
              <Text style={metaStyle} numberOfLines={1}>
                {content.durationDays} days • {content.metricType}
              </Text>
              <View style={styles.participantsContainer}>
                <Ionicons
                  name="people"
                  size={14}
                  color={isDark ? '#AAA' : '#666'}
                />
                <Text style={[styles.participantsText, metaStyle]}>
                  {content.participantsCount.toLocaleString()} participants
                </Text>
                {content.friendsCount > 0 && (
                  <Text style={[styles.friendsText, { color: '#5B9BFF' }]}>
                    • {content.friendsCount} friends
                  </Text>
                )}
              </View>
              {content.joined ? (
                <View style={styles.joinedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#4ADE80" />
                  <Text style={styles.joinedText}>Joined</Text>
                </View>
              ) : (
                <View style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Join Challenge</Text>
                </View>
              )}
            </>
          );

        case 'article':
          return (
            <>
              <Text style={[styles.excerpt, metaStyle]} numberOfLines={2}>
                {content.excerpt}
              </Text>
              <Text style={metaStyle} numberOfLines={1}>
                {content.readTimeMinutes} min read • {content.topic}
              </Text>
              <Text style={[styles.authorText, metaStyle]} numberOfLines={1}>
                By {content.author}
              </Text>
            </>
          );

        default:
          return null;
      }
    }, [content, metaStyle, isDark]);

    return (
      <Animated.View
        style={[
          cardStyle,
          {
            opacity: fadeValue,
            transform: [{ scale: scaleValue }],
          },
        ]}
      >
        <Pressable
          style={styles.pressable}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessibilityRole="button"
          accessibilityLabel={`${content.type}: ${content.title}`}
          accessibilityHint="Double tap to open"
        >
          {/* Enhanced Image Container */}
          <View style={styles.imageContainer}>
            {content.coverUrl && !imageError ? (
              <>
                <Image
                  source={{ uri: content.coverUrl }}
                  style={styles.coverImage}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  resizeMode="cover"
                  fadeDuration={200}
                />
                {!imageLoaded && (
                  <View style={styles.imageLoader}>
                    <ActivityIndicator size="small" color="#5B9BFF" />
                  </View>
                )}
              </>
            ) : (
              <View style={[styles.coverImage, styles.placeholderImage]}>
                <Ionicons
                  name={getContentIcon(content.type)}
                  size={32}
                  color={isDark ? '#666' : '#CCC'}
                />
              </View>
            )}

            {/* Enhanced Premium Badge */}
            {content.premium && (
              <View style={styles.premiumBadge}>
                <Ionicons name="diamond" size={12} color="#FFD700" />
                <Text style={styles.premiumText}>Premium</Text>
              </View>
            )}

            {/* Content Type Badge */}
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {content.type.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Enhanced Content Container */}
          <View style={styles.contentContainer}>
            <Text style={titleStyle} numberOfLines={2}>
              {content.title}
            </Text>

            {renderContentDetails}
          </View>
        </Pressable>
      </Animated.View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.content.id === nextProps.content.id &&
      prevProps.content.updatedAt === nextProps.content.updatedAt &&
      prevProps.isVisible === nextProps.isVisible &&
      prevProps.position === nextProps.position
    );
  },
);

EnhancedContentCard.displayName = 'EnhancedContentCard';

// Helper functions
const getLevelBadgeColor = (level: string) => {
  switch (level) {
    case 'Beginner':
      return { backgroundColor: '#4ADE80' };
    case 'Intermediate':
      return { backgroundColor: '#F59E0B' };
    case 'Advanced':
      return { backgroundColor: '#EF4444' };
    default:
      return { backgroundColor: '#6B7280' };
  }
};

const getContentIcon = (type: string) => {
  switch (type) {
    case 'workout':
      return 'fitness';
    case 'program':
      return 'calendar';
    case 'challenge':
      return 'trophy';
    case 'article':
      return 'document-text';
    default:
      return 'fitness';
  }
};

const styles = StyleSheet.create({
  card: {
    width: 280,
    borderRadius: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  pressable: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 160,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  premiumBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  premiumText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(91, 155, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  contentContainer: {
    padding: 16,
    minHeight: 140,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 24,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  excerpt: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  equipmentBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  equipmentBadgeText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#5B9BFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  programInfo: {
    marginTop: 4,
  },
  programInfoText: {
    fontSize: 12,
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  participantsText: {
    fontSize: 12,
  },
  friendsText: {
    fontSize: 12,
    fontWeight: '600',
  },
  joinedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  joinedText: {
    color: '#4ADE80',
    fontSize: 14,
    fontWeight: '600',
  },
  authorText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
});
