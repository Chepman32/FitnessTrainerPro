import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useColorScheme,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  AccessibilityUtils,
  useAccessibility,
} from '../../utils/accessibility';
import { Content } from '../../types/library';

// Mock content for testing
const mockContent: Content[] = [
  {
    id: 'test-program',
    type: 'program',
    title: 'Beginner Full Body Program',
    premium: false,
    tags: ['beginner', 'full-body'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  } as Content,
  {
    id: 'test-workout',
    type: 'workout',
    title: '10-Minute Morning Boost',
    premium: true,
    tags: ['quick', 'morning'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  } as Content,
];

export const AccessibilityTester: React.FC = () => {
  const isDark = useColorScheme() === 'dark';
  const {
    isScreenReaderEnabled,
    isReduceMotionEnabled,
    announceForAccessibility,
  } = useAccessibility();
  const [testResults, setTestResults] = useState<
    Array<{ test: string; passed: boolean; message: string }>
  >([]);

  useEffect(() => {
    runAccessibilityTests();
  }, []);

  const runAccessibilityTests = () => {
    const results: Array<{ test: string; passed: boolean; message: string }> =
      [];

    // Test 1: Content card labels
    try {
      const programLabel = AccessibilityUtils.getContentCardLabel(
        mockContent[0],
      );
      const workoutLabel = AccessibilityUtils.getContentCardLabel(
        mockContent[1],
      );

      results.push({
        test: 'Content Card Labels',
        passed: programLabel.length > 0 && workoutLabel.length > 0,
        message: `Program: "${programLabel}", Workout: "${workoutLabel}"`,
      });
    } catch (error) {
      results.push({
        test: 'Content Card Labels',
        passed: false,
        message: `Error: ${error}`,
      });
    }

    // Test 2: Content card hints
    try {
      const programHint = AccessibilityUtils.getContentCardHint(mockContent[0]);
      const workoutHint = AccessibilityUtils.getContentCardHint(mockContent[1]);

      results.push({
        test: 'Content Card Hints',
        passed: programHint.length > 0 && workoutHint.length > 0,
        message: `Program: "${programHint}", Workout: "${workoutHint}"`,
      });
    } catch (error) {
      results.push({
        test: 'Content Card Hints',
        passed: false,
        message: `Error: ${error}`,
      });
    }

    // Test 3: Filter chip labels
    try {
      const activeLabel = AccessibilityUtils.getFilterChipLabel(
        'Goal',
        'Fat Loss',
        true,
      );
      const inactiveLabel = AccessibilityUtils.getFilterChipLabel(
        'Level',
        'Beginner',
        false,
      );

      results.push({
        test: 'Filter Chip Labels',
        passed:
          activeLabel.includes('selected') &&
          inactiveLabel.includes('not selected'),
        message: `Active: "${activeLabel}", Inactive: "${inactiveLabel}"`,
      });
    } catch (error) {
      results.push({
        test: 'Filter Chip Labels',
        passed: false,
        message: `Error: ${error}`,
      });
    }

    // Test 4: Search results labels
    try {
      const noResultsLabel = AccessibilityUtils.getSearchResultsLabel(
        'test query',
        0,
      );
      const multipleResultsLabel = AccessibilityUtils.getSearchResultsLabel(
        'test query',
        5,
      );

      results.push({
        test: 'Search Results Labels',
        passed:
          noResultsLabel.includes('No results') &&
          multipleResultsLabel.includes('5 results'),
        message: `No results: "${noResultsLabel}", Multiple: "${multipleResultsLabel}"`,
      });
    } catch (error) {
      results.push({
        test: 'Search Results Labels',
        passed: false,
        message: `Error: ${error}`,
      });
    }

    // Test 5: Progress labels
    try {
      const notStartedLabel = AccessibilityUtils.getProgressLabel(0, 'program');
      const inProgressLabel = AccessibilityUtils.getProgressLabel(
        50,
        'workout',
      );
      const completedLabel = AccessibilityUtils.getProgressLabel(
        100,
        'challenge',
      );

      results.push({
        test: 'Progress Labels',
        passed:
          notStartedLabel.includes('not started') &&
          inProgressLabel.includes('50%') &&
          completedLabel.includes('completed'),
        message: `Not started: "${notStartedLabel}", In progress: "${inProgressLabel}", Completed: "${completedLabel}"`,
      });
    } catch (error) {
      results.push({
        test: 'Progress Labels',
        passed: false,
        message: `Error: ${error}`,
      });
    }

    // Test 6: Duration formatting
    try {
      const shortDuration = AccessibilityUtils.formatDurationForScreenReader(5);
      const longDuration = AccessibilityUtils.formatDurationForScreenReader(90);

      results.push({
        test: 'Duration Formatting',
        passed:
          shortDuration.includes('5 minutes') &&
          longDuration.includes('1 hour'),
        message: `Short: "${shortDuration}", Long: "${longDuration}"`,
      });
    } catch (error) {
      results.push({
        test: 'Duration Formatting',
        passed: false,
        message: `Error: ${error}`,
      });
    }

    // Test 7: Number formatting
    try {
      const smallNumber = AccessibilityUtils.formatNumberForScreenReader(500);
      const largeNumber =
        AccessibilityUtils.formatNumberForScreenReader(1500000);

      results.push({
        test: 'Number Formatting',
        passed: smallNumber === '500' && largeNumber.includes('million'),
        message: `Small: "${smallNumber}", Large: "${largeNumber}"`,
      });
    } catch (error) {
      results.push({
        test: 'Number Formatting',
        passed: false,
        message: `Error: ${error}`,
      });
    }

    setTestResults(results);
  };

  const testAnnouncement = () => {
    announceForAccessibility('This is a test announcement for accessibility');
    Alert.alert('Test', 'Announcement sent to screen reader');
  };

  const testContentAnnouncement = () => {
    AccessibilityUtils.announceSearchResults('test query', 3);
    Alert.alert('Test', 'Search results announcement sent');
  };

  const testFilterAnnouncement = () => {
    AccessibilityUtils.announceFilterChange('Goal', 'Fat Loss', true);
    Alert.alert('Test', 'Filter change announcement sent');
  };

  const passedTests = testResults.filter(result => result.passed).length;
  const totalTests = testResults.length;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#000' : '#FFF' }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#FFF' : '#000' }]}>
          Accessibility Testing
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#AAA' : '#666' }]}>
          Tests passed: {passedTests}/{totalTests}
        </Text>
      </View>

      {/* Accessibility Status */}
      <View style={styles.section}>
        <Text
          style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#000' }]}
        >
          Accessibility Status
        </Text>

        <View style={styles.statusItem}>
          <Text
            style={[styles.statusLabel, { color: isDark ? '#FFF' : '#000' }]}
          >
            Screen Reader Enabled
          </Text>
          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor: isScreenReaderEnabled ? '#4ADE80' : '#EF4444',
              },
            ]}
          >
            <Text style={styles.statusText}>
              {isScreenReaderEnabled ? 'YES' : 'NO'}
            </Text>
          </View>
        </View>

        <View style={styles.statusItem}>
          <Text
            style={[styles.statusLabel, { color: isDark ? '#FFF' : '#000' }]}
          >
            Reduce Motion Enabled
          </Text>
          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor: isReduceMotionEnabled ? '#4ADE80' : '#EF4444',
              },
            ]}
          >
            <Text style={styles.statusText}>
              {isReduceMotionEnabled ? 'YES' : 'NO'}
            </Text>
          </View>
        </View>
      </View>

      {/* Test Results */}
      <View style={styles.section}>
        <Text
          style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#000' }]}
        >
          Test Results
        </Text>

        {testResults.map((result, index) => (
          <View
            key={index}
            style={[
              styles.testResult,
              { backgroundColor: isDark ? '#1A1A1A' : '#F9FAFB' },
            ]}
          >
            <View style={styles.testHeader}>
              <Text
                style={[styles.testName, { color: isDark ? '#FFF' : '#000' }]}
              >
                {result.test}
              </Text>
              <Ionicons
                name={result.passed ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={result.passed ? '#4ADE80' : '#EF4444'}
              />
            </View>
            <Text
              style={[styles.testMessage, { color: isDark ? '#AAA' : '#666' }]}
            >
              {result.message}
            </Text>
          </View>
        ))}
      </View>

      {/* Manual Tests */}
      <View style={styles.section}>
        <Text
          style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#000' }]}
        >
          Manual Tests
        </Text>

        <Pressable
          style={[styles.testButton, { backgroundColor: '#5B9BFF' }]}
          onPress={testAnnouncement}
          accessibilityRole="button"
          accessibilityLabel="Test general announcement"
        >
          <Text style={styles.testButtonText}>Test Announcement</Text>
        </Pressable>

        <Pressable
          style={[styles.testButton, { backgroundColor: '#8B5CF6' }]}
          onPress={testContentAnnouncement}
          accessibilityRole="button"
          accessibilityLabel="Test search results announcement"
        >
          <Text style={styles.testButtonText}>Test Search Announcement</Text>
        </Pressable>

        <Pressable
          style={[styles.testButton, { backgroundColor: '#F59E0B' }]}
          onPress={testFilterAnnouncement}
          accessibilityRole="button"
          accessibilityLabel="Test filter change announcement"
        >
          <Text style={styles.testButtonText}>Test Filter Announcement</Text>
        </Pressable>

        <Pressable
          style={[styles.testButton, { backgroundColor: '#10B981' }]}
          onPress={runAccessibilityTests}
          accessibilityRole="button"
          accessibilityLabel="Re-run all accessibility tests"
        >
          <Text style={styles.testButtonText}>Re-run Tests</Text>
        </Pressable>
      </View>

      {/* Guidelines */}
      <View style={styles.section}>
        <Text
          style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#000' }]}
        >
          Accessibility Guidelines
        </Text>

        <View style={styles.guideline}>
          <Text
            style={[styles.guidelineTitle, { color: isDark ? '#FFF' : '#000' }]}
          >
            Touch Targets
          </Text>
          <Text
            style={[styles.guidelineText, { color: isDark ? '#AAA' : '#666' }]}
          >
            All interactive elements should be at least 44x44 points
          </Text>
        </View>

        <View style={styles.guideline}>
          <Text
            style={[styles.guidelineTitle, { color: isDark ? '#FFF' : '#000' }]}
          >
            Color Contrast
          </Text>
          <Text
            style={[styles.guidelineText, { color: isDark ? '#AAA' : '#666' }]}
          >
            Text should have a contrast ratio of at least 4.5:1 (WCAG AA)
          </Text>
        </View>

        <View style={styles.guideline}>
          <Text
            style={[styles.guidelineTitle, { color: isDark ? '#FFF' : '#000' }]}
          >
            Screen Reader Labels
          </Text>
          <Text
            style={[styles.guidelineText, { color: isDark ? '#AAA' : '#666' }]}
          >
            All interactive elements should have descriptive accessibility
            labels
          </Text>
        </View>

        <View style={styles.guideline}>
          <Text
            style={[styles.guidelineTitle, { color: isDark ? '#FFF' : '#000' }]}
          >
            Focus Management
          </Text>
          <Text
            style={[styles.guidelineText, { color: isDark ? '#AAA' : '#666' }]}
          >
            Focus should move logically through the interface
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  testResult: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
  },
  testMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  testButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  guideline: {
    marginBottom: 16,
  },
  guidelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  guidelineText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
