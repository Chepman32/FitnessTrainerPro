import React, { memo, useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Content } from '../../types/library';
import {
  usePerformanceMonitor,
  useOptimizedImageProps,
  useIntersectionObserver,
} from '../../utils/performance';
import { getCachedImageSource } from '../../services/remoteImageCacheService';

type OptimizedContentCardProps = {
  content: Content;
  onPress?: (content: Content) => void;
  style?: any;
  index?: number;
  isVisible?: boolean;
};

// Memoized content card with performance optimizations
export const OptimizedContentCard = memo<OptimizedContentCardProps>(
  ({ content, onPress, style, index = 0, isVisible = true }) => {
    const isDark = useColorScheme() === 'dark';
    const [imageError, setImageError] = useState(false);
    const [shouldLoadImage, setShouldLoadImage] = useState(isVisible);

    usePerformanceMonitor(`ContentCard-${content.type}-${index}`);
    const imageProps = useOptimizedImageProps();

    // Intersection observer for lazy loading
    const elementRef = useIntersectionObserver(
      useCallback(
        (isIntersecting: boolean) => {
          if (isIntersecting && !shouldLoadImage) {
            setShouldLoadImage(true);
          }
        },
        [shouldLoadImage],
      ),
    );

    // Memoized press handler
    const handlePress = useCallback(() => {
      onPress?.(content);
    }, [onPress, content]);

    const handleImageError = useCallback(() => {
      setImageError(true);
    }, []);

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

    // Render content based on type with memoization
    const contentDetails = React.useMemo(() => {
      switch (content.type) {
        case 'workout':
          return {
            duration: `${content.durationMinutes} min`,
            calories: `${content.estimatedCalories} cal`,
            meta: `${content.durationMinutes} min • ${content.estimatedCalories} cal`,
            level: content.level,
            equipment: content.equipment,
          };
        case 'program':
          return {
            duration: `${content.weeks} weeks`,
            sessions: `${content.sessionsPerWeek}x/week`,
            meta: `${content.weeks} weeks • ${content.sessionsPerWeek}x/week`,
            level: content.level,
            equipment: content.equipment,
          };
        case 'challenge':
          return {
            duration: `${content.durationDays} days`,
            participants: `${content.participantsCount.toLocaleString()} participants`,
            meta: `${content.durationDays} days • ${content.metricType}`,
          };
        case 'article':
          return {
            readTime: `${content.readTimeMinutes} min read`,
            topic: content.topic,
            meta: `${content.readTimeMinutes} min read • ${content.topic}`,
            author: content.author,
          };
        default:
          return { meta: '' };
      }
    }, [content]);

    // Early return for non-visible items to save render cycles
    if (!isVisible && index > 10) {
      return <View style={[cardStyle, { height: 280 }]} />; // Placeholder with fixed height
    }

    return (
      <Pressable
        ref={elementRef}
        style={({ pressed }) => [cardStyle, pressed && styles.cardPressed]}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`${content.type}: ${content.title}`}
      >
        {/* Optimized Image Loading */}
        <View style={styles.imageContainer}>
          {shouldLoadImage && content.coverUrl && !imageError ? (
            <Image
              source={getCachedImageSource(content.coverUrl)}
              style={styles.coverImage}
              onError={handleImageError}
              {...imageProps}
            />
          ) : (
            <View style={[styles.coverImage, styles.placeholderImage]}>
              <Ionicons
                name="fitness"
                size={32}
                color={isDark ? '#666' : '#CCC'}
              />
            </View>
          )}

          {/* Premium Badge */}
          {content.premium && (
            <View style={styles.premiumBadge}>
              <Ionicons name="diamond" size={12} color="#FFD700" />
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}
        </View>

        {/* Content Details */}
        <View style={styles.contentContainer}>
          <Text style={titleStyle} numberOfLines={2}>
            {content.title}
          </Text>

          <Text style={metaStyle} numberOfLines={1}>
            {contentDetails.meta}
          </Text>

          {/* Type-specific content */}
          {content.type === 'workout' && (
            <View style={styles.actionContainer}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>
                  {contentDetails.level}
                </Text>
              </View>
              {contentDetails.equipment?.includes('none') && (
                <View style={styles.equipmentBadge}>
                  <Text style={styles.equipmentBadgeText}>No equipment</Text>
                </View>
              )}
            </View>
          )}

          {content.type === 'challenge' && (
            <View style={styles.participantsContainer}>
              <Ionicons
                name="people"
                size={14}
                color={isDark ? '#AAA' : '#666'}
              />
              <Text style={[styles.participantsText, metaStyle]}>
                {contentDetails.participants}
              </Text>
            </View>
          )}

          {content.type === 'article' && contentDetails.author && (
            <Text style={[styles.authorText, metaStyle]} numberOfLines={1}>
              By {contentDetails.author}
            </Text>
          )}
        </View>
      </Pressable>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for memo
    return (
      prevProps.content.id === nextProps.content.id &&
      prevProps.content.updatedAt === nextProps.content.updatedAt &&
      prevProps.isVisible === nextProps.isVisible &&
      prevProps.index === nextProps.index
    );
  },
);

OptimizedContentCard.displayName = 'OptimizedContentCard';

const styles = StyleSheet.create({
  card: {
    width: 280,
    borderRadius: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
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
  contentContainer: {
    padding: 16,
    minHeight: 120,
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
  actionContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  levelBadge: {
    backgroundColor: '#4ADE80',
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
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  participantsText: {
    fontSize: 12,
  },
  authorText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
});
