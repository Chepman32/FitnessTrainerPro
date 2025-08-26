import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  SafeAreaView,
  StatusBar,
  Switch,
  Alert
} from 'react-native';
import { Program, validateProgram, formatDuration, getTotalDuration } from '../types/program';
import { BackButton } from '../components/BackButton';
import { useTheme } from '../state/ThemeContext';

interface ProgramStartScreenProps {
  program: Program;
  onStart: (soundsEnabled: boolean, vibrationsEnabled: boolean) => void;
  onBack: () => void;
}

export const ProgramStartScreen: React.FC<ProgramStartScreenProps> = ({
  program,
  onStart,
  onBack
}) => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [vibrationsEnabled, setVibrationsEnabled] = useState(true);
  
  // Validate program
  const validation = validateProgram(program);
  const canStart = validation.isValid;
  
  const handleStart = () => {
    if (!canStart) {
      Alert.alert(
        'Invalid Program',
        validation.errors.join('\n'),
        [{ text: 'OK' }]
      );
      return;
    }
    
    onStart(soundsEnabled, vibrationsEnabled);
  };
  
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return '#34C759';
      case 'Intermediate': return '#FF9500';
      case 'Advanced': return '#FF3B30';
      default: return '#007AFF';
    }
  };
  
  const getStepIcon = (stepType: 'exercise' | 'rest') => {
    return stepType === 'exercise' ? '💪' : '⏸️';
  };
  
  const totalDuration = getTotalDuration(program);
  const hasLongSteps = program.steps.some(step => step.durationSec >= 7200); // 2+ hours
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={onBack} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Program Header */}
        <View style={styles.programHeader}>
          <Text style={[styles.programTitle, { color: theme.colors.text }]}>
            {program.title}
          </Text>
          
          <View style={styles.programMeta}>
            <View style={[styles.levelBadge, { backgroundColor: getLevelColor(program.level) }]}>
              <Text style={styles.levelText}>{program.level}</Text>
            </View>
            <Text style={[styles.duration, { color: theme.colors.textSecondary }]}>
              {formatDuration(totalDuration)}
            </Text>
          </View>
          
          {program.description && (
            <Text style={[styles.programDescription, { color: theme.colors.textSecondary }]}>
              {program.description}
            </Text>
          )}
        </View>
        
        {/* Program Stats */}
        <View style={[styles.statsContainer, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {program.stepsCount}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Steps
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {formatDuration(program.totalActiveSec)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Active
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {formatDuration(program.totalRestSec)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Rest
            </Text>
          </View>
          {program.estimatedCalories && (
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {program.estimatedCalories}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Cal
              </Text>
            </View>
          )}
        </View>
        
        {/* Tags */}
        {program.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {program.tags.map((tag, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: theme.colors.backgroundTertiary }]}>
                <Text style={[styles.tagText, { color: theme.colors.textSecondary }]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Warning for long steps */}
        {hasLongSteps && (
          <View style={[styles.warningContainer, { backgroundColor: isDark ? '#2D2A1A' : '#FFF3CD' }]}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={[styles.warningText, { color: isDark ? '#FFC107' : '#856404' }]}>
              This program contains long duration steps. Consider device battery usage.
            </Text>
          </View>
        )}
        
        {/* Validation Errors */}
        {!canStart && (
          <View style={[styles.errorContainer, { backgroundColor: isDark ? '#2D1B1E' : '#F8D7DA' }]}>
            <Text style={styles.errorIcon}>❌</Text>
            <View style={styles.errorTextContainer}>
              <Text style={[styles.errorTitle, { color: isDark ? '#F5C6CB' : '#721C24' }]}>
                Program Issues:
              </Text>
              {validation.errors.map((error, index) => (
                <Text key={index} style={[styles.errorText, { color: isDark ? '#F5C6CB' : '#721C24' }]}>
                  • {error}
                </Text>
              ))}
            </View>
          </View>
        )}
        
        {/* Steps List */}
        <View style={styles.stepsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Workout Steps
          </Text>
          
          {program.steps.map((step, index) => (
            <View 
              key={step.id} 
              style={[
                styles.stepItem, 
                { backgroundColor: theme.colors.surface },
                step.durationSec <= 0 && styles.stepItemError
              ]}
            >
              <View style={styles.stepHeader}>
                <View style={styles.stepLeftContent}>
                  <Text style={styles.stepIcon}>
                    {step.type === 'exercise' && 'icon' in step && step.icon ? step.icon : getStepIcon(step.type)}
                  </Text>
                  <View style={styles.stepInfo}>
                    <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                      {step.title}
                    </Text>
                    {step.type === 'exercise' && 'description' in step && step.description && (
                      <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
                        {step.description}
                      </Text>
                    )}
                    {step.type === 'rest' && 'tip' in step && step.tip && (
                      <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
                        💡 {step.tip}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.stepRightContent}>
                  <Text style={[styles.stepOrder, { color: theme.colors.textTertiary }]}>
                    {index + 1}
                  </Text>
                  <Text style={[
                    styles.stepDuration, 
                    { color: theme.colors.primary },
                    step.durationSec <= 0 && styles.stepDurationError
                  ]}>
                    {formatDuration(step.durationSec)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
        
        {/* Settings */}
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Settings
          </Text>
          
          <View style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
              Sound Effects
            </Text>
            <Switch
              value={soundsEnabled}
              onValueChange={setSoundsEnabled}
              trackColor={{ false: '#767577', true: '#007AFF' }}
              thumbColor={soundsEnabled ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>
          
          <View style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
              Vibrations
            </Text>
            <Switch
              value={vibrationsEnabled}
              onValueChange={setVibrationsEnabled}
              trackColor={{ false: '#767577', true: '#007AFF' }}
              thumbColor={vibrationsEnabled ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>
        </View>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Fixed Start Button */}
      <View style={[styles.startButtonContainer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
        <Pressable
          style={[
            styles.startButton,
            !canStart && styles.startButtonDisabled,
            { backgroundColor: canStart ? theme.colors.primary : '#CCCCCC' }
          ]}
          onPress={handleStart}
          disabled={!canStart}
        >
          <Text style={[
            styles.startButtonText,
            !canStart && styles.startButtonTextDisabled,
            { color: canStart ? theme.colors.primaryText : '#666666' }
          ]}>
            {canStart ? 'Start Workout' : 'Cannot Start'}
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12
  },
  backButton: {
    alignSelf: 'flex-start'
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500'
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20
  },
  programHeader: {
    marginBottom: 24
  },
  programTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12
  },
  programMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  },
  duration: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666'
  },
  programDescription: {
    fontSize: 16,
    lineHeight: 22,
    color: '#666666'
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20
  },
  tag: {
    backgroundColor: '#E5E5E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  tagText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500'
  },
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    alignItems: 'flex-start'
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 12
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#856404',
    lineHeight: 20
  },
  errorContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8D7DA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    alignItems: 'flex-start'
  },
  errorIcon: {
    fontSize: 20,
    marginRight: 12
  },
  errorTextContainer: {
    flex: 1
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#721C24',
    marginBottom: 8
  },
  errorText: {
    fontSize: 14,
    color: '#721C24',
    lineHeight: 20,
    marginBottom: 4
  },
  stepsSection: {
    marginBottom: 32
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16
  },
  stepItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12
  },
  stepItemError: {
    backgroundColor: '#F8D7DA',
    borderWidth: 1,
    borderColor: '#DC3545'
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  stepLeftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  stepIcon: {
    fontSize: 24,
    marginRight: 16
  },
  stepInfo: {
    flex: 1
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4
  },
  stepDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 18
  },
  stepRightContent: {
    alignItems: 'flex-end'
  },
  stepOrder: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4
  },
  stepDuration: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF'
  },
  stepDurationError: {
    color: '#DC3545'
  },
  settingsSection: {
    marginBottom: 32
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000'
  },
  bottomPadding: {
    height: 100
  },
  startButtonContainer: {
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
  startButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center'
  },
  startButtonDisabled: {
    backgroundColor: '#CCCCCC'
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600'
  },
  startButtonTextDisabled: {
    color: '#666666'
  }
});
