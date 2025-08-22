import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  SafeAreaView,
  StatusBar,
  useColorScheme,
  ImageBackground
} from 'react-native';
import { SAMPLE_PROGRAMS } from '../data/samplePrograms';
import { formatDuration, getTotalDuration } from '../types/program';

interface ProgramsTestScreenProps {
  onProgramSelect: (program: any) => void;
  onBack: () => void;
}

export const ProgramsTestScreen: React.FC<ProgramsTestScreenProps> = ({
  onProgramSelect,
  onBack
}) => {
  const isDark = useColorScheme() === 'dark';

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return '#34C759';
      case 'Intermediate': return '#FF9500';
      case 'Advanced': return '#FF3B30';
      default: return '#007AFF';
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, isDark && styles.backButtonTextDark]}>
            ← Back
          </Text>
        </Pressable>
        <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
          Complex Training Programs
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
          Test the new Complex Training Programs with timed exercises, animations, and step-by-step guidance.
        </Text>

        {SAMPLE_PROGRAMS.map((program) => (
          <Pressable
            key={program.id}
            style={[styles.programCard, isDark && styles.programCardDark]}
            onPress={() => onProgramSelect(program)}
          >
            <ImageBackground
              source={{ uri: program.thumbnailUrl }}
              style={styles.programImage}
              imageStyle={styles.programImageStyle}
            >
              <View style={styles.programOverlay}>
                <View style={styles.programHeader}>
                  <View style={[styles.levelBadge, { backgroundColor: getLevelColor(program.level) }]}>
                    <Text style={styles.levelText}>{program.level}</Text>
                  </View>
                  <View style={styles.difficultyContainer}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Text key={i} style={styles.difficultyStar}>
                        {i < program.difficulty ? '★' : '☆'}
                      </Text>
                    ))}
                  </View>
                </View>
              </View>
            </ImageBackground>

            <View style={styles.programContent}>
              <Text style={[styles.programTitle, isDark && styles.programTitleDark]}>
                {program.title}
              </Text>
              
              <Text style={[styles.programDescription, isDark && styles.programDescriptionDark]}>
                {program.description}
              </Text>

              <View style={styles.programStats}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, isDark && styles.statValueDark]}>
                    {formatDuration(getTotalDuration(program))}
                  </Text>
                  <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>
                    Total Duration
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, isDark && styles.statValueDark]}>
                    {program.stepsCount}
                  </Text>
                  <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>
                    Steps
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, isDark && styles.statValueDark]}>
                    {program.estimatedCalories}
                  </Text>
                  <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>
                    Calories
                  </Text>
                </View>
              </View>

              <View style={styles.tagsContainer}>
                {program.tags.slice(0, 3).map((tag, index) => (
                  <View key={index} style={[styles.tag, isDark && styles.tagDark]}>
                    <Text style={[styles.tagText, isDark && styles.tagTextDark]}>
                      {tag}
                    </Text>
                  </View>
                ))}
                {program.tags.length > 3 && (
                  <Text style={[styles.moreTagsText, isDark && styles.moreTagsTextDark]}>
                    +{program.tags.length - 3} more
                  </Text>
                )}
              </View>

              <Pressable 
                style={[styles.startButton, isDark && styles.startButtonDark]}
                onPress={() => onProgramSelect(program)}
              >
                <Text style={[styles.startButtonText, isDark && styles.startButtonTextDark]}>
                  Start Program →
                </Text>
              </Pressable>
            </View>
          </Pressable>
        ))}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  containerDark: {
    backgroundColor: '#000000'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16
  },
  backButton: {
    paddingVertical: 8
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500'
  },
  backButtonTextDark: {
    color: '#0A84FF'
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center'
  },
  headerTitleDark: {
    color: '#FFFFFF'
  },
  headerSpacer: {
    width: 60
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22
  },
  subtitleDark: {
    color: '#AAAAAA'
  },
  programCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  programCardDark: {
    backgroundColor: '#1A1A1A'
  },
  programImage: {
    height: 120,
    justifyContent: 'flex-end'
  },
  programImageStyle: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16
  },
  programOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 16
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600'
  },
  difficultyContainer: {
    flexDirection: 'row'
  },
  difficultyStar: {
    color: '#FFD700',
    fontSize: 16,
    marginLeft: 2
  },
  programContent: {
    padding: 20
  },
  programTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8
  },
  programTitleDark: {
    color: '#FFFFFF'
  },
  programDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 16
  },
  programDescriptionDark: {
    color: '#AAAAAA'
  },
  programStats: {
    flexDirection: 'row',
    marginBottom: 16
  },
  statItem: {
    flex: 1,
    alignItems: 'center'
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4
  },
  statValueDark: {
    color: '#FFFFFF'
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textTransform: 'uppercase',
    fontWeight: '500'
  },
  statLabelDark: {
    color: '#AAAAAA'
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8
  },
  tag: {
    backgroundColor: '#E5E5E5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  tagDark: {
    backgroundColor: '#333333'
  },
  tagText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500'
  },
  tagTextDark: {
    color: '#CCCCCC'
  },
  moreTagsText: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic'
  },
  moreTagsTextDark: {
    color: '#777777'
  },
  startButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center'
  },
  startButtonDark: {
    backgroundColor: '#0A84FF'
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  startButtonTextDark: {
    color: '#FFFFFF'
  },
  bottomPadding: {
    height: 40
  }
});
