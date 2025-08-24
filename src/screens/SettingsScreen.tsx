import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Pressable,
  useColorScheme,
  Switch,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type SettingsScreenProps = {
  onBack?: () => void;
};

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const isDark = useColorScheme() === 'dark';
  
  // Settings state
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [vibrationsEnabled, setVibrationsEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [unitsType, setUnitsType] = useState<'metric' | 'imperial'>('metric');
  const [healthConnected, setHealthConnected] = useState(true);
  const [doNotDisturbEnabled, setDoNotDisturbEnabled] = useState(true);

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will remove all your favorites, progress, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear Data', 
          style: 'destructive',
          onPress: () => {
            // Implementation for clearing data would go here
            Alert.alert('Data Cleared', 'All data has been cleared successfully.');
          }
        }
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset all settings to their default values.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            setSoundsEnabled(true);
            setVibrationsEnabled(true);
            setNotificationsEnabled(false);
            setAnalyticsEnabled(false);
            setUnitsType('metric');
            setHealthConnected(true);
            setDoNotDisturbEnabled(true);
            Alert.alert('Settings Reset', 'All settings have been reset to defaults.');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons 
            name="chevron-back" 
            size={24} 
            color={isDark ? '#FFFFFF' : '#000000'} 
          />
        </Pressable>
        <Text style={[styles.title, isDark && styles.titleDark]}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Units */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Units
          </Text>
          
          <UnitsSelector
            selectedUnits={unitsType}
            onUnitsChange={setUnitsType}
            isDark={isDark}
          />
        </View>

        {/* Audio & Haptics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Audio & Haptics
          </Text>
          
          <SettingItem
            icon="volume-high-outline"
            title="Sounds"
            subtitle="Exercise sounds and audio cues"
            value={soundsEnabled}
            onValueChange={setSoundsEnabled}
            isDark={isDark}
          />
          
          <SettingItem
            icon="phone-portrait-outline"
            title="Vibrations"
            subtitle="Haptic feedback during workouts"
            value={vibrationsEnabled}
            onValueChange={setVibrationsEnabled}
            isDark={isDark}
          />
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Notifications
          </Text>
          
          <SettingItem
            icon="notifications-outline"
            title="Workout Reminders"
            subtitle="Get notified about your workout schedule"
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            isDark={isDark}
          />
          
          <DoNotDisturbItem
            title="Do Not Disturb"
            subtitle="9:00 PM–7:00 AM"
            enabled={doNotDisturbEnabled}
            onPress={() => setDoNotDisturbEnabled(!doNotDisturbEnabled)}
            isDark={isDark}
          />
        </View>

        {/* Health Integration */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Health Integration
          </Text>
          
          <HealthIntegrationItem
            title="Apple Health or Google Fit"
            connected={healthConnected}
            onPress={() => setHealthConnected(!healthConnected)}
            isDark={isDark}
          />
        </View>

        {/* Privacy */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Privacy
          </Text>
          
          <SettingItem
            icon="analytics-outline"
            title="Analytics"
            subtitle="Help improve the app with usage data"
            value={analyticsEnabled}
            onValueChange={setAnalyticsEnabled}
            isDark={isDark}
          />
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            App Information
          </Text>
          
          <InfoItem
            icon="information-circle-outline"
            title="Version"
            value="1.0.0"
            isDark={isDark}
          />
          
          <InfoItem
            icon="build-outline"
            title="Build"
            value="2024.08.24"
            isDark={isDark}
          />
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Advanced
          </Text>
          
          <ActionItem
            icon="refresh-outline"
            title="Reset Settings"
            subtitle="Reset all settings to default values"
            onPress={handleResetSettings}
            isDark={isDark}
          />
          
          <ActionItem
            icon="trash-outline"
            title="Clear All Data"
            subtitle="Remove all favorites and progress"
            onPress={handleClearData}
            isDark={isDark}
            destructive
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, isDark && styles.footerTextDark]}>
            FitnessTrainerPro is designed to be completely offline and private.
            No data is sent to external servers.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper Components
type SettingItemProps = {
  icon: string;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  isDark: boolean;
};

const SettingItem: React.FC<SettingItemProps> = ({ 
  icon, 
  title, 
  subtitle, 
  value, 
  onValueChange, 
  isDark 
}) => {
  return (
    <View style={[styles.settingItem, isDark && styles.settingItemDark]}>
      <View style={styles.settingContent}>
        <View style={[styles.settingIcon, isDark && styles.settingIconDark]}>
          <Ionicons name={icon as any} size={20} color={isDark ? '#FFFFFF' : '#000000'} />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, isDark && styles.settingTitleDark]}>
            {title}
          </Text>
          <Text style={[styles.settingSubtitle, isDark && styles.settingSubtitleDark]}>
            {subtitle}
          </Text>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: isDark ? '#333333' : '#E9ECEF', true: '#5B9BFF' }}
          thumbColor={value ? '#FFFFFF' : isDark ? '#666666' : '#FFFFFF'}
        />
      </View>
    </View>
  );
};

type InfoItemProps = {
  icon: string;
  title: string;
  value: string;
  isDark: boolean;
};

const InfoItem: React.FC<InfoItemProps> = ({ icon, title, value, isDark }) => {
  return (
    <View style={[styles.settingItem, isDark && styles.settingItemDark]}>
      <View style={styles.settingContent}>
        <View style={[styles.settingIcon, isDark && styles.settingIconDark]}>
          <Ionicons name={icon as any} size={20} color={isDark ? '#FFFFFF' : '#000000'} />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, isDark && styles.settingTitleDark]}>
            {title}
          </Text>
        </View>
        <Text style={[styles.infoValue, isDark && styles.infoValueDark]}>
          {value}
        </Text>
      </View>
    </View>
  );
};

type ActionItemProps = {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  isDark: boolean;
  destructive?: boolean;
};

const ActionItem: React.FC<ActionItemProps> = ({ 
  icon, 
  title, 
  subtitle, 
  onPress, 
  isDark, 
  destructive = false 
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingItem,
        isDark && styles.settingItemDark,
        pressed && styles.settingItemPressed
      ]}
      onPress={onPress}
    >
      <View style={styles.settingContent}>
        <View style={[
          styles.settingIcon, 
          isDark && styles.settingIconDark,
          destructive && styles.destructiveIcon
        ]}>
          <Ionicons 
            name={icon as any} 
            size={20} 
            color={destructive ? '#FF453A' : isDark ? '#FFFFFF' : '#000000'} 
          />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={[
            styles.settingTitle, 
            isDark && styles.settingTitleDark,
            destructive && styles.destructiveText
          ]}>
            {title}
          </Text>
          <Text style={[styles.settingSubtitle, isDark && styles.settingSubtitleDark]}>
            {subtitle}
          </Text>
        </View>
        <Ionicons 
          name="chevron-forward" 
          size={16} 
          color={isDark ? '#666666' : '#CCCCCC'} 
        />
      </View>
    </Pressable>
  );
};

// New Helper Components
type UnitsSelectorProps = {
  selectedUnits: 'metric' | 'imperial';
  onUnitsChange: (units: 'metric' | 'imperial') => void;
  isDark: boolean;
};

const UnitsSelector: React.FC<UnitsSelectorProps> = ({ selectedUnits, onUnitsChange, isDark }) => {
  return (
    <View style={[styles.unitsSelector, isDark && styles.unitsSelectorDark]}>
      <Pressable
        style={({ pressed }) => [
          styles.unitsOption,
          selectedUnits === 'metric' && styles.unitsOptionSelected,
          isDark && styles.unitsOptionDark,
          pressed && styles.unitsOptionPressed
        ]}
        onPress={() => onUnitsChange('metric')}
      >
        <Text style={[
          styles.unitsOptionText,
          selectedUnits === 'metric' && styles.unitsOptionTextSelected,
          isDark && styles.unitsOptionTextDark
        ]}>
          Units
        </Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [
          styles.unitsOption,
          selectedUnits === 'imperial' && styles.unitsOptionSelected,
          isDark && styles.unitsOptionDark,
          pressed && styles.unitsOptionPressed
        ]}
        onPress={() => onUnitsChange('imperial')}
      >
        <Text style={[
          styles.unitsOptionText,
          selectedUnits === 'imperial' && styles.unitsOptionTextSelected,
          isDark && styles.unitsOptionTextDark
        ]}>
          Imperial
        </Text>
      </Pressable>
    </View>
  );
};

type DoNotDisturbItemProps = {
  title: string;
  subtitle: string;
  enabled: boolean;
  onPress: () => void;
  isDark: boolean;
};

const DoNotDisturbItem: React.FC<DoNotDisturbItemProps> = ({ title, subtitle, enabled: _enabled, onPress, isDark }) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingItem,
        isDark && styles.settingItemDark,
        pressed && styles.settingItemPressed
      ]}
      onPress={onPress}
    >
      <View style={styles.settingContent}>
        <View style={[styles.settingIcon, isDark && styles.settingIconDark]}>
          <Ionicons name="moon-outline" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, isDark && styles.settingTitleDark]}>
            {title}
          </Text>
          <Text style={[styles.settingSubtitle, isDark && styles.settingSubtitleDark]}>
            {subtitle}
          </Text>
        </View>
        <Ionicons 
          name="chevron-forward" 
          size={16} 
          color={isDark ? '#666666' : '#CCCCCC'} 
        />
      </View>
    </Pressable>
  );
};

type HealthIntegrationItemProps = {
  title: string;
  connected: boolean;
  onPress: () => void;
  isDark: boolean;
};

const HealthIntegrationItem: React.FC<HealthIntegrationItemProps> = ({ title, connected, onPress, isDark }) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingItem,
        isDark && styles.settingItemDark,
        pressed && styles.settingItemPressed
      ]}
      onPress={onPress}
    >
      <View style={styles.settingContent}>
        <View style={[styles.settingIcon, isDark && styles.settingIconDark]}>
          <Ionicons name="fitness-outline" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, isDark && styles.settingTitleDark]}>
            {title}
          </Text>
        </View>
        <View style={[
          styles.statusBadge, 
          connected ? styles.statusBadgeConnected : styles.statusBadgeDisconnected
        ]}>
          <Text style={[
            styles.statusBadgeText,
            connected ? styles.statusBadgeTextConnected : styles.statusBadgeTextDisconnected
          ]}>
            {connected ? 'Connected' : 'Not Connected'}
          </Text>
        </View>
        <Ionicons 
          name="chevron-forward" 
          size={16} 
          color={isDark ? '#666666' : '#CCCCCC'} 
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    padding: 4,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    marginTop: 16,
  },
  sectionTitleDark: {
    color: '#FFFFFF',
  },
  settingItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 8,
  },
  settingItemDark: {
    backgroundColor: '#1A1A1A',
  },
  settingItemPressed: {
    opacity: 0.7,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E9ECEF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingIconDark: {
    backgroundColor: '#333333',
  },
  destructiveIcon: {
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  settingTitleDark: {
    color: '#FFFFFF',
  },
  destructiveText: {
    color: '#FF453A',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  settingSubtitleDark: {
    color: '#AAAAAA',
  },
  infoValue: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  infoValueDark: {
    color: '#AAAAAA',
  },
  footer: {
    padding: 20,
    marginBottom: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  footerTextDark: {
    color: '#AAAAAA',
  },
  // Units Selector Styles
  unitsSelector: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 4,
  },
  unitsSelectorDark: {
    backgroundColor: '#1A1A1A',
  },
  unitsOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  unitsOptionDark: {
    // No additional dark styling needed - handled by selection state
  },
  unitsOptionSelected: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unitsOptionPressed: {
    opacity: 0.7,
  },
  unitsOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  unitsOptionTextDark: {
    color: '#AAAAAA',
  },
  unitsOptionTextSelected: {
    color: '#000000',
  },
  // Status Badge Styles
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  statusBadgeConnected: {
    backgroundColor: '#34C759',
  },
  statusBadgeDisconnected: {
    backgroundColor: '#FF453A',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadgeTextConnected: {
    color: '#FFFFFF',
  },
  statusBadgeTextDisconnected: {
    color: '#FFFFFF',
  },
});