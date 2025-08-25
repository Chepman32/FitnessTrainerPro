import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  SafeAreaView,
  StatusBar,
  Share
} from 'react-native';
import { Program, formatDuration } from '../types/program';
import { StepResult } from '../state/trainingStateMachine';
import { useTheme } from '../state/ThemeContext';

interface ProgramCompletionData {
  program: Program;
  stepResults: StepResult[];
  totalElapsedMs: number;
}

interface ProgramFinishScreenProps {
  completionData: ProgramCompletionData;
  onDone: () => void;
  onRepeat: () => void;
}

export const ProgramFinishScreen: React.FC<ProgramFinishScreenProps> = ({
  completionData,
  onDone,
  onRepeat
}) => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const { program, stepResults, totalElapsedMs } = completionData;
  
  // Calculate statistics
  const totalActiveTime = stepResults
    .filter(result => result.type === 'exercise')
    .reduce((sum, result) => sum + result.actualElapsedSec, 0);
  
  const totalRestTime = stepResults
    .filter(result => result.type === 'rest')
    .reduce((sum, result) => sum + result.actualElapsedSec, 0);
  
  const skippedSteps = stepResults.filter(result => result.wasSkipped).length;
  const extendedSteps = stepResults.filter(result => result.wasExtended).length;
  
  const totalExtensionTime = stepResults
    .reduce((sum, result) => sum + result.extensionSec, 0);
  
  const averageStepTime = stepResults.length > 0 
    ? stepResults.reduce((sum, result) => sum + result.actualElapsedSec, 0) / stepResults.length
    : 0;
  
  const completionRate = stepResults.length > 0 
    ? ((stepResults.length - skippedSteps) / stepResults.length) * 100
    : 0;
  
  // Share functionality
  const handleShare = async () => {
    try {
      const message = `Just completed "${program.title}"! 💪\n\n` +
        `⏱️ Total Time: ${formatDuration(Math.round(totalElapsedMs / 1000))}\n` +
        `🔥 Active Time: ${formatDuration(totalActiveTime)}\n` +
        `📊 Completion: ${completionRate.toFixed(0)}%\n` +
        `🎯 Steps: ${stepResults.length}\n\n` +
        `#FitnessTrainerPro #Workout #Fitness`;
      
      await Share.share({
        message,
        title: 'Workout Complete!'
      });
    } catch (error) {
      console.error('Error sharing workout results:', error);
    }
  };
  
  const getPerformanceMessage = () => {
    if (completionRate === 100) {
      return "Outstanding! You completed every step! 🏆";
    } else if (completionRate >= 80) {
      return "Great job! You pushed through most of the workout! 💪";
    } else if (completionRate >= 60) {
      return "Good effort! Keep building that consistency! 👍";
    } else {
      return "Every step counts! Keep going! 🌟";
    }
  };
  
  const getCompletionColor = () => {
    if (completionRate === 100) return '#34C759';
    if (completionRate >= 80) return '#30D158';
    if (completionRate >= 60) return '#FF9500';
    return '#FF6B6B';
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.completionIcon}>🎉</Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Workout Complete!
          </Text>
          <Text style={[styles.programTitle, { color: theme.colors.primary }]}>
            {program.title}
          </Text>
          
          <Text style={[styles.performanceMessage, { color: completionRate === 100 ? '#34C759' : '#30D158' }]}>
            {getPerformanceMessage()}
          </Text>
        </View>
        
        {/* Main Stats */}
        <View style={[styles.mainStatsContainer, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.mainStatItem}>
            <Text style={[styles.mainStatValue, { color: theme.colors.text }]}>
              {formatDuration(Math.round(totalElapsedMs / 1000))}
            </Text>
            <Text style={[styles.mainStatLabel, { color: theme.colors.textSecondary }]}>
              Total Time
            </Text>
          </View>
          
          <View style={styles.mainStatDivider} />
          
          <View style={styles.mainStatItem}>
            <Text style={[
              styles.mainStatValue, 
              { color: getCompletionColor() }
            ]}>
              {completionRate.toFixed(0)}%
            </Text>
            <Text style={[styles.mainStatLabel, { color: theme.colors.textSecondary }]}>
              Completion
            </Text>
          </View>
          
          <View style={styles.mainStatDivider} />
          
          <View style={styles.mainStatItem}>
            <Text style={[styles.mainStatValue, { color: theme.colors.text }]}>
              {stepResults.length}
            </Text>
            <Text style={[styles.mainStatLabel, { color: theme.colors.textSecondary }]}>
              Steps
            </Text>
          </View>
        </View>
        
        {/* Detailed Stats */}
        <View style={styles.detailedStatsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Workout Breakdown
          </Text>
          
          <View style={[styles.statsGrid, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {formatDuration(totalActiveTime)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Active Time
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {formatDuration(totalRestTime)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Rest Time
                </Text>
              </View>
            </View>
            
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {formatDuration(Math.round(averageStepTime))}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Avg Step Time
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {program.estimatedCalories || '~'}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Est. Calories
                </Text>
              </View>
            </View>
            
            {(skippedSteps > 0 || extendedSteps > 0) && (
              <View style={styles.statRow}>
                {skippedSteps > 0 && (
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: '#FF9500' }]}>
                      {skippedSteps}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                      Skipped
                    </Text>
                  </View>
                )}
                {extendedSteps > 0 && (
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: '#34C759' }]}>
                      +{formatDuration(totalExtensionTime)}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                      Extended
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
        
        {/* Step-by-Step Results */}
        <View style={styles.stepResultsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Step Results
          </Text>
          
          {stepResults.map((result, index) => (
            <View 
              key={`${result.stepId}-${index}`}
              style={[styles.stepResultItem, { backgroundColor: theme.colors.surface }]}
            >
              <View style={styles.stepResultHeader}>
                <Text style={styles.stepResultIcon}>
                  {result.type === 'exercise' ? '💪' : '⏸️'}
                </Text>
                <View style={styles.stepResultInfo}>
                  <Text style={[styles.stepResultTitle, { color: theme.colors.text }]}>
                    Step {result.stepIndex + 1}
                  </Text>
                  <View style={styles.stepResultMeta}>
                    <Text style={[styles.stepResultTime, { color: theme.colors.primary }]}>
                      {formatDuration(result.actualElapsedSec)}
                    </Text>
                    <Text style={[styles.stepResultPlanned, { color: theme.colors.textSecondary }]}>
                      / {formatDuration(result.plannedDurationSec)}
                    </Text>
                  </View>
                </View>
                <View style={styles.stepResultBadges}>
                  {result.wasSkipped && (
                    <View style={styles.skippedBadge}>
                      <Text style={styles.skippedBadgeText}>Skipped</Text>
                    </View>
                  )}
                  {result.wasExtended && (
                    <View style={styles.extendedBadge}>
                      <Text style={styles.extendedBadgeText}>+{result.extensionSec}s</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Action Buttons */}
      <View style={[styles.actionButtonsContainer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
        <View style={styles.actionButtonsRow}>
          <Pressable 
            style={[styles.secondaryButton, { backgroundColor: theme.colors.surface }]}
            onPress={handleShare}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>
              Share
            </Text>
          </Pressable>
          
          <Pressable 
            style={[styles.secondaryButton, { backgroundColor: theme.colors.surface }]}
            onPress={onRepeat}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>
              Repeat
            </Text>
          </Pressable>
        </View>
        
        <Pressable 
          style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
          onPress={onDone}
        >
          <Text style={[styles.primaryButtonText, { color: theme.colors.primaryText }]}>
            Done
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40
  },
  completionIcon: {
    fontSize: 64,
    marginBottom: 16
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8
  },
  programTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 16,
    textAlign: 'center'
  },
  performanceMessage: {
    fontSize: 18,
    color: '#34C759',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24
  },
  mainStatsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    alignItems: 'center'
  },
  mainStatItem: {
    flex: 1,
    alignItems: 'center'
  },
  mainStatValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4
  },
  mainStatLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500'
  },
  mainStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 16
  },
  detailedStatsSection: {
    marginBottom: 32
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16
  },
  statsGrid: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20
  },
  statRow: {
    flexDirection: 'row',
    marginBottom: 20
  },
  statItem: {
    flex: 1,
    alignItems: 'center'
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textTransform: 'uppercase',
    fontWeight: '500'
  },
  stepResultsSection: {
    marginBottom: 32
  },
  stepResultItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12
  },
  stepResultHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  stepResultIcon: {
    fontSize: 24,
    marginRight: 16
  },
  stepResultInfo: {
    flex: 1
  },
  stepResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4
  },
  stepResultMeta: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  stepResultTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF'
  },
  stepResultPlanned: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4
  },
  stepResultBadges: {
    flexDirection: 'row',
    gap: 8
  },
  skippedBadge: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  skippedBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600'
  },
  extendedBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  extendedBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600'
  },
  bottomPadding: {
    height: 120
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5'
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center'
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600'
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center'
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600'
  }
});
