import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useColorScheme,
  Image,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  Content,
  Program,
  Challenge,
  Workout,
  Article,
} from '../../types/library';
import { useUserProgress } from '../../state/UserProgressContext';
import { formatProgressText } from '../../state/UserProgressContext';
import { premiumService } from '../../services/premiumService';
import {
  AccessibilityUtils,
  useAccessibility,
} from '../../utils/accessibility';

type ContentCardProps = {
  content: Content;
  onPress?: (content: Content) => void;
  onContinue?: (content: Content) => void;
  style?: any;
};

export const ContentCard: React.FC<ContentCardProps> = ({
  content,
  onPress,
  onContinue,
  style,
}) => {
  const isDark = useColorScheme() === 'dark';
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { actions: progressActions } = useUserProgress();
  const { isScreenReaderEnabled, isReduceMotionEnabled } = useAccessibility();

  const progress = progressActions.getProgress(content.id);
  const hasProgress =
    progress && progress.progressPercent > 0 && !progress.completedAt;

  const handlePress = () => {
    if (hasProgress && onContinue) {
      onContinue(content);
    } else if (onPress) {
      onPress(content);
    }
  };

  const renderContent = () => {
    switch (content.type) {
      case 'program':
        return (
          <ProgramCardContent
            program={content as Program}
            progress={progress}
          />
        );
      case 'challenge':
        return (
          <ChallengeCardContent
            challenge={content as Challenge}
            progress={progress}
          />
        );
      case 'workout':
        return <WorkoutCardContent workout={content as Workout} />;
      case 'article':
        return <ArticleCardContent article={content as Article} />;
      default:
        return null;
    }
  };

  const cardStyle = [
    styles.card,
    isDark ? styles.cardDark : styles.cardLight,
    style,
  ];

  return (
    <Pressable
      style={({ pressed }) => [
        cardStyle,
        pressed && !isReduceMotionEnabled && styles.cardPressed,
      ]}
      onPress={handlePress}
      accessibilityRole={AccessibilityUtils.getContentRole(content)}
      accessibilityLabel={AccessibilityUtils.getContentCardLabel(content)}
      accessibilityHint={AccessibilityUtils.getContentCardHint(content)}
      accessibilityState={AccessibilityUtils.getAccessibilityState(
        false, // not selected
        false, // not disabled
        false, // not expanded
      )}
      accessible={true}
    >
      {/* Cover Image */}
      <View style={styles.imageContainer}>
        {content.coverUrl && !imageError ? (
          <>
            <Image
              source={{ uri: content.coverUrl }}
              style={styles.coverImage}
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
            />
            {imageLoading && (
              <View style={styles.imageLoader}>
                <ActivityIndicator size="small" color="#5B9BFF" />
              </View>
            )}
          </>
        ) : (
          <View style={[styles.coverImage, styles.placeholderImage]}>
            <Ionicons
              name={getIconForContentType(content.type)}
              size={32}
              color="rgba(255,255,255,0.6)"
            />
          </View>
        )}

        {/* Premium Badge */}
        {content.premium && (
          <View style={styles.premiumBadge}>
            <Ionicons name="lock-closed" size={12} color="white" />
            <Text style={styles.premiumText}>Premium</Text>
          </View>
        )}

        {/* Progress Ring for Programs/Challenges */}
        {hasProgress &&
          (content.type === 'program' || content.type === 'challenge') && (
            <View style={styles.progressRing}>
              <ProgressRing progress={progress!.progressPercent} size={40} />
            </View>
          )}
      </View>

      {/* Content Details */}
      <View style={styles.contentContainer}>
        {renderContent()}

        {/* Action Button */}
        <View style={styles.actionContainer}>
          {hasProgress ? (
            <View style={styles.continueButton}>
              <Text style={styles.continueButtonText}>Continue</Text>
            </View>
          ) : (
            <View style={styles.startButton}>
              <Text style={styles.startButtonText}>
                {content.premium ? 'Preview' : getActionText(content.type)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

// Program Card Content
const ProgramCardContent: React.FC<{ program: Program; progress: any }> = ({
  program,
  progress,
}) => (
  <>
    <Text style={styles.title} numberOfLines={2}>
      {program.title}
    </Text>
    <View style={styles.metadataRow}>
      <Text style={styles.metadata}>{program.weeks} weeks</Text>
      <Text style={styles.metadataSeparator}>•</Text>
      <Text style={styles.metadata}>{program.sessionsPerWeek}/week</Text>
    </View>
    <View style={styles.badgeRow}>
      <LevelBadge level={program.level} />
      {program.equipment.includes('none') && (
        <EquipmentBadge equipment="No equipment" />
      )}
    </View>
    {progress && (
      <Text style={styles.progressText}>{formatProgressText(progress)}</Text>
    )}
  </>
);

// Challenge Card Content
const ChallengeCardContent: React.FC<{
  challenge: Challenge;
  progress: any;
}> = ({ challenge, progress }) => (
  <>
    <Text style={styles.title} numberOfLines={2}>
      {challenge.title}
    </Text>
    <View style={styles.metadataRow}>
      <Text style={styles.metadata}>{challenge.durationDays} days</Text>
      <Text style={styles.metadataSeparator}>•</Text>
      <Text style={styles.metadata}>
        {challenge.participantsCount.toLocaleString()} joined
      </Text>
    </View>
    {challenge.friendsCount > 0 && (
      <Text style={styles.friendsText}>
        {challenge.friendsCount} friends participating
      </Text>
    )}
    {progress && (
      <Text style={styles.progressText}>{formatProgressText(progress)}</Text>
    )}
  </>
);

// Workout Card Content
const WorkoutCardContent: React.FC<{ workout: Workout }> = ({ workout }) => (
  <>
    <Text style={styles.title} numberOfLines={2}>
      {workout.title}
    </Text>
    <View style={styles.metadataRow}>
      <Text style={styles.metadata}>{workout.durationMinutes} min</Text>
      <Text style={styles.metadataSeparator}>•</Text>
      <Text style={styles.metadata}>{workout.estimatedCalories} cal</Text>
    </View>
    <View style={styles.badgeRow}>
      <LevelBadge level={workout.level} />
      {workout.equipment.includes('none') && (
        <EquipmentBadge equipment="No equipment" />
      )}
    </View>
  </>
);

// Article Card Content
const ArticleCardContent: React.FC<{ article: Article }> = ({ article }) => (
  <>
    <Text style={styles.title} numberOfLines={2}>
      {article.title}
    </Text>
    <View style={styles.metadataRow}>
      <Text style={styles.metadata}>{article.readTimeMinutes} min read</Text>
      <Text style={styles.metadataSeparator}>•</Text>
      <Text style={styles.metadata}>{article.topic}</Text>
    </View>
    <Text style={styles.excerpt} numberOfLines={2}>
      {article.excerpt}
    </Text>
    <Text style={styles.author}>By {article.author}</Text>
  </>
);

// Level Badge Component
const LevelBadge: React.FC<{ level: string }> = ({ level }) => (
  <View style={[styles.badge, styles.levelBadge]}>
    <Text style={styles.badgeText}>{level}</Text>
  </View>
);

// Equipment Badge Component
const EquipmentBadge: React.FC<{ equipment: string }> = ({ equipment }) => (
  <View style={[styles.badge, styles.equipmentBadge]}>
    <Text style={styles.badgeText}>{equipment}</Text>
  </View>
);

// Progress Ring Component
const ProgressRing: React.FC<{ progress: number; size: number }> = ({
  progress,
  size,
}) => (
  <View style={[styles.progressRingContainer, { width: size, height: size }]}>
    <View style={styles.progressRingBackground} />
    <View
      style={[
        styles.progressRingFill,
        {
          transform: [{ rotate: `${(progress / 100) * 360}deg` }],
        },
      ]}
    />
    <Text style={styles.progressRingText}>{Math.round(progress)}%</Text>
  </View>
);

// Utility functions
const getIconForContentType = (type: string): string => {
  switch (type) {
    case 'program':
      return 'calendar-outline';
    case 'challenge':
      return 'trophy-outline';
    case 'workout':
      return 'fitness-outline';
    case 'article':
      return 'document-text-outline';
    default:
      return 'help-outline';
  }
};

const getActionText = (type: string): string => {
  switch (type) {
    case 'program':
      return 'Start';
    case 'challenge':
      return 'Join';
    case 'workout':
      return 'Start';
    case 'article':
      return 'Read';
    default:
      return 'View';
  }
};

const styles = StyleSheet.create({
  card: {
    width: 280,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
  },
  cardDark: {
    backgroundColor: '#1A1A1A',
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },

  imageContainer: {
    position: 'relative',
    height: 160,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    backgroundColor: '#E5E5E5',
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  premiumText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },

  progressRing: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  progressRingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressRingBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  progressRingFill: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#5B9BFF',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  progressRingText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },

  contentContainer: {
    padding: 16,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metadata: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  metadataSeparator: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelBadge: {
    backgroundColor: '#E3F2FD',
  },
  equipmentBadge: {
    backgroundColor: '#F3E5F5',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  progressText: {
    fontSize: 14,
    color: '#5B9BFF',
    fontWeight: '600',
    marginBottom: 8,
  },
  friendsText: {
    fontSize: 12,
    color: '#5B9BFF',
    marginBottom: 8,
  },
  excerpt: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  author: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },

  actionContainer: {
    marginTop: 'auto',
  },
  continueButton: {
    backgroundColor: '#5B9BFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  startButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
});
