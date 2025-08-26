import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import { useTheme } from '../state/ThemeContext';
import { BackButton } from '../components/BackButton';
import { ChallengeSelector, ChallengeType } from '../components/ChallengeSelector';

const { width } = Dimensions.get('window');

// Types for the challenge data

interface ChallengeData {
  id: string;
  type: ChallengeType;
  title: string;
  subtitle?: string;
  currentProgress: number;
  target: number;
  daysLeft?: number;
  metric: string;
  friends: Friend[];
  rules?: string[];
  goals?: string;
  freezePasses: number;
}

interface Friend {
  id: string;
  name: string;
  avatar?: string;
  progress: number;
  status?: string;
}

// Mock data for different challenge types
const mockChallenges: ChallengeData[] = [
  {
    id: '1',
    type: 'steps',
    title: '10K-Steps Streak',
    currentProgress: 6800,
    target: 10000,
    daysLeft: 3,
    metric: 'steps',
    friends: [
      { id: '1', name: 'Emma', progress: 9240 },
      { id: '2', name: 'Alex', progress: 8120 },
      { id: '3', name: 'Myself', progress: 6800 },
      { id: '4', name: 'Olivia', progress: 5670 },
    ],
    rules: [
      'Complete the goal 7 days in a row',
      'Missed days allowed: 1',
    ],
    goals: 'Walk 10,000 steps daily for 7 days',
    freezePasses: 1,
  },
  {
    id: '2',
    type: 'pushups',
    title: '7-Day Push-Up Ladder',
    currentProgress: 4,
    target: 7,
    metric: 'days',
    friends: [
      { id: '1', name: 'Juse', progress: 5, status: 'A Tesx' },
      { id: '2', name: 'Sarah', progress: 6, status: '6240' },
      { id: '3', name: 'Emma', progress: 6, status: '6.428' },
    ],
    freezePasses: 1,
  },
  {
    id: '3',
    type: 'burpees',
    title: 'Burpees Sprint',
    subtitle: '300 in 3 days',
    currentProgress: 150,
    target: 300,
    daysLeft: 3,
    metric: 'reps',
    friends: [
      { id: '1', name: 'Oliver', progress: 60 },
      { id: '2', name: 'Ava', progress: 220 },
      { id: '3', name: 'Luke', progress: 0 },
    ],
    freezePasses: 1,
  },
  {
    id: '4',
    type: 'plank',
    title: 'Plank Hold',
    currentProgress: 102,
    target: 300,
    metric: 'seconds',
    friends: [
      { id: '1', name: 'Emma', progress: 4 },
      { id: '2', name: 'Lucas', progress: 3 },
      { id: '3', name: 'Chloe', progress: 2 },
    ],
    freezePasses: 1,
  },
  {
    id: '5',
    type: 'squats',
    title: 'Squats Volume',
    subtitle: '1,000 this week',
    currentProgress: 750,
    target: 1000,
    metric: 'reps',
    friends: [
      { id: '1', name: 'Alex', progress: 750 },
      { id: '2', name: 'Emma', progress: 670 },
      { id: '3', name: 'Daniel', progress: 650 },
    ],
    freezePasses: 1,
  },
  {
    id: '6',
    type: 'lunges',
    title: 'Lunges Balance',
    subtitle: '300 per leg in 10 days',
    currentProgress: 115,
    target: 300,
    metric: 'reps',
    friends: [
      { id: '1', name: 'Emma', progress: 115 },
      { id: '2', name: 'Kevin', progress: 105 },
    ],
    freezePasses: 1,
  },
  {
    id: '7',
    type: 'crunches',
    title: 'Crunches Core Blast',
    currentProgress: 120,
    target: 60,
    metric: 'reps',
    friends: [
      { id: '1', name: 'Alex', progress: 60, status: 'D' },
      { id: '2', name: 'Megan', progress: 160 },
      { id: '3', name: 'Chris', progress: 140 },
    ],
    freezePasses: 1,
  },
  {
    id: '8',
    type: 'jumpingJacks',
    title: 'Jumping Jacks Minutes',
    subtitle: '60 in 7 days',
    currentProgress: 38,
    target: 60,
    metric: 'minutes',
    friends: [
      { id: '1', name: 'Emma', progress: 22 },
      { id: '2', name: 'Lucas', progress: 15 },
    ],
    freezePasses: 1,
  },
];

export const FriendsChallengeScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const [selectedTab, setSelectedTab] = useState<'overview' | 'friends'>('overview');
  const [selectedChallengeType, setSelectedChallengeType] = useState<ChallengeType>('steps');
  
  const selectedChallenge = useMemo(() => {
    return mockChallenges.find(challenge => challenge.type === selectedChallengeType) || mockChallenges[0];
  }, [selectedChallengeType]);
  
  const handleBack = () => {
    if (navigation) {
      navigation.goBack();
    } else {
      // Fallback for when navigation is not available
      console.log('Back button pressed - navigation not available');
    }
  };

  const backgroundColor = theme.colors.background;
  const statusBarStyle = isDark ? 'light-content' : 'dark-content';

  const renderProgressCircle = (progress: number, target: number, size: number = 120) => {
    const percentage = Math.min(progress / target, 1);
    const strokeWidth = size * 0.1;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference * (1 - percentage);

    return (
      <View style={[styles.progressCircle, { width: size, height: size }]}>
        <View style={styles.progressCircleInner}>
          <Text style={[styles.progressCircleText, { fontSize: size * 0.3 }]}>
            {progress.toLocaleString()}
          </Text>
          <Text style={[styles.progressCircleSubtext, { fontSize: size * 0.15 }]}>
            {progress}/{target.toLocaleString()}
          </Text>
        </View>
        <View style={styles.progressCircleOuter}>
          <View
            style={[
              styles.progressCircleFill,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: strokeWidth,
                borderColor: 'transparent',
                borderTopColor: '#4CAF50',
                borderRightColor: '#4CAF50',
                transform: [{ rotate: `${-90 + percentage * 360}deg` }],
              },
            ]}
          />
        </View>
      </View>
    );
  };

  const renderProgressBar = (progress: number, target: number, height: number = 8) => {
    const percentage = Math.min(progress / target, 1);
    
    return (
      <View style={[styles.progressBarContainer, { height }]}>
        <View style={[styles.progressBarFill, { width: `${percentage * 100}%` }]} />
      </View>
    );
  };

  const renderStepsChallenge = (challenge: ChallengeData) => (
    <View style={styles.challengeCard}>
      <View style={styles.progressSection}>
        {renderProgressCircle(challenge.currentProgress, challenge.target, 140)}
        <View style={styles.progressInfo}>
          <Text style={styles.daysLeft}>{challenge.daysLeft} days left</Text>
          <Text style={styles.rewards}>Rewards</Text>
        </View>
      </View>
      
      <Pressable style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Log steps</Text>
      </Pressable>

      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, selectedTab === 'overview' && styles.tabActive]}
          onPress={() => setSelectedTab('overview')}
        >
          <Text style={[styles.tabText, selectedTab === 'overview' && styles.tabTextActive]}>
            Overview
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, selectedTab === 'friends' && styles.tabActive]}
          onPress={() => setSelectedTab('friends')}
        >
          <Text style={[styles.tabText, selectedTab === 'friends' && styles.tabTextActive]}>
            Friends
          </Text>
        </Pressable>
      </View>

      {selectedTab === 'overview' && (
        <View style={styles.overviewContent}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Goals</Text>
              <Text style={styles.sectionSubtitle}>🏆 Streak Keeper</Text>
            </View>
            <Text style={styles.goalText}>{challenge.goals}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rules</Text>
            {challenge.rules?.map((rule, index) => (
              <Text key={index} style={styles.ruleText}>• {rule}</Text>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My progress</Text>
            <View style={styles.streakProgress}>
              {Array.from({ length: 7 }, (_, i) => (
                <View
                  key={i}
                  style={[
                    styles.streakDay,
                    i < 4 && styles.streakDayCompleted,
                  ]}
                />
              ))}
            </View>
            <Text style={styles.streakFreeze}>Streak freeze: {challenge.freezePasses}</Text>
          </View>
        </View>
      )}

      {selectedTab === 'friends' && (
        <View style={styles.friendsContent}>
          <Text style={styles.sectionTitle}>Friends progress</Text>
          {challenge.friends.map((friend) => (
            <View key={friend.id} style={styles.friendRow}>
              <View style={styles.friendAvatar}>
                <Text style={styles.friendInitial}>{friend.name[0]}</Text>
              </View>
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{friend.name}</Text>
                <Text style={styles.friendProgress}>{friend.progress.toLocaleString()} {challenge.metric}</Text>
              </View>
              <Pressable style={styles.cheerButton}>
                <Text style={styles.cheerButtonText}>Cheer</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderPushupChallenge = (challenge: ChallengeData) => (
    <View style={styles.challengeCard}>
      <Text style={styles.challengeTitle}>{challenge.title}</Text>
      
      <View style={styles.dailyTargets}>
        <View style={styles.targetRow}>
          <Text style={styles.targetDay}>Day 1</Text>
          <Text style={styles.targetProgress}>Preg: 1</Text>
        </View>
        {Array.from({ length: 6 }, (_, i) => (
          <View key={i + 2} style={styles.targetRow}>
            <Text style={styles.targetDay}>Day {i + 2}</Text>
            <Text style={styles.targetReps}>{10 * Math.pow(2, i)} reps</Text>
            <Text style={styles.targetCheckmark}>✓</Text>
          </View>
        ))}
      </View>

      <Text style={styles.freezePassText}>◆ Missed a day? Use a freeze pass</Text>

      <View style={styles.friendsLeaderboard}>
        <Text style={styles.sectionTitle}>Friends</Text>
        {challenge.friends.map((friend) => (
          <View key={friend.id} style={styles.friendRow}>
            <View style={styles.friendAvatar}>
              <Text style={styles.friendInitial}>{friend.name[0]}</Text>
            </View>
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>{friend.name}</Text>
              <Text style={styles.friendStatus}>{friend.status}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderBurpeesChallenge = (challenge: ChallengeData) => (
    <View style={styles.challengeCard}>
      <Text style={styles.challengeTitle}>{challenge.title}</Text>
      <Text style={styles.challengeSubtitle}>{challenge.subtitle}</Text>
      
      <View style={styles.todayTarget}>
        <Text style={styles.targetLabel}>Today target: 100</Text>
        {renderProgressBar(challenge.currentProgress, 100)}
        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Log reps</Text>
        </Pressable>
      </View>

      <View style={styles.pacingSection}>
        <Text style={styles.sectionTitle}>Pacing</Text>
        {renderProgressBar(challenge.currentProgress, challenge.target)}
        {challenge.friends.map((friend) => (
          <View key={friend.id} style={styles.friendRow}>
            <View style={styles.friendAvatar}>
              <Text style={styles.friendInitial}>{friend.name[0]}</Text>
            </View>
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>{friend.name}</Text>
              <Text style={styles.friendProgress}>{friend.progress} reps</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderPlankChallenge = (challenge: ChallengeData) => (
    <View style={styles.challengeCard}>
      <Text style={styles.challengeTitle}>{challenge.title}</Text>
      
      <View style={styles.timerSection}>
        <View style={styles.timerCircle}>
          <Text style={styles.timerText}>01:42</Text>
          <Text style={styles.timerSubtext}>TGR 918</Text>
        </View>
        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Start timer</Text>
        </Pressable>
      </View>

      <View style={styles.friendsProgress}>
        <View style={styles.progressHeaders}>
          <Text style={styles.progressHeader}>End progress</Text>
          <Text style={styles.progressHeader}>Ea W m</Text>
          <Text style={styles.progressHeader}>Cheer</Text>
        </View>
        {challenge.friends.map((friend) => (
          <View key={friend.id} style={styles.friendRow}>
            <View style={styles.friendAvatar}>
              <Text style={styles.friendInitial}>{friend.name[0]}</Text>
            </View>
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>{friend.name}</Text>
              <Text style={styles.friendProgress}>{friend.progress}V</Text>
            </View>
            <View style={styles.progressChecks}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          </View>
        ))}
        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Start: session</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderSquatsChallenge = (challenge: ChallengeData) => (
    <View style={styles.challengeCard}>
      <Text style={styles.challengeTitle}>{challenge.title}</Text>
      <Text style={styles.challengeSubtitle}>{challenge.subtitle}</Text>
      
      <View style={styles.volumeProgress}>
        {renderProgressBar(challenge.currentProgress, challenge.target)}
        <Text style={styles.volumeText}>{challenge.currentProgress.toLocaleString()} this week</Text>
        <Text style={styles.pacingText}>Pacing: {challenge.currentProgress},{challenge.target}</Text>
        <Text style={styles.autoTrack}>Auto-track (Health)</Text>
      </View>

      <View style={styles.friendsLeaderboard}>
        <Text style={styles.sectionTitle}>Friends</Text>
        {challenge.friends.map((friend) => (
          <View key={friend.id} style={styles.friendRow}>
            <View style={styles.friendAvatar}>
              <Text style={styles.friendInitial}>{friend.name[0]}</Text>
            </View>
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>{friend.name}</Text>
              <Text style={styles.friendProgress}>{friend.progress} reps</Text>
            </View>
            {renderProgressBar(friend.progress, challenge.target, 6)}
          </View>
        ))}
      </View>
    </View>
  );

  const renderLungesChallenge = (challenge: ChallengeData) => (
    <View style={styles.challengeCard}>
      <Text style={styles.challengeTitle}>{challenge.title}</Text>
      <Text style={styles.challengeSubtitle}>{challenge.subtitle}</Text>
      
      <View style={styles.actionButtons}>
        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>START TIMER</Text>
        </Pressable>
        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>LOG REPS</Text>
        </Pressable>
      </View>

      <View style={styles.friendsLeaderboard}>
        <Text style={styles.sectionTitle}>Friends</Text>
        {challenge.friends.map((friend) => (
          <View key={friend.id} style={styles.friendRow}>
            <View style={styles.friendAvatar}>
              <Text style={styles.friendInitial}>{friend.name[0]}</Text>
            </View>
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>{friend.name}</Text>
              <Text style={styles.friendProgress}>{friend.progress} reps</Text>
            </View>
            {renderProgressBar(friend.progress, challenge.target, 6)}
          </View>
        ))}
      </View>

      <View style={styles.dailyProgress}>
        <Text style={styles.sectionTitle}>Daily Progress</Text>
        <View style={styles.progressGrid}>
          <View style={styles.gridRow}>
            {Array.from({ length: 7 }, (_, i) => (
              <Text key={i + 1} style={styles.gridDay}>{i + 1}</Text>
            ))}
            <Text style={styles.gridBonus}>B</Text>
          </View>
          <View style={styles.gridRow}>
            <Text style={styles.gridCheck}>✓</Text>
            {Array.from({ length: 6 }, (_, i) => (
              <Text key={i + 1} style={styles.gridValue}>{[1, 2, 5, 3, 5, 6][i]}</Text>
            ))}
            <Text style={styles.gridValue}>10</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderCrunchesChallenge = (challenge: ChallengeData) => (
    <View style={styles.challengeCard}>
      <Text style={styles.challengeTitle}>{challenge.title}</Text>
      
      <View style={styles.progressSection}>
        {renderProgressCircle(challenge.currentProgress, challenge.target, 120)}
        <View style={styles.progressInfo}>
          <Text style={styles.todayTarget}>Today's Target</Text>
          <Text style={styles.targetReps}>{challenge.target} reps</Text>
        </View>
      </View>
      
      <Pressable style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>LOG REPS</Text>
      </Pressable>

      <View style={styles.friendsTable}>
        <Text style={styles.sectionTitle}>Friends</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Progress</Text>
          <Text style={styles.tableHeaderText}>Status</Text>
          <Text style={styles.tableHeaderText}>Score</Text>
        </View>
        {challenge.friends.map((friend) => (
          <View key={friend.id} style={styles.tableRow}>
            <Text style={styles.tableCell}>{friend.progress}</Text>
            <Text style={styles.tableCell}>{friend.status || '-'}</Text>
            <Text style={styles.tableCell}>{friend.status === 'D' ? 'A' : '-'}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderJumpingJacksChallenge = (challenge: ChallengeData) => (
    <View style={styles.challengeCard}>
      <Text style={styles.challengeTitle}>{challenge.title}</Text>
      <Text style={styles.challengeSubtitle}>{challenge.subtitle}</Text>
      
      <View style={styles.remainingSection}>
        <Text style={styles.remainingText}>Remaining</Text>
        <View style={styles.daysHeader}>
          <Text style={styles.dayHeader}>T</Text>
          <Text style={styles.dayHeader}>M</Text>
          <Text style={styles.dayHeader}>T</Text>
          <Text style={styles.dayHeader}>W</Text>
          <Text style={styles.dayHeader}>T</Text>
        </View>
        <Text style={styles.remainingTime}>{challenge.target - challenge.currentProgress} min</Text>
        
        <View style={styles.progressGrid}>
          <View style={styles.gridRow}>
            {Array.from({ length: 5 }, (_, i) => (
              <View key={i} style={styles.gridBox}>
                {i < 2 && <Text style={styles.gridCheck}>✓</Text>}
              </View>
            ))}
          </View>
        </View>
        
        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Start timer</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderChallengeContent = (challenge: ChallengeData) => {
    switch (challenge.type) {
      case 'steps':
        return renderStepsChallenge(challenge);
      case 'pushups':
        return renderPushupChallenge(challenge);
      case 'burpees':
        return renderBurpeesChallenge(challenge);
      case 'plank':
        return renderPlankChallenge(challenge);
      case 'squats':
        return renderSquatsChallenge(challenge);
      case 'lunges':
        return renderLungesChallenge(challenge);
      case 'crunches':
        return renderCrunchesChallenge(challenge);
      case 'jumpingJacks':
        return renderJumpingJacksChallenge(challenge);
      default:
        return renderStepsChallenge(challenge);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColor} />
      
      <View style={styles.header}>
        <BackButton onPress={handleBack} />
        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          {selectedChallenge.title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ChallengeSelector
          selectedChallenge={selectedChallengeType}
          onSelectChallenge={setSelectedChallengeType}
        />
        
        {renderChallengeContent(selectedChallenge)}
        
        <View style={styles.freezePassSection}>
          <Text style={styles.freezePassTitle}>Freeze Pass</Text>
          <Text style={styles.freezePassText}>
            {selectedChallenge.freezePasses} pass{selectedChallenge.freezePasses !== 1 ? 'es' : ''} available for this challenge
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  challengeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  challengeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  challengeSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 16,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressCircle: {
    position: 'relative',
    marginRight: 20,
  },
  progressCircleInner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  progressCircleText: {
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
  },
  progressCircleSubtext: {
    color: '#666666',
    textAlign: 'center',
    marginTop: 4,
  },
  progressCircleOuter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  progressCircleFill: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  progressInfo: {
    flex: 1,
  },
  daysLeft: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  rewards: {
    fontSize: 14,
    color: '#999999',
  },
  todayTarget: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  targetReps: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  secondaryButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    color: '#999999',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  overviewContent: {
    gap: 20,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  goalText: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
  },
  ruleText: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
  },
  streakProgress: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  streakDay: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  streakDayCompleted: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  streakFreeze: {
    fontSize: 14,
    color: '#999999',
  },
  friendsContent: {
    gap: 16,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  friendInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2,
  },
  friendProgress: {
    fontSize: 14,
    color: '#666666',
  },
  friendStatus: {
    fontSize: 14,
    color: '#666666',
  },
  cheerButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  cheerButtonText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  dailyTargets: {
    gap: 12,
    marginBottom: 16,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  targetDay: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  targetProgress: {
    fontSize: 16,
    color: '#666666',
  },
  targetReps: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  targetCheckmark: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  freezePassText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  friendsLeaderboard: {
    gap: 16,
  },
  todayTarget: {
    gap: 12,
    marginBottom: 20,
  },
  targetLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  pacingSection: {
    gap: 16,
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  timerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  timerSubtext: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  friendsProgress: {
    gap: 16,
  },
  progressHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  progressHeader: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  progressChecks: {
    flexDirection: 'row',
    gap: 8,
  },
  checkmark: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  volumeProgress: {
    gap: 12,
    marginBottom: 20,
  },
  volumeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  pacingText: {
    fontSize: 16,
    color: '#666666',
  },
  autoTrack: {
    fontSize: 14,
    color: '#999999',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  dailyProgress: {
    gap: 16,
  },
  progressGrid: {
    gap: 8,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridDay: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  gridBonus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFD700',
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  gridCheck: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  gridValue: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  gridBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  remainingSection: {
    gap: 16,
    marginBottom: 20,
  },
  remainingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  daysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  dayHeader: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  remainingTime: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
  },
  friendsTable: {
    gap: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
  },
  progressBarContainer: {
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    backgroundColor: '#4CAF50',
    height: '100%',
    borderRadius: 4,
  },
  freezePassSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  freezePassTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
});
