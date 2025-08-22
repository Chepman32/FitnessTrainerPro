import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  SafeAreaView,
  StatusBar,
  useColorScheme,
  Switch,
  Alert
} from 'react-native';
import { Program, validateProgram, formatDuration, getTotalDuration } from '../types/program';

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
  const isDark = useColorScheme() === 'dark';
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
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, isDark && styles.backButtonTextDark]}>
            ← Back
          </Text>
        </Pressable>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Program Header */}
        <View style={styles.programHeader}>
          <Text style={[styles.programTitle, isDark && styles.programTitleDark]}>
            {program.title}
          </Text>
          
          <View style={styles.programMeta}>
            <View style={[styles.levelBadge, { backgroundColor: getLevelColor(program.level) }]}>
              <Text style={styles.levelText}>{program.level}</Text>
            </View>
            <Text style={[styles.duration, isDark && styles.durationDark]}>
              {formatDuration(totalDuration)}
            </Text>
          </View>
          
          {program.description && (
            <Text style={[styles.programDescription, isDark && styles.programDescriptionDark]}>
              {program.description}
            </Text>
          )}
        </View>
        
        {/* Program Stats */}
        <View style={[styles.statsContainer, isDark && styles.statsContainerDark]}>
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
              {formatDuration(program.totalActiveSec)}
            </Text>
            <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>
              Active
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, isDark && styles.statValueDark]}>
              {formatDuration(program.totalRestSec)}
            </Text>
            <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>
              Rest
            </Text>
          </View>
          {program.estimatedCalories && (
            <View style={styles.statItem}>
              <Text style={[styles.statValue, isDark && styles.statValueDark]}>
                {program.estimatedCalories}
              </Text>
              <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>
                Cal
              </Text>
            </View>
          )}
        </View>
        
        {/* Tags */}
        {program.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {program.tags.map((tag, index) => (
              <View key={index} style={[styles.tag, isDark && styles.tagDark]}>
                <Text style={[styles.tagText, isDark && styles.tagTextDark]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Warning for long steps */}
        {hasLongSteps && (
          <View style={[styles.warningContainer, isDark && styles.warningContainerDark]}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={[styles.warningText, isDark && styles.warningTextDark]}>
              This program contains long duration steps. Consider device battery usage.
            </Text>
          </View>
        )}
        
        {/* Validation Errors */}
        {!canStart && (
          <View style={[styles.errorContainer, isDark && styles.errorContainerDark]}>
            <Text style={styles.errorIcon}>❌</Text>
            <View style={styles.errorTextContainer}>
              <Text style={[styles.errorTitle, isDark && styles.errorTitleDark]}>
                Program Issues:
              </Text>
              {validation.errors.map((error, index) => (
                <Text key={index} style={[styles.errorText, isDark && styles.errorTextDark]}>
                  • {error}
                </Text>
              ))}
            </View>
          </View>
        )}
        
        {/* Steps List */}
        <View style={styles.stepsSection}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Workout Steps
          </Text>
          
          {program.steps.map((step, index) => (
            <View 
              key={step.id} 
              style={[
                styles.stepItem, 
                isDark && styles.stepItemDark,
                step.durationSec <= 0 && styles.stepItemError
              ]}
            >
              <View style={styles.stepHeader}>
                <View style={styles.stepLeftContent}>
                  <Text style={styles.stepIcon}>
                    {step.type === 'exercise' && 'icon' in step && step.icon ? step.icon : getStepIcon(step.type)}
                  </Text>
                  <View style={styles.stepInfo}>
                    <Text style={[styles.stepTitle, isDark && styles.stepTitleDark]}>
                      {step.title}
                    </Text>
                    {step.type === 'exercise' && 'description' in step && step.description && (
                      <Text style={[styles.stepDescription, isDark && styles.stepDescriptionDark]}>
                        {step.description}
                      </Text>
                    )}
                    {step.type === 'rest' && 'tip' in step && step.tip && (
                      <Text style={[styles.stepDescription, isDark && styles.stepDescriptionDark]}>
                        💡 {step.tip}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.stepRightContent}>
                  <Text style={[styles.stepOrder, isDark && styles.stepOrderDark]}>
                    {index + 1}
                  </Text>
                  <Text style={[
                    styles.stepDuration, 
                    isDark && styles.stepDurationDark,
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
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Settings
          </Text>
          
          <View style={[styles.settingItem, isDark && styles.settingItemDark]}>
            <Text style={[styles.settingLabel, isDark && styles.settingLabelDark]}>
              Sound Effects
            </Text>
            <Switch
              value={soundsEnabled}
              onValueChange={setSoundsEnabled}
              trackColor={{ false: '#767577', true: '#007AFF' }}
              thumbColor={soundsEnabled ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>
          
          <View style={[styles.settingItem, isDark && styles.settingItemDark]}>
            <Text style={[styles.settingLabel, isDark && styles.settingLabelDark]}>
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
      <View style={[styles.startButtonContainer, isDark && styles.startButtonContainerDark]}>
        <Pressable
          style={[
            styles.startButton,
            !canStart && styles.startButtonDisabled,
            isDark && styles.startButtonDark
          ]}
          onPress={handleStart}
          disabled={!canStart}
        >
          <Text style={[
            styles.startButtonText,
            !canStart && styles.startButtonTextDisabled,
            isDark && styles.startButtonTextDark
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
  containerDark: {
    backgroundColor: '#000000'
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
  backButtonTextDark: {
    color: '#0A84FF'
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
  programTitleDark: {
    color: '#FFFFFF'
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
  durationDark: {
    color: '#AAAAAA'
  },
  programDescription: {
    fontSize: 16,
    lineHeight: 22,
    color: '#666666'
  },
  programDescriptionDark: {
    color: '#AAAAAA'
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20
  },
  statsContainerDark: {
    backgroundColor: '#1A1A1A'
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
  tagDark: {
    backgroundColor: '#333333'
  },
  tagText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500'
  },
  tagTextDark: {
    color: '#CCCCCC'
  },
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    alignItems: 'flex-start'
  },
  warningContainerDark: {
    backgroundColor: '#2D2A1A'
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
  warningTextDark: {
    color: '#FFC107'
  },
  errorContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8D7DA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    alignItems: 'flex-start'
  },
  errorContainerDark: {
    backgroundColor: '#2D1B1E'
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
  errorTitleDark: {
    color: '#F5C6CB'
  },
  errorText: {
    fontSize: 14,
    color: '#721C24',
    lineHeight: 20,
    marginBottom: 4
  },
  errorTextDark: {
    color: '#F5C6CB'
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
  sectionTitleDark: {
    color: '#FFFFFF'
  },
  stepItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12
  },
  stepItemDark: {
    backgroundColor: '#1A1A1A'
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
  stepTitleDark: {
    color: '#FFFFFF'
  },
  stepDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 18
  },
  stepDescriptionDark: {
    color: '#AAAAAA'
  },
  stepRightContent: {
    alignItems: 'flex-end'
  },
  stepOrder: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4
  },
  stepOrderDark: {
    color: '#777777'
  },
  stepDuration: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF'
  },
  stepDurationDark: {
    color: '#0A84FF'
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
  settingItemDark: {
    backgroundColor: '#1A1A1A'
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000'
  },
  settingLabelDark: {
    color: '#FFFFFF'
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
  startButtonContainerDark: {
    backgroundColor: '#000000',
    borderTopColor: '#333333'
  },
  startButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center'
  },
  startButtonDark: {
    backgroundColor: '#0A84FF'
  },
  startButtonDisabled: {
    backgroundColor: '#CCCCCC'
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600'
  },
  startButtonTextDark: {
    color: '#FFFFFF'
  },
  startButtonTextDisabled: {
    color: '#666666'
  }
});
