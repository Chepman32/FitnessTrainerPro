import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Pressable,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../state/ThemeContext';
import { useWorkoutHistory } from '../state/WorkoutHistoryContext';

type ProfileScreenProps = {
  onNavigateToFavorites?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToAbout?: () => void;
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onNavigateToFavorites,
  onNavigateToSettings,
  onNavigateToAbout,
}) => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const { stats } = useWorkoutHistory();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.titleDark]}>Profile</Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            Manage your preferences and settings
          </Text>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Account
          </Text>
          
          <View style={[styles.profileCard, isDark && styles.profileCardDark]}>
            <View style={styles.profileInfo}>
              <View style={[styles.avatar, isDark && styles.avatarDark]}>
                <Text style={styles.avatarText}>👤</Text>
              </View>
              <View style={styles.profileDetails}>
                <Text style={[styles.profileName, isDark && styles.profileNameDark]}>
                  Fitness Enthusiast
                </Text>
                <Text style={[styles.profileEmail, isDark && styles.profileEmailDark]}>
                  Stay strong and healthy
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Quick Actions
          </Text>
          
          <MenuItem
            icon="heart-outline"
            title="Favorites"
            subtitle="Your saved articles and workouts"
            onPress={onNavigateToFavorites}
            isDark={isDark}
          />
          
          <MenuItem
            icon="settings-outline"
            title="Settings"
            subtitle="App preferences and configuration"
            onPress={onNavigateToSettings}
            isDark={isDark}
          />
          
          <MenuItem
            icon="information-circle-outline"
            title="About"
            subtitle="App version and information"
            onPress={onNavigateToAbout}
            isDark={isDark}
          />
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Your Progress
          </Text>
          
          <View style={styles.statsGrid}>
            <StatCard
              title="Workouts"
              value={String(stats.workoutsThisMonth)}
              subtitle="This month"
              icon="fitness-outline"
              isDark={isDark}
            />
            <StatCard
              title="Minutes"
              value={stats.totalMinutes.toLocaleString()}
              subtitle="Total active"
              icon="time-outline"
              isDark={isDark}
            />
            <StatCard
              title="Calories"
              value={stats.totalCalories.toLocaleString()}
              subtitle="Burned"
              icon="flame-outline"
              isDark={isDark}
            />
            <StatCard
              title="Streak"
              value={String(stats.streakDays)}
              subtitle="Days"
              icon="calendar-outline"
              isDark={isDark}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper Components
type MenuItemProps = {
  icon: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  isDark: boolean;
};

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, subtitle, onPress, isDark }) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        isDark && styles.menuItemDark,
        pressed && styles.menuItemPressed
      ]}
      onPress={onPress}
    >
      <View style={styles.menuItemContent}>
        <View style={[styles.menuIcon, isDark && styles.menuIconDark]}>
          <Ionicons name={icon as any} size={24} color={isDark ? '#FFFFFF' : '#000000'} />
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={[styles.menuTitle, isDark && styles.menuTitleDark]}>
            {title}
          </Text>
          <Text style={[styles.menuSubtitle, isDark && styles.menuSubtitleDark]}>
            {subtitle}
          </Text>
        </View>
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={isDark ? '#666666' : '#CCCCCC'} 
        />
      </View>
    </Pressable>
  );
};

type StatCardProps = {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  isDark: boolean;
};

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, isDark }) => {
  return (
    <View style={[styles.statCard, isDark && styles.statCardDark]}>
      <Ionicons 
        name={icon as any} 
        size={24} 
        color={isDark ? '#5B9BFF' : '#5B9BFF'} 
        style={styles.statIcon}
      />
      <Text style={[styles.statValue, isDark && styles.statValueDark]}>
        {value}
      </Text>
      <Text style={[styles.statTitle, isDark && styles.statTitleDark]}>
        {title}
      </Text>
      <Text style={[styles.statSubtitle, isDark && styles.statSubtitleDark]}>
        {subtitle}
      </Text>
    </View>
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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  titleDark: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  subtitleDark: {
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
  profileCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
  },
  profileCardDark: {
    backgroundColor: '#1A1A1A',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E9ECEF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarDark: {
    backgroundColor: '#333333',
  },
  avatarText: {
    fontSize: 28,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  profileNameDark: {
    color: '#FFFFFF',
  },
  profileEmail: {
    fontSize: 14,
    color: '#666666',
  },
  profileEmailDark: {
    color: '#AAAAAA',
  },
  menuItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemDark: {
    backgroundColor: '#1A1A1A',
  },
  menuItemPressed: {
    opacity: 0.7,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E9ECEF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuIconDark: {
    backgroundColor: '#333333',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  menuTitleDark: {
    color: '#FFFFFF',
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  menuSubtitleDark: {
    color: '#AAAAAA',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statCardDark: {
    backgroundColor: '#1A1A1A',
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  statValueDark: {
    color: '#FFFFFF',
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  statTitleDark: {
    color: '#FFFFFF',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#666666',
  },
  statSubtitleDark: {
    color: '#AAAAAA',
  },
});