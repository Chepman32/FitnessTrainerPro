import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Pressable,
  useColorScheme,
  Linking,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BackButton } from '../components/BackButton';

type AboutScreenProps = {
  onBack?: () => void;
};

export const AboutScreen: React.FC<AboutScreenProps> = ({ onBack }) => {
  const isDark = useColorScheme() === 'dark';

  const handleOpenLink = (url: string) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open this link');
      }
    });
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'For support and feedback, please visit our GitHub repository or contact us through the app store.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={onBack || (() => {})} />
        <Text style={[styles.title, isDark && styles.titleDark]}>About</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* App Logo and Info */}
        <View style={styles.logoSection}>
          <View style={[styles.logoContainer, isDark && styles.logoContainerDark]}>
            <Text style={styles.logoText}>💪</Text>
          </View>
          <Text style={[styles.appName, isDark && styles.appNameDark]}>
            FitnessTrainerPro
          </Text>
          <Text style={[styles.appVersion, isDark && styles.appVersionDark]}>
            Version 1.0.0
          </Text>
          <Text style={[styles.appDescription, isDark && styles.appDescriptionDark]}>
            Your offline-first fitness companion for timed workouts and training sessions.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Features
          </Text>
          
          <FeatureItem
            icon="wifi-off"
            title="100% Offline"
            description="Works without internet connection"
            isDark={isDark}
          />
          
          <FeatureItem
            icon="shield-checkmark"
            title="Privacy First"
            description="No data collection or tracking"
            isDark={isDark}
          />
          
          <FeatureItem
            icon="timer"
            title="Precise Timing"
            description="Accurate workout timers and intervals"
            isDark={isDark}
          />
          
          <FeatureItem
            icon="accessibility"
            title="Accessible"
            description="Designed for all fitness levels"
            isDark={isDark}
          />
        </View>

        {/* Technical Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Technical Information
          </Text>
          
          <InfoRow
            label="Framework"
            value="React Native"
            isDark={isDark}
          />
          
          <InfoRow
            label="Platform Support"
            value="iOS & Android"
            isDark={isDark}
          />
          
          <InfoRow
            label="Minimum iOS"
            value="13.0+"
            isDark={isDark}
          />
          
          <InfoRow
            label="Minimum Android"
            value="7.0 (API 24)"
            isDark={isDark}
          />
          
          <InfoRow
            label="Storage"
            value="Local only"
            isDark={isDark}
          />
        </View>

        {/* Links */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Links & Support
          </Text>
          
          <LinkItem
            icon="logo-github"
            title="Source Code"
            subtitle="View on GitHub"
            onPress={() => handleOpenLink('https://github.com')}
            isDark={isDark}
          />
          
          <LinkItem
            icon="mail"
            title="Contact Support"
            subtitle="Get help and report issues"
            onPress={handleContactSupport}
            isDark={isDark}
          />
          
          <LinkItem
            icon="star"
            title="Rate the App"
            subtitle="Leave a review on the app store"
            onPress={handleContactSupport}
            isDark={isDark}
          />
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Legal
          </Text>
          
          <Text style={[styles.legalText, isDark && styles.legalTextDark]}>
            This app is provided as-is for fitness and educational purposes. 
            Always consult with a healthcare professional before starting any fitness program.
          </Text>
          
          <Text style={[styles.copyright, isDark && styles.copyrightDark]}>
            © 2024 FitnessTrainerPro. All rights reserved.
          </Text>
        </View>

        {/* Footer spacer */}
        <View style={styles.footerSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper Components
type FeatureItemProps = {
  icon: string;
  title: string;
  description: string;
  isDark: boolean;
};

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description, isDark }) => {
  return (
    <View style={styles.featureItem}>
      <View style={[styles.featureIcon, isDark && styles.featureIconDark]}>
        <Ionicons name={icon as any} size={24} color="#5B9BFF" />
      </View>
      <View style={styles.featureContent}>
        <Text style={[styles.featureTitle, isDark && styles.featureTitleDark]}>
          {title}
        </Text>
        <Text style={[styles.featureDescription, isDark && styles.featureDescriptionDark]}>
          {description}
        </Text>
      </View>
    </View>
  );
};

type InfoRowProps = {
  label: string;
  value: string;
  isDark: boolean;
};

const InfoRow: React.FC<InfoRowProps> = ({ label, value, isDark }) => {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, isDark && styles.infoLabelDark]}>
        {label}
      </Text>
      <Text style={[styles.infoValue, isDark && styles.infoValueDark]}>
        {value}
      </Text>
    </View>
  );
};

type LinkItemProps = {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  isDark: boolean;
};

const LinkItem: React.FC<LinkItemProps> = ({ icon, title, subtitle, onPress, isDark }) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.linkItem,
        isDark && styles.linkItemDark,
        pressed && styles.linkItemPressed
      ]}
      onPress={onPress}
    >
      <View style={styles.linkContent}>
        <View style={[styles.linkIcon, isDark && styles.linkIconDark]}>
          <Ionicons name={icon as any} size={20} color={isDark ? '#FFFFFF' : '#000000'} />
        </View>
        <View style={styles.linkTextContainer}>
          <Text style={[styles.linkTitle, isDark && styles.linkTitleDark]}>
            {title}
          </Text>
          <Text style={[styles.linkSubtitle, isDark && styles.linkSubtitleDark]}>
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
  logoSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoContainerDark: {
    backgroundColor: '#1A1A1A',
  },
  logoText: {
    fontSize: 40,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  appNameDark: {
    color: '#FFFFFF',
  },
  appVersion: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 12,
  },
  appVersionDark: {
    color: '#AAAAAA',
  },
  appDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  appDescriptionDark: {
    color: '#AAAAAA',
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
  },
  sectionTitleDark: {
    color: '#FFFFFF',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(91, 155, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureIconDark: {
    backgroundColor: 'rgba(91, 155, 255, 0.2)',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  featureTitleDark: {
    color: '#FFFFFF',
  },
  featureDescription: {
    fontSize: 14,
    color: '#666666',
  },
  featureDescriptionDark: {
    color: '#AAAAAA',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E9ECEF',
  },
  infoLabel: {
    fontSize: 16,
    color: '#000000',
  },
  infoLabelDark: {
    color: '#FFFFFF',
  },
  infoValue: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  infoValueDark: {
    color: '#AAAAAA',
  },
  linkItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 8,
  },
  linkItemDark: {
    backgroundColor: '#1A1A1A',
  },
  linkItemPressed: {
    opacity: 0.7,
  },
  linkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  linkIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E9ECEF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  linkIconDark: {
    backgroundColor: '#333333',
  },
  linkTextContainer: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  linkTitleDark: {
    color: '#FFFFFF',
  },
  linkSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  linkSubtitleDark: {
    color: '#AAAAAA',
  },
  legalText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 16,
  },
  legalTextDark: {
    color: '#AAAAAA',
  },
  copyright: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
  },
  copyrightDark: {
    color: '#666666',
  },
  footerSpacer: {
    height: 32,
  },
});