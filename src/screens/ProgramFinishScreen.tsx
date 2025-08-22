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
  Share
} from 'react-native';
import { Program, formatDuration } from '../types/program';
import { StepResult } from '../state/trainingStateMachine';

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
  const isDark = useColorScheme() === 'dark';
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
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.completionIcon}>🎉</Text>
          <Text style={[styles.title, isDark && styles.titleDark]}>
            Workout Complete!
          </Text>
          <Text style={[styles.programTitle, isDark && styles.programTitleDark]}>
            {program.title}
          </Text>
          
          <Text style={[styles.performanceMessage, isDark && styles.performanceMessageDark]}>
            {getPerformanceMessage()}
          </Text>
        </View>
        
        {/* Main Stats */}
        <View style={[styles.mainStatsContainer, isDark && styles.mainStatsContainerDark]}>
          <View style={styles.mainStatItem}>
            <Text style={[styles.mainStatValue, isDark && styles.mainStatValueDark]}>
              {formatDuration(Math.round(totalElapsedMs / 1000))}
            </Text>
            <Text style={[styles.mainStatLabel, isDark && styles.mainStatLabelDark]}>
              Total Time
            </Text>
          </View>
          
          <View style={styles.mainStatDivider} />
          
          <View style={styles.mainStatItem}>
            <Text style={[
              styles.mainStatValue, 
              isDark && styles.mainStatValueDark,
              { color: getCompletionColor() }
            ]}>
              {completionRate.toFixed(0)}%
            </Text>
            <Text style={[styles.mainStatLabel, isDark && styles.mainStatLabelDark]}>
              Completion
            </Text>
          </View>
          
          <View style={styles.mainStatDivider} />
          
          <View style={styles.mainStatItem}>
            <Text style={[styles.mainStatValue, isDark && styles.mainStatValueDark]}>
              {stepResults.length}
            </Text>
            <Text style={[styles.mainStatLabel, isDark && styles.mainStatLabelDark]}>
              Steps
            </Text>
          </View>
        </View>
        
        {/* Detailed Stats */}
        <View style={styles.detailedStatsSection}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Workout Breakdown
          </Text>
          
          <View style={[styles.statsGrid, isDark && styles.statsGridDark]}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, isDark && styles.statValueDark]}>
                  {formatDuration(totalActiveTime)}
                </Text>
                <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>
                  Active Time
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, isDark && styles.statValueDark]}>
                  {formatDuration(totalRestTime)}
                </Text>
                <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>
                  Rest Time
                </Text>
              </View>
            </View>
            
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, isDark && styles.statValueDark]}>
                  {formatDuration(Math.round(averageStepTime))}
                </Text>
                <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>
                  Avg Step Time
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, isDark && styles.statValueDark]}>
                  {program.estimatedCalories || '~'}
                </Text>
                <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>
                  Est. Calories
                </Text>
              </View>
            </View>
            
            {(skippedSteps > 0 || extendedSteps > 0) && (
              <View style={styles.statRow}>
                {skippedSteps > 0 && (
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, isDark && styles.statValueDark, { color: '#FF9500' }]}>
                      {skippedSteps}
                    </Text>
                    <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>
                      Skipped
                    </Text>
                  </View>
                )}
                {extendedSteps > 0 && (
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, isDark && styles.statValueDark, { color: '#34C759' }]}>
                      +{formatDuration(totalExtensionTime)}
                    </Text>
                    <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>
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
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Step Results
          </Text>
          
          {stepResults.map((result, index) => (
            <View 
              key={`${result.stepId}-${index}`}
              style={[styles.stepResultItem, isDark && styles.stepResultItemDark]}
            >
              <View style={styles.stepResultHeader}>
                <Text style={styles.stepResultIcon}>
                  {result.type === 'exercise' ? '💪' : '⏸️'}
                </Text>
                <View style={styles.stepResultInfo}>
                  <Text style={[styles.stepResultTitle, isDark && styles.stepResultTitleDark]}>
                    Step {result.stepIndex + 1}
                  </Text>
                  <View style={styles.stepResultMeta}>
                    <Text style={[styles.stepResultTime, isDark && styles.stepResultTimeDark]}>
                      {formatDuration(result.actualElapsedSec)}
                    </Text>
                    <Text style={[styles.stepResultPlanned, isDark && styles.stepResultPlannedDark]}>
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
      <View style={[styles.actionButtonsContainer, isDark && styles.actionButtonsContainerDark]}>
        <View style={styles.actionButtonsRow}>
          <Pressable 
            style={[styles.secondaryButton, isDark && styles.secondaryButtonDark]}
            onPress={handleShare}
          >
            <Text style={[styles.secondaryButtonText, isDark && styles.secondaryButtonTextDark]}>
              Share
            </Text>
          </Pressable>
          
          <Pressable 
            style={[styles.secondaryButton, isDark && styles.secondaryButtonDark]}
            onPress={onRepeat}
          >
            <Text style={[styles.secondaryButtonText, isDark && styles.secondaryButtonTextDark]}>
              Repeat
            </Text>
          </Pressable>
        </View>
        
        <Pressable 
          style={[styles.primaryButton, isDark && styles.primaryButtonDark]}
          onPress={onDone}
        >
          <Text style={[styles.primaryButtonText, isDark && styles.primaryButtonTextDark]}>
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
  containerDark: {
    backgroundColor: '#000000'
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
  titleDark: {
    color: '#FFFFFF'
  },
  programTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 16,
    textAlign: 'center'
  },
  programTitleDark: {
    color: '#0A84FF'
  },
  performanceMessage: {
    fontSize: 18,
    color: '#34C759',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24
  },
  performanceMessageDark: {
    color: '#30D158'
  },
  mainStatsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    alignItems: 'center'
  },
  mainStatsContainerDark: {
    backgroundColor: '#1A1A1A'
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
  mainStatValueDark: {
    color: '#FFFFFF'
  },
  mainStatLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500'
  },
  mainStatLabelDark: {
    color: '#AAAAAA'
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
  sectionTitleDark: {
    color: '#FFFFFF'
  },
  statsGrid: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20
  },
  statsGridDark: {
    backgroundColor: '#1A1A1A'
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
  stepResultsSection: {
    marginBottom: 32
  },
  stepResultItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12
  },
  stepResultItemDark: {
    backgroundColor: '#1A1A1A'
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
  stepResultTitleDark: {
    color: '#FFFFFF'
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
  stepResultTimeDark: {
    color: '#0A84FF'
  },
  stepResultPlanned: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4
  },
  stepResultPlannedDark: {
    color: '#AAAAAA'
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
  actionButtonsContainerDark: {
    backgroundColor: '#000000',
    borderTopColor: '#333333'
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
  secondaryButtonDark: {
    backgroundColor: '#1A1A1A'
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600'
  },
  secondaryButtonTextDark: {
    color: '#0A84FF'
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center'
  },
  primaryButtonDark: {
    backgroundColor: '#0A84FF'
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600'
  },
  primaryButtonTextDark: {
    color: '#FFFFFF'
  }
});
