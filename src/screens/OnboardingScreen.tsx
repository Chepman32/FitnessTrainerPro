import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Switch, ScrollView, Alert, PermissionsAndroid, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useOnboarding } from '../state/OnboardingContext';

const OnboardingScreen = () => {
  const { setHasOnboarded } = useOnboarding();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formData, setFormData] = useState({
    goals: [] as string[],
    age: 25,
    sex: 'Male',
    height: 170,
    weight: 70,
    waist: '',
    hips: '',
    neck: '',
    experience: 'Beginner',
    workoutDuration: 30,
    trainingTypes: [] as string[],
    workoutDays: [] as string[],
    reminderTime: 'Morning',
    customHour: 9,
    customMinute: 0,
    customPeriod: 'AM',
    showCustomTimePicker: false,
    notifications: true,
    motivation: [] as string[],
    agreedToTerms: false,
    subscribeToNewsletter: false
  });

  const TOTAL_SLIDES = 9;

  const isSlideValid = () => {
    switch (currentSlide) {
      case 0: // Goals
        return formData.goals.length > 0;
      case 1: // Profile - always valid (has default values)
        return true;
      case 2: // Body measurements - optional fields, always valid
        return true;
      case 3: // Experience
        return formData.experience !== '';
      case 4: // Training types
        return formData.trainingTypes.length > 0;
      case 5: // Workout frequency
        return formData.workoutDays.length > 0;
      case 6: // Reminder time
        return formData.reminderTime !== '';
      case 7: // Motivation
        return formData.motivation.length > 0;
      case 8: // Terms and consent
        return formData.agreedToTerms;
      default:
        return true;
    }
  };

  const requestNotificationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'This app needs access to send you workout reminders.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      // For iOS, you would typically use @react-native-async-storage/async-storage
      // or react-native-permissions library for more robust permission handling
      Alert.alert(
        'Notifications',
        'Please enable notifications in your device settings to receive workout reminders.',
        [{ text: 'OK' }]
      );
      return true;
    }
  };

  const nextSlide = async () => {
    if (!isSlideValid()) return;
    
    // If on reminder slide and notifications are enabled, request permission
    if (currentSlide === 6 && formData.notifications) {
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Notification permission is required to send you workout reminders. You can enable it later in settings.',
          [{ text: 'OK' }]
        );
      }
    }
    
    if (currentSlide < TOTAL_SLIDES - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setHasOnboarded(true);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  const PillButton = ({ title, selected, onPress }: { title: string; selected: boolean; onPress: () => void }) => (
    <Pressable
      style={[styles.pillButton, selected && styles.pillButtonSelected]}
      onPress={onPress}
    >
      <Text style={[styles.pillButtonText, selected && styles.pillButtonTextSelected]}>
        {title}
      </Text>
    </Pressable>
  );

  const DayButton = ({ day, selected, onPress }: { day: string; selected: boolean; onPress: () => void }) => (
    <Pressable
      style={[styles.dayButton, selected && styles.dayButtonSelected]}
      onPress={onPress}
    >
      <Text style={[styles.dayButtonText, selected && styles.dayButtonTextSelected]}>
        {day}
      </Text>
    </Pressable>
  );

  const renderSlide = () => {
    switch (currentSlide) {
      case 0:
        return (
          <View style={styles.slideContainer}>
            <Text style={styles.title}>Set Your Goals</Text>
            <Text style={styles.subtitle}>What do you want to achieve?</Text>
            <View style={styles.pillContainer}>
              {['Lose Weight', 'Build Muscle', 'Get Fitter', 'Improve Endurance', 'Something Else'].map((goal) => (
                <PillButton
                  key={goal}
                  title={goal}
                  selected={formData.goals.includes(goal)}
                  onPress={() => setFormData(prev => ({
                    ...prev,
                    goals: toggleArrayItem(prev.goals, goal)
                  }))}
                />
              ))}
            </View>
          </View>
        );

      case 1:
        return (
          <View style={styles.slideContainer}>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.subtitle}>Tell us about yourself</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Age</Text>
              <View style={styles.stepperContainer}>
                <Pressable
                  style={styles.stepperButton}
                  onPress={() => setFormData(prev => ({ ...prev, age: Math.max(16, prev.age - 1) }))}
                >
                  <Ionicons name="remove" size={20} color="#666" />
                </Pressable>
                <Text style={styles.stepperValue}>{formData.age}</Text>
                <Pressable
                  style={styles.stepperButton}
                  onPress={() => setFormData(prev => ({ ...prev, age: Math.min(100, prev.age + 1) }))}
                >
                  <Ionicons name="add" size={20} color="#666" />
                </Pressable>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Sex</Text>
              <View style={styles.toggleContainer}>
                <Pressable
                  style={[styles.toggleButton, formData.sex === 'Male' && styles.toggleButtonSelected]}
                  onPress={() => setFormData(prev => ({ ...prev, sex: 'Male' }))}
                >
                  <Text style={[styles.toggleButtonText, formData.sex === 'Male' && styles.toggleButtonTextSelected]}>Male</Text>
                </Pressable>
                <Pressable
                  style={[styles.toggleButton, formData.sex === 'Female' && styles.toggleButtonSelected]}
                  onPress={() => setFormData(prev => ({ ...prev, sex: 'Female' }))}
                >
                  <Text style={[styles.toggleButtonText, formData.sex === 'Female' && styles.toggleButtonTextSelected]}>Female</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                value={formData.height.toString()}
                onChangeText={(text) => setFormData(prev => ({ ...prev, height: parseInt(text) || 0 }))}
                keyboardType="numeric"
                placeholder="170"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                value={formData.weight.toString()}
                onChangeText={(text) => setFormData(prev => ({ ...prev, weight: parseInt(text) || 0 }))}
                keyboardType="numeric"
                placeholder="70"
              />
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.slideContainer}>
            <Text style={styles.title}>Body Measurements</Text>
            <Text style={styles.subtitle}>Optional measurements for better tracking</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Waist (cm)</Text>
              <TextInput
                style={styles.input}
                value={formData.waist}
                onChangeText={(text) => setFormData(prev => ({ ...prev, waist: text }))}
                keyboardType="numeric"
                placeholder="Optional"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Hips (cm)</Text>
              <TextInput
                style={styles.input}
                value={formData.hips}
                onChangeText={(text) => setFormData(prev => ({ ...prev, hips: text }))}
                keyboardType="numeric"
                placeholder="Optional"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Neck (cm)</Text>
              <TextInput
                style={styles.input}
                value={formData.neck}
                onChangeText={(text) => setFormData(prev => ({ ...prev, neck: text }))}
                keyboardType="numeric"
                placeholder="Optional"
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.slideContainer}>
            <Text style={styles.title}>Experience</Text>
            <Text style={styles.subtitle}>What's your fitness level?</Text>
            
            <View style={styles.toggleContainer}>
              <Pressable
                style={[styles.experienceButton, formData.experience === 'Beginner' && styles.experienceButtonSelected]}
                onPress={() => setFormData(prev => ({ ...prev, experience: 'Beginner' }))}
              >
                <Text style={[styles.experienceButtonText, formData.experience === 'Beginner' && styles.experienceButtonTextSelected]}>Beginner</Text>
              </Pressable>
              <Pressable
                style={[styles.experienceButton, formData.experience === 'Intermediate' && styles.experienceButtonSelected]}
                onPress={() => setFormData(prev => ({ ...prev, experience: 'Intermediate' }))}
              >
                <Text style={[styles.experienceButtonText, formData.experience === 'Intermediate' && styles.experienceButtonTextSelected]}>Intermediate</Text>
              </Pressable>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Workout Duration: {formData.workoutDuration} minutes</Text>
              <View style={styles.sliderContainer}>
                <Pressable
                  style={styles.sliderButton}
                  onPress={() => setFormData(prev => ({ ...prev, workoutDuration: Math.max(15, prev.workoutDuration - 15) }))}
                >
                  <Text style={styles.sliderButtonText}>-</Text>
                </Pressable>
                <View style={styles.sliderTrack}>
                  <View style={[styles.sliderFill, { width: `${(formData.workoutDuration - 15) / 105 * 100}%` }]} />
                </View>
                <Pressable
                  style={styles.sliderButton}
                  onPress={() => setFormData(prev => ({ ...prev, workoutDuration: Math.min(120, prev.workoutDuration + 15) }))}
                >
                  <Text style={styles.sliderButtonText}>+</Text>
                </Pressable>
              </View>
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.slideContainer}>
            <Text style={styles.title}>What are your preferred training types?</Text>
            <View style={styles.pillContainer}>
              {['Strength Training', 'Cardio', 'HIIT', 'Yoga', 'Pilates'].map((type) => (
                <PillButton
                  key={type}
                  title={type}
                  selected={formData.trainingTypes.includes(type)}
                  onPress={() => setFormData(prev => ({
                    ...prev,
                    trainingTypes: toggleArrayItem(prev.trainingTypes, type)
                  }))}
                />
              ))}
            </View>
          </View>
        );

      case 5:
        const daysOfWeek = [
          { id: 'sunday', label: 'S' },
          { id: 'monday', label: 'M' },
          { id: 'tuesday', label: 'T' },
          { id: 'wednesday', label: 'W' },
          { id: 'thursday', label: 'T' },
          { id: 'friday', label: 'F' },
          { id: 'saturday', label: 'S' }
        ];
        
        return (
          <View style={styles.slideContainer}>
            <Text style={styles.title}>How often do you want to work out?</Text>
            <View style={styles.daysContainer}>
              {daysOfWeek.map((dayObj) => (
                <DayButton
                  key={dayObj.id}
                  day={dayObj.label}
                  selected={formData.workoutDays.includes(dayObj.id)}
                  onPress={() => setFormData(prev => ({
                    ...prev,
                    workoutDays: toggleArrayItem(prev.workoutDays, dayObj.id)
                  }))}
                />
              ))}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Session Duration: {formData.workoutDuration} minutes</Text>
              <View style={styles.sliderContainer}>
                <Pressable
                  style={styles.sliderButton}
                  onPress={() => setFormData(prev => ({ ...prev, workoutDuration: Math.max(15, prev.workoutDuration - 15) }))}
                >
                  <Text style={styles.sliderButtonText}>-</Text>
                </Pressable>
                <View style={styles.sliderTrack}>
                  <View style={[styles.sliderFill, { width: `${(formData.workoutDuration - 15) / 105 * 100}%` }]} />
                </View>
                <Pressable
                  style={styles.sliderButton}
                  onPress={() => setFormData(prev => ({ ...prev, workoutDuration: Math.min(120, prev.workoutDuration + 15) }))}
                >
                  <Text style={styles.sliderButtonText}>+</Text>
                </Pressable>
              </View>
            </View>
          </View>
        );

      case 6:
        return (
          <View style={styles.slideContainer}>
            <Text style={styles.title}>At what time to remind you?</Text>
            
            <View style={styles.timeContainer}>
              <Pressable
                style={[styles.timeButton, formData.reminderTime === 'Morning' && styles.timeButtonSelected]}
                onPress={() => setFormData(prev => ({ ...prev, reminderTime: 'Morning', showCustomTimePicker: false }))}
              >
                <Text style={[styles.timeButtonText, formData.reminderTime === 'Morning' && styles.timeButtonTextSelected]}>Morning</Text>
                <Text style={[styles.timeSubtext, formData.reminderTime === 'Morning' && styles.timeButtonTextSelected]}>7:00 AM</Text>
              </Pressable>
              
              <Pressable
                style={[styles.timeButton, formData.reminderTime === 'Midday' && styles.timeButtonSelected]}
                onPress={() => setFormData(prev => ({ ...prev, reminderTime: 'Midday', showCustomTimePicker: false }))}
              >
                <Text style={[styles.timeButtonText, formData.reminderTime === 'Midday' && styles.timeButtonTextSelected]}>Midday</Text>
                <Text style={[styles.timeSubtext, formData.reminderTime === 'Midday' && styles.timeButtonTextSelected]}>12:00 PM</Text>
              </Pressable>
              
              <Pressable
                style={[styles.timeButton, formData.reminderTime === 'Evening' && styles.timeButtonSelected]}
                onPress={() => setFormData(prev => ({ ...prev, reminderTime: 'Evening', showCustomTimePicker: false }))}
              >
                <Text style={[styles.timeButtonText, formData.reminderTime === 'Evening' && styles.timeButtonTextSelected]}>Evening</Text>
                <Text style={[styles.timeSubtext, formData.reminderTime === 'Evening' && styles.timeButtonTextSelected]}>7:00 PM</Text>
              </Pressable>
            </View>

            <Pressable 
              style={[styles.customTimeButton, formData.showCustomTimePicker && styles.customTimeButtonSelected]}
              onPress={() => setFormData(prev => ({ ...prev, showCustomTimePicker: !prev.showCustomTimePicker, reminderTime: prev.showCustomTimePicker ? 'Morning' : 'Custom' }))}
            >
              <Text style={[styles.customTimeText, formData.showCustomTimePicker && styles.customTimeTextSelected]}>
                {formData.showCustomTimePicker 
                  ? 'Hide Custom Time' 
                  : formData.reminderTime === 'Custom'
                    ? `${formData.customHour}:${formData.customMinute.toString().padStart(2, '0')} ${formData.customPeriod}`
                    : 'Custom Time'
                }
              </Text>
            </Pressable>

            {formData.showCustomTimePicker && (
                    <View style={styles.customTimeInputContainer}>
                      <View style={styles.iosTimePickerContainer}>
                        <View style={styles.pickerColumn}>
                          <ScrollView 
                            style={styles.pickerScrollView}
                            showsVerticalScrollIndicator={false}
                            snapToInterval={40}
                            decelerationRate="fast"
                          >
                            <View style={styles.pickerPadding} />
                            {[1,2,3,4,5,6,7,8,9,10,11,12].map(hour => (
                              <Pressable
                                key={hour}
                                style={styles.pickerOption}
                                onPress={() => setFormData(prev => ({...prev, customHour: hour}))}
                              >
                                <Text style={[styles.pickerOptionText, formData.customHour === hour && styles.pickerOptionTextSelected]}>{hour}</Text>
                              </Pressable>
                            ))}
                            <View style={styles.pickerPadding} />
                          </ScrollView>
                        </View>
                        
                        <View style={styles.pickerColumn}>
                          <ScrollView 
                            style={styles.pickerScrollView}
                            showsVerticalScrollIndicator={false}
                            snapToInterval={40}
                            decelerationRate="fast"
                          >
                            <View style={styles.pickerPadding} />
                            {[0,5,10,15,20,25,30,35,40,45,50,55].map(minute => (
                              <Pressable
                                key={minute}
                                style={styles.pickerOption}
                                onPress={() => setFormData(prev => ({...prev, customMinute: minute}))}
                              >
                                <Text style={[styles.pickerOptionText, formData.customMinute === minute && styles.pickerOptionTextSelected]}>{minute.toString().padStart(2, '0')}</Text>
                              </Pressable>
                            ))}
                            <View style={styles.pickerPadding} />
                          </ScrollView>
                        </View>
                        
                        <View style={styles.pickerColumn}>
                          <ScrollView 
                            style={styles.pickerScrollView}
                            showsVerticalScrollIndicator={false}
                            snapToInterval={40}
                            decelerationRate="fast"
                          >
                            <View style={styles.pickerPadding} />
                            {['AM', 'PM'].map(period => (
                              <Pressable
                                key={period}
                                style={styles.pickerOption}
                                onPress={() => setFormData(prev => ({...prev, customPeriod: period}))}
                              >
                                <Text style={[styles.pickerOptionText, formData.customPeriod === period && styles.pickerOptionTextSelected]}>{period}</Text>
                              </Pressable>
                            ))}
                            <View style={styles.pickerPadding} />
                          </ScrollView>
                        </View>
                        
                        <View style={styles.pickerSelectionIndicator} />
                      </View>
                    </View>
                  )}

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Enable notifications</Text>
              <Switch
                value={formData.notifications}
                onValueChange={(value) => setFormData(prev => ({ ...prev, notifications: value }))}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor={formData.notifications ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </View>
        );

      case 7:
        return (
          <View style={styles.slideContainer}>
            <Text style={styles.title}>What drives you to work out?</Text>
            <View style={styles.pillContainer}>
              {['Get Fit', 'Gain Muscle', 'Lose Weight', 'Improve Health', 'Increase Energy'].map((motivation) => (
                <PillButton
                  key={motivation}
                  title={motivation}
                  selected={formData.motivation.includes(motivation)}
                  onPress={() => setFormData(prev => ({
                    ...prev,
                    motivation: toggleArrayItem(prev.motivation, motivation)
                  }))}
                />
              ))}
            </View>
          </View>
        );

      case 8:
        return (
          <View style={styles.slideContainer}>
            <Text style={styles.title}>Review & Consent</Text>
            
            <View style={styles.checkboxContainer}>
              <Pressable
                style={styles.checkbox}
                onPress={() => setFormData(prev => ({ ...prev, agreedToTerms: !prev.agreedToTerms }))}
              >
                {formData.agreedToTerms && <Ionicons name="checkmark" size={16} color="#4CAF50" />}
              </Pressable>
              <Text style={styles.checkboxText}>I agree to the Terms of Service and Privacy Policy</Text>
            </View>

            <View style={styles.checkboxContainer}>
              <Pressable
                style={styles.checkbox}
                onPress={() => setFormData(prev => ({ ...prev, subscribeToNewsletter: !prev.subscribeToNewsletter }))}
              >
                {formData.subscribeToNewsletter && <Ionicons name="checkmark" size={16} color="#4CAF50" />}
              </Pressable>
              <Text style={styles.checkboxText}>Subscribe to newsletter for fitness tips</Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={prevSlide} disabled={currentSlide === 0}>
          <Ionicons 
            name="chevron-back" 
            size={24} 
            color={currentSlide === 0 ? '#E0E0E0' : '#333'} 
          />
        </Pressable>
        
        <View style={styles.progressContainer}>
          {Array.from({ length: TOTAL_SLIDES }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index <= currentSlide && styles.progressDotActive
              ]}
            />
          ))}
        </View>
        
        <Pressable onPress={() => setHasOnboarded(true)}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderSlide()}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[
            styles.nextButton, 
            currentSlide === TOTAL_SLIDES - 1 && styles.completeButton,
            !isSlideValid() && styles.nextButtonDisabled
          ]}
          onPress={nextSlide}
          disabled={!isSlideValid()}
        >
          <Text style={[styles.nextButtonText, !isSlideValid() && styles.nextButtonTextDisabled]}>
            {currentSlide === TOTAL_SLIDES - 1 ? 'Complete' : 'Next'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#4CAF50',
  },
  skipText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  slideContainer: {
    flex: 1,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  pillButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pillButtonSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  pillButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  pillButtonTextSelected: {
    color: '#FFFFFF',
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  stepperValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 20,
    minWidth: 40,
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleButtonSelected: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  toggleButtonTextSelected: {
    color: '#333',
    fontWeight: '600',
  },
  experienceButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginHorizontal: 6,
  },
  experienceButtonSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  experienceButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  experienceButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  sliderButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sliderButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  sliderTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dayButtonSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  dayButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  dayButtonTextSelected: {
    color: '#FFFFFF',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  timeButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timeButtonSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  timeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  timeButtonTextSelected: {
    color: '#FFFFFF',
  },
  timeSubtext: {
    fontSize: 14,
    color: '#999',
  },
  customTimeButton: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    marginBottom: 30,
  },
  customTimeButtonSelected: {
    backgroundColor: '#4CAF50',
  },
  customTimeText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  customTimeTextSelected: {
    color: '#FFFFFF',
  },
  customTimeInputContainer: {
    marginBottom: 20,
  },
  iosTimePickerContainer: {
    flexDirection: 'row',
    height: 200,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  pickerColumn: {
    flex: 1,
    height: '100%',
  },
  pickerScrollView: {
    flex: 1,
  },
  pickerPadding: {
    height: 80,
  },
  pickerOption: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerOptionText: {
    fontSize: 18,
    color: '#666666',
    fontWeight: '400',
  },
  pickerOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 20,
  },
  pickerSelectionIndicator: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 40,
    marginTop: -20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    pointerEvents: 'none',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  completeButton: {
    backgroundColor: '#2196F3',
  },
  nextButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  nextButtonTextDisabled: {
    color: '#999999',
  },
});

export default OnboardingScreen;