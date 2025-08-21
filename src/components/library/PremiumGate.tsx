import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  useColorScheme,
  ScrollView,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Content } from '../../types/library';

type PremiumGateProps = {
  visible: boolean;
  content?: Content;
  trigger: 'tap_locked' | 'quota_exceeded' | 'download_offline';
  onClose: () => void;
  onUpgrade: () => void;
  onTrial?: () => void;
};

const { width: screenWidth } = Dimensions.get('window');

export const PremiumGate: React.FC<PremiumGateProps> = ({
  visible,
  content,
  trigger,
  onClose,
  onUpgrade,
  onTrial,
}) => {
  const isDark = useColorScheme() === 'dark';
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>(
    'yearly',
  );

  const getGateContent = useCallback(() => {
    switch (trigger) {
      case 'tap_locked':
        return {
          title: 'Unlock Premium Content',
          subtitle: content
            ? `"${content.title}" is available with Premium`
            : 'This content requires Premium',
          benefits: [
            'Access to all premium programs and challenges',
            'Unlimited workout downloads for offline use',
            'Advanced progress tracking and analytics',
            'Priority customer support',
          ],
        };
      case 'quota_exceeded':
        return {
          title: 'Free Limit Reached',
          subtitle: "You've reached your free workout limit for today",
          benefits: [
            'Unlimited daily workouts',
            'Access to all premium content',
            'Offline workout downloads',
            'Advanced progress tracking',
          ],
        };
      case 'download_offline':
        return {
          title: 'Offline Downloads',
          subtitle: 'Download workouts for offline access with Premium',
          benefits: [
            'Download unlimited workouts',
            'Access content without internet',
            'Premium programs and challenges',
            'Advanced features and analytics',
          ],
        };
      default:
        return {
          title: 'Upgrade to Premium',
          subtitle: 'Unlock the full potential of your fitness journey',
          benefits: [
            'Access to all premium content',
            'Unlimited workouts and programs',
            'Offline downloads',
            'Advanced tracking',
          ],
        };
    }
  }, [trigger, content]);

  const gateContent = getGateContent();

  const handleUpgrade = useCallback(() => {
    // Track premium gate interaction
    console.log('Premium upgrade initiated:', {
      trigger,
      contentId: content?.id,
      contentType: content?.type,
      selectedPlan,
    });

    onUpgrade();
  }, [trigger, content, selectedPlan, onUpgrade]);

  const handleTrial = useCallback(() => {
    if (onTrial) {
      console.log('Free trial started:', {
        trigger,
        contentId: content?.id,
        contentType: content?.type,
      });
      onTrial();
    }
  }, [trigger, content, onTrial]);

  const renderPricingPlan = (
    plan: 'monthly' | 'yearly',
    price: string,
    originalPrice?: string,
    savings?: string,
  ) => (
    <Pressable
      style={[
        styles.pricingPlan,
        {
          backgroundColor:
            selectedPlan === plan ? '#5B9BFF' : isDark ? '#2A2A2A' : '#F3F4F6',
          borderColor:
            selectedPlan === plan ? '#5B9BFF' : isDark ? '#404040' : '#E5E7EB',
        },
      ]}
      onPress={() => setSelectedPlan(plan)}
      accessibilityRole="radio"
      accessibilityState={{ checked: selectedPlan === plan }}
    >
      <View style={styles.planHeader}>
        <Text
          style={[
            styles.planTitle,
            {
              color: selectedPlan === plan ? 'white' : isDark ? '#FFF' : '#000',
            },
          ]}
        >
          {plan === 'monthly' ? 'Monthly' : 'Yearly'}
        </Text>
        {savings && (
          <View style={styles.savingsBadge}>
            <Text style={styles.savingsText}>{savings}</Text>
          </View>
        )}
      </View>

      <View style={styles.priceContainer}>
        <Text
          style={[
            styles.price,
            {
              color: selectedPlan === plan ? 'white' : isDark ? '#FFF' : '#000',
            },
          ]}
        >
          {price}
        </Text>
        {originalPrice && (
          <Text
            style={[
              styles.originalPrice,
              {
                color:
                  selectedPlan === plan
                    ? 'rgba(255,255,255,0.7)'
                    : isDark
                    ? '#666'
                    : '#999',
              },
            ]}
          >
            {originalPrice}
          </Text>
        )}
      </View>

      <Text
        style={[
          styles.planSubtitle,
          {
            color:
              selectedPlan === plan
                ? 'rgba(255,255,255,0.8)'
                : isDark
                ? '#AAA'
                : '#666',
          },
        ]}
      >
        {plan === 'monthly' ? 'per month' : 'per year'}
      </Text>
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: isDark ? '#000' : '#FFF' },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close premium gate"
          >
            <Ionicons name="close" size={24} color={isDark ? '#FFF' : '#000'} />
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Premium Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.premiumIcon}>
              <Ionicons name="diamond" size={48} color="#FFD700" />
            </View>
          </View>

          {/* Title and Subtitle */}
          <Text style={[styles.title, { color: isDark ? '#FFF' : '#000' }]}>
            {gateContent.title}
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? '#AAA' : '#666' }]}>
            {gateContent.subtitle}
          </Text>

          {/* Benefits */}
          <View style={styles.benefitsContainer}>
            {gateContent.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4ADE80" />
                <Text
                  style={[
                    styles.benefitText,
                    { color: isDark ? '#FFF' : '#000' },
                  ]}
                >
                  {benefit}
                </Text>
              </View>
            ))}
          </View>

          {/* Pricing Plans */}
          <View style={styles.pricingContainer}>
            <Text
              style={[styles.pricingTitle, { color: isDark ? '#FFF' : '#000' }]}
            >
              Choose Your Plan
            </Text>

            <View style={styles.plansContainer}>
              {renderPricingPlan('monthly', '$9.99', undefined, undefined)}
              {renderPricingPlan('yearly', '$59.99', '$119.88', 'Save 50%')}
            </View>
          </View>

          {/* Features Comparison */}
          <View style={styles.comparisonContainer}>
            <Text
              style={[
                styles.comparisonTitle,
                { color: isDark ? '#FFF' : '#000' },
              ]}
            >
              Free vs Premium
            </Text>

            <View style={styles.comparisonTable}>
              <ComparisonRow
                feature="Daily workouts"
                free="3 per day"
                premium="Unlimited"
                isDark={isDark}
              />
              <ComparisonRow
                feature="Premium programs"
                free="Limited"
                premium="Full access"
                isDark={isDark}
              />
              <ComparisonRow
                feature="Offline downloads"
                free="None"
                premium="Unlimited"
                isDark={isDark}
              />
              <ComparisonRow
                feature="Progress analytics"
                free="Basic"
                premium="Advanced"
                isDark={isDark}
              />
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {onTrial && (
            <Pressable
              style={[
                styles.trialButton,
                { backgroundColor: isDark ? '#2A2A2A' : '#F3F4F6' },
              ]}
              onPress={handleTrial}
              accessibilityRole="button"
              accessibilityLabel="Start free trial"
            >
              <Text
                style={[
                  styles.trialButtonText,
                  { color: isDark ? '#FFF' : '#000' },
                ]}
              >
                Start 7-Day Free Trial
              </Text>
            </Pressable>
          )}

          <Pressable
            style={styles.upgradeButton}
            onPress={handleUpgrade}
            accessibilityRole="button"
            accessibilityLabel="Upgrade to premium"
          >
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </Pressable>

          <Text
            style={[styles.disclaimer, { color: isDark ? '#666' : '#999' }]}
          >
            Cancel anytime. No commitment required.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const ComparisonRow: React.FC<{
  feature: string;
  free: string;
  premium: string;
  isDark: boolean;
}> = ({ feature, free, premium, isDark }) => (
  <View style={styles.comparisonRow}>
    <Text style={[styles.featureText, { color: isDark ? '#FFF' : '#000' }]}>
      {feature}
    </Text>
    <Text style={[styles.freeText, { color: isDark ? '#666' : '#999' }]}>
      {free}
    </Text>
    <Text style={[styles.premiumText, { color: '#5B9BFF' }]}>{premium}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  premiumIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  benefitsContainer: {
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  benefitText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  pricingContainer: {
    marginBottom: 32,
  },
  pricingTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  plansContainer: {
    gap: 12,
  },
  pricingPlan: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  savingsBadge: {
    backgroundColor: '#4ADE80',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
  },
  originalPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  planSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  comparisonContainer: {
    marginBottom: 32,
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  comparisonTable: {
    gap: 12,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureText: {
    flex: 2,
    fontSize: 14,
    fontWeight: '500',
  },
  freeText: {
    flex: 1,
    fontSize: 14,
    textAlign: 'center',
  },
  premiumText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
  trialButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  trialButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  upgradeButton: {
    backgroundColor: '#5B9BFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});
