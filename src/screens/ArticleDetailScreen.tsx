import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  Pressable,
  useColorScheme,
} from 'react-native';
import { Article } from '../types/library';

type ArticleDetailScreenProps = {
  article: Article;
  onBack?: () => void;
};

export const ArticleDetailScreen: React.FC<ArticleDetailScreenProps> = ({
  article,
  onBack,
}) => {
  const isDark = useColorScheme() === 'dark';

  const getArticleContent = (article: Article) => {
    // This would normally come from a content management system
    // For now, providing detailed content based on article titles
    switch (article.title) {
      case 'Progressive Overload Basics':
        return {
          summary: 'Progressive overload is the systematic increase of training stress so your body has a reason to adapt. Do it with precision, not guesswork.',
          sections: [
            {
              title: 'What "overload" means',
              content: '• Stimulus → Recovery → Adaptation loop.\n• If stimulus doesn\'t gradually rise, performance plateaus. If it rises too fast, recovery fails.',
            },
            {
              title: 'The four reliable levers',
              content: '1. Load — add weight to the same rep target.\n2. Volume — add sets or reps at the same load.\n3. Density — do the same work with less rest (or more work in the same time).\n4. Range of motion / difficulty — deeper squats, slower eccentrics, more challenging variations.\n\nUse one lever at a time for 1–3 weeks; hold others steady.',
            },
            {
              title: 'A simple 4-week template (example: squat 3×/wk)',
              content: '• Wk1 (Base): 4×5 @ RPE 7, 2 min rest.\n• Wk2 (Volume): 5×5 @ same load/RPE, 2 min rest.\n• Wk3 (Load): 5×5, +2.5–5 kg, RPE 7–8, 2–3 min rest.\n• Wk4 (Deload): 3×5 @ −15–20% load, RPE ≤6.',
            },
            {
              title: 'Auto-regulation (RPE/RIR)',
              content: '• Keep main sets near RPE 7–8 (≈2–3 reps in reserve).\n• If session RPE creeps >8.5, hold or reduce the lever next time.',
            },
            {
              title: 'Common mistakes',
              content: '• Chasing all levers at once.\n• Ignoring sleep and nutrition while adding stress.\n• Changing exercises too often to track progress.\n• Skipping deloads after 3–6 weeks of building.',
            },
            {
              title: 'Tracking checklist',
              content: '• Log: load, sets×reps, rest, RPE.\n• Weekly note: soreness, sleep hours, appetite, motivation.\n• Progress = trend across 4–8 weeks, not one workout.\n\nTL;DR: Pick one lever, progress it gradually, deload on schedule, and track.',
            },
          ],
        };

      case 'Protein Timing Guide':
        return {
          summary: 'Daily intake matters most, but distributing protein across the day improves muscle protein synthesis (MPS).',
          sections: [
            {
              title: 'Daily target',
              content: '• Most active adults: 1.6–2.2 g/kg/day of body weight.\n• In a deficit or heavy training: steer to the upper end.',
            },
            {
              title: 'Per-meal dose & frequency',
              content: '• 0.3–0.4 g/kg per meal, 3–5 times/day (e.g., 20–40 g for many).\n• Aim for ~25–35 g complete protein per feeding for a robust MPS response.\n• Include leucine-rich sources (dairy, eggs, meat, soy, mixed plant combos).',
            },
            {
              title: 'Training window',
              content: '• Pre or post is fine; the key is one solid feeding within ~3 hours around training.\n• If fasted training, plan a protein meal soon after.',
            },
            {
              title: 'Sample day (70 kg person, target ≈130 g/day)',
              content: '• Breakfast: 30 g (eggs + yogurt).\n• Lunch: 35 g (chicken + rice + veg).\n• Post-workout: 25 g (shake or tofu bowl).\n• Dinner: 35 g (salmon + potatoes).\n• Optional snack to fill gaps.',
            },
            {
              title: 'Plant-forward notes',
              content: '• Combine legumes + grains; use soy/pea blends; don\'t fear a modest supplement if needed.\n• Focus on total protein and variety.',
            },
            {
              title: 'Common roadblocks & fixes',
              content: '• Inadequate breakfast → prep Greek yogurt cups or tofu scramble.\n• Travel → shelf-stable milk, jerky/tempeh, ready shakes.\n• Appetite → distribute smaller, more frequent meals.',
            },
          ],
        };

      case 'Sleep for Performance':
        return {
          summary: 'Sleep consolidates skills, restores hormones, and lowers injury risk. Most adults perform best at 7–9 hours.',
          sections: [
            {
              title: 'Why lifters and runners should care',
              content: '• Growth and repair processes peak in the night.\n• Poor sleep → higher RPE, worse pacing, reduced power output.',
            },
            {
              title: 'Build a simple pre-bed routine (20–30 min)',
              content: '• Screens to Night Shift/low brightness; cut blue-heavy light.\n• Light stretch or breathwork (4-7-8 or 5 min box breathing).\n• Cool, dark, quiet room; 17–19 °C works well for many.',
            },
            {
              title: 'Caffeine/alcohol timing',
              content: '• Caffeine: stop 8–10 h before bedtime.\n• Alcohol fragments sleep—avoid as a "sedative".',
            },
            {
              title: 'Naps',
              content: '• 10–20 min "power naps" early afternoon.\n• Avoid long late naps that blunt sleep pressure.',
            },
            {
              title: 'Travel & shift tips',
              content: '• Anchor a consistent wake time.\n• Bright light after wake; dim light 2 h pre-bed.\n• For jet lag: shift meals and light 1–2 days ahead when possible.',
            },
            {
              title: 'What to track (without obsessing)',
              content: '• Bedtime/waketime, time outside, training RPE.\n• HRV and wearables are signals, not verdicts—go by how you feel + performance trends.',
            },
          ],
        };

      default:
        return {
          summary: article.excerpt || 'Comprehensive guide to improving your fitness knowledge.',
          sections: [
            {
              title: 'Article Content',
              content: 'This article content would be loaded from your content management system. The current implementation shows example content for the core articles.',
            },
          ],
        };
    }
  };

  const articleContent = getArticleContent(article);

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, isDark && styles.backButtonTextDark]}>
            ← Back
          </Text>
        </Pressable>
        <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]} numberOfLines={1}>
          Article
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <ImageBackground
          source={{ uri: article.coverUrl }}
          style={styles.heroImage}
          imageStyle={styles.heroImageStyle}
        >
          <View style={styles.heroOverlay}>
            <View style={styles.heroContent}>
              <Text style={styles.heroCategory}>{article.topic}</Text>
              <Text style={styles.heroTitle}>{article.title}</Text>
              <View style={styles.heroMeta}>
                <Text style={styles.heroReadTime}>{article.readTimeMinutes} min read</Text>
                <Text style={styles.heroAuthor}>By {article.author}</Text>
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* Content */}
        <View style={[styles.content, isDark && styles.contentDark]}>
          {/* Summary */}
          <Text style={[styles.summary, isDark && styles.summaryDark]}>
            {articleContent.summary}
          </Text>

          {/* Sections */}
          {articleContent.sections.map((section, index) => (
            <View key={index} style={styles.section}>
              <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                {section.title}
              </Text>
              <Text style={[styles.sectionContent, isDark && styles.sectionContentDark]}>
                {section.content}
              </Text>
            </View>
          ))}

          {/* Tags */}
          <View style={styles.tagsContainer}>
            <Text style={[styles.tagsLabel, isDark && styles.tagsLabelDark]}>
              Tags:
            </Text>
            <View style={styles.tags}>
              {article.tags.map((tag, index) => (
                <View key={index} style={[styles.tag, isDark && styles.tagDark]}>
                  <Text style={[styles.tagText, isDark && styles.tagTextDark]}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerDark: {
    backgroundColor: '#000000',
    borderBottomColor: '#333333',
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  backButtonTextDark: {
    color: '#0A84FF',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  headerTitleDark: {
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  heroImage: {
    height: 300,
    width: '100%',
  },
  heroImageStyle: {
    resizeMode: 'cover',
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  heroContent: {
    padding: 24,
  },
  heroCategory: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    opacity: 0.9,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '700',
    lineHeight: 34,
    marginBottom: 12,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroReadTime: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginRight: 16,
  },
  heroAuthor: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  content: {
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  contentDark: {
    backgroundColor: '#000000',
  },
  summary: {
    fontSize: 18,
    color: '#333333',
    lineHeight: 26,
    fontWeight: '500',
    marginBottom: 32,
  },
  summaryDark: {
    color: '#E5E5E5',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#000000',
    fontWeight: '700',
    marginBottom: 12,
    lineHeight: 26,
  },
  sectionTitleDark: {
    color: '#FFFFFF',
  },
  sectionContent: {
    fontSize: 16,
    color: '#555555',
    lineHeight: 24,
  },
  sectionContentDark: {
    color: '#CCCCCC',
  },
  tagsContainer: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  tagsLabel: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '600',
    marginBottom: 12,
  },
  tagsLabelDark: {
    color: '#AAAAAA',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
  },
  tagDark: {
    backgroundColor: '#333333',
  },
  tagText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  tagTextDark: {
    color: '#CCCCCC',
  },
});
