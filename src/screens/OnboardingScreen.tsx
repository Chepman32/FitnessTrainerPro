import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Equipment, Location, Level, Goal } from '../types/library';
import { useOnboarding } from '../state/OnboardingContext';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import ProgressRing from '../components/ProgressRing';



const EQUIPMENT_LABEL: Record<Equipment, string> = {
  none: 'No equipment',
  dumbbells: 'Dumbbells',
  bands: 'Bands',
  kettlebell: 'Kettlebell',
  barbell: 'Barbell',
  machines: 'Machines',
};

const LOCATION_LABEL: Record<Location, string> = {
  home: 'Home',
  gym: 'Gym',
  outdoor: 'Outdoor',
  office: 'Office',
};

const LEVELS: Level[] = ['Beginner', 'Intermediate', 'Advanced'];

const TOTAL_STEPS = 9;

const Pill: React.FC<{ selected?: boolean; onPress?: () => void; icon?: string } & React.PropsWithChildren> = ({ selected, onPress, icon, children }) => (
  <Pressable onPress={onPress} style={[styles.pill, selected && styles.pillSelected]}> 
    {!!icon && <Ionicons name={icon as any} size={18} color={selected ? '#0A1224' : '#83C5FF'} style={{ marginRight: 8 }} />} 
    <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{children}</Text>
  </Pressable>
);

const SectionTitle: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Text style={styles.sectionTitle}>{children}</Text>
);

const FeatureCard: React.FC<{ icon?: string; title: string; subtitle: string; imageUrl?: string; onPress?: () => void; selected?: boolean }> = ({ icon, title, subtitle, imageUrl, onPress, selected }) => (
  <Pressable onPress={onPress} style={[styles.card, selected && { borderColor: '#83C5FF', borderWidth: 2 }]}> 
    {imageUrl ? (
      <Image source={{ uri: imageUrl }} style={styles.cardImage} />
    ) : (
      <View style={styles.cardIconWrap}><Ionicons name={(icon || 'sparkles') as any} size={28} color="#0A1224" /></View>
    )}
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardSubtitle}>{subtitle}</Text>
  </Pressable>
);

const NextButton: React.FC<{ onPress: () => void; label?: string; disabled?: boolean }>=({ onPress, label = 'Next', disabled }) => (
  <Pressable onPress={onPress} style={[styles.nextBtn, disabled && { opacity: 0.6 }]} disabled={disabled}>
    <Text style={styles.nextBtnText}>{label}</Text>
    <Ionicons name="arrow-forward" size={20} color="#0A1224" />
  </Pressable>
);

const BackButton: React.FC<{ onPress: () => void }>=({ onPress }) => (
  <Pressable onPress={onPress} style={styles.backBtn}>
    <Ionicons name="arrow-back" size={20} color="#83C5FF" />
    <Text style={styles.backBtnText}>Back</Text>
  </Pressable>
);

const BottomProgress: React.FC<{ step: number }>=({ step }) => {
  const progress = useSharedValue((step + 1) / TOTAL_STEPS);
  useEffect(() => {
    progress.value = withTiming((step + 1) / TOTAL_STEPS, { duration: 300, easing: Easing.out(Easing.cubic) });
  }, [step, progress]);
  const animatedStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));
  return (
    <View style={styles.bottomProgressWrap}>
      <View style={styles.bottomProgressBarBg}>
        <Animated.View style={[styles.bottomProgressBarFill, animatedStyle]} />
      </View>
      <Text style={styles.bottomProgressText}>{step + 1} / {TOTAL_STEPS}</Text>
    </View>
  );
};

const SlideWrapper: React.FC<{ title: string; subtitle?: string; index: number; onSkip?: () => void } & React.PropsWithChildren> = ({ title, subtitle, index, onSkip, children }) => {
  return (
    <View style={[styles.slide]}>      
      <View style={styles.headerRow}>
        <View />
        <Pressable onPress={onSkip}><Text style={styles.skip}>Skip</Text></Pressable>
      </View>
      <Text style={styles.title}>{title}</Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      <View style={{ flex: 1 }}>{children}</View>
      <BottomProgress step={index} />
    </View>
  );
};

// Remove unused GOAL_LABEL to satisfy linter

// Simple horizontal slider using Gesture API
const AgeSlider: React.FC<{ min: number; max: number; value: number; onChange: (v:number)=>void }>=({ min, max, value, onChange }) => {
  const trackWidth = 280;
  const x = useSharedValue(((value - min) / (max - min)) * trackWidth);
  const startX = useSharedValue(0);
  useEffect(() => {
    x.value = withTiming(((value - min) / (max - min)) * trackWidth, { duration: 200 });
  }, [min, max, value, x]);
  const pan = useMemo(() => Gesture.Pan()
    .onStart(() => { startX.value = x.value; })
    .onUpdate((evt: any) => {
      const next = Math.min(trackWidth, Math.max(0, startX.value + evt.translationX));
      x.value = next;
    })
    .onEnd(() => {
      const v = Math.round(min + (x.value/trackWidth) * (max - min));
      runOnJS(onChange)(v);
    })
  , [min, max, onChange, startX, x]);
  const knobStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const fillStyle = useAnimatedStyle(() => ({ width: x.value }));
  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={styles.sliderTrack}>
        <Animated.View style={[styles.sliderFill, fillStyle]} />
        <Animated.View style={[styles.sliderKnob, knobStyle]} />
        <Text style={styles.sliderLabel}>{value} yrs</Text>
      </Animated.View>
    </GestureDetector>
  );
};

// Vertical slider for Height/Weight using Gesture API
const VerticalSlider: React.FC<{ min: number; max: number; value: number; onChange: (v:number)=>void; label: string; unit: string }>=({ min, max, value, onChange, label, unit }) => {
  const height = 180;
  const y = useSharedValue(height - ((value - min) / (max - min)) * height);
  const startY = useSharedValue(0);
  useEffect(() => {
    y.value = withTiming(height - ((value - min) / (max - min)) * height, { duration: 200 });
  }, [min, max, value, y]);
  const pan = useMemo(() => Gesture.Pan()
    .onStart(() => { startY.value = y.value; })
    .onUpdate((evt: any) => {
      const next = Math.min(height, Math.max(0, startY.value + evt.translationY));
      y.value = next;
    })
    .onEnd(() => {
      const v = Math.round(min + ((height - y.value)/height) * (max - min));
      runOnJS(onChange)(v);
    })
  , [min, max, onChange, startY, y]);
  const knobStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value - 12 }] }));
  const fillStyle = useAnimatedStyle(() => ({ height: height - y.value }));
  const currentValue = Math.round(min + ((height - (y as any).value)/height) * (max - min));
  return (
    <View style={styles.vSliderWrap}>
      <Text style={styles.vSliderTitle}>{label}</Text>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.vSliderTrack]}> 
          <Animated.View style={[styles.vSliderFill, fillStyle]} />
          <Animated.View style={[styles.vSliderKnob, knobStyle]} />
        </Animated.View>
      </GestureDetector>
      <Text style={styles.vSliderValue}>{currentValue} {unit}</Text>
    </View>
  );
};

const OnboardingScreen: React.FC = () => {
  const { profile, updateProfile, setHasOnboarded } = useOnboarding();
  const [index, _setIndex] = useState(0);
  const setIndex = (i:number) => _setIndex(Math.max(0, Math.min(TOTAL_STEPS - 1, i)));
  const { width } = useWindowDimensions();

  // Gesture + transition
  const translateX = useSharedValue(0);
  const entryDirRef = useRef<0 | -1 | 1>(0);
  const currentIndexSV = useSharedValue(index);
  useEffect(() => { currentIndexSV.value = index; }, [index, currentIndexSV]);

  const setIndexAfterAnim = useCallback((toIndex: number, enterDir: -1 | 1) => {
    entryDirRef.current = enterDir;
    setIndex(toIndex);
  }, []);
  
  const setIndexAfterSwipe = useCallback((toIndex: number, enterDir: -1 | 1) => {
    entryDirRef.current = enterDir;
    setIndex(toIndex);
  }, []);

  const animateOutAndIn = (dir: -1 | 1, toIndex: number) => {
    translateX.value = withTiming(dir * -width, { duration: 300, easing: Easing.out(Easing.cubic) }, (finished) => {
      if (finished) {
        runOnJS(setIndexAfterAnim)(toIndex, (dir * -1) as -1 | 1);
      }
    });
  };

  useEffect(() => {
    if (entryDirRef.current !== 0) {
      const from = entryDirRef.current * width;
      translateX.value = from;
      translateX.value = withTiming(0, { duration: 320, easing: Easing.out(Easing.cubic) }, () => {
        entryDirRef.current = 0 as 0;
      });
    }
  }, [index, translateX, width]);

  const onSkip = () => {
    animateOutAndIn(-1, TOTAL_STEPS - 1);
  };

  const goNext = () => {
    if (index < TOTAL_STEPS - 1) {
      animateOutAndIn(-1, index + 1);
    }
  };
  const goBack = () => {
    if (index > 0) {
      animateOutAndIn(1, index - 1);
    }
  };

  const panSlides = useMemo(() => Gesture.Pan()
    .onUpdate((evt: any) => {
      translateX.value = evt.translationX * 0.9;
    })
    .onEnd((evt: any) => {
      const threshold = width * 0.25;
      if (evt.translationX < -threshold && currentIndexSV.value < TOTAL_STEPS - 1) {
        translateX.value = withTiming(-width, { duration: 250 }, () => {
          runOnJS(setIndexAfterSwipe)(currentIndexSV.value + 1, (-1) as -1);
        });
      } else if (evt.translationX > threshold && currentIndexSV.value > 0) {
        translateX.value = withTiming(width, { duration: 250 }, () => {
          runOnJS(setIndexAfterSwipe)(currentIndexSV.value - 1, (1) as 1);
        });
      } else {
        translateX.value = withSpring(0, { damping: 14, stiffness: 140 });
      }
    })
  , [currentIndexSV, translateX, width, setIndexAfterSwipe]);

  const animatedSlideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Final slide progress animation
  const [planReady, setPlanReady] = useState(false);
  const finalProgress = useSharedValue(0);
  const orbit = useSharedValue(0);
  useEffect(() => {
    if (index === TOTAL_STEPS - 1) {
      setPlanReady(false);
      finalProgress.value = 0;
      finalProgress.value = withTiming(1, { duration: 3600, easing: Easing.inOut(Easing.cubic) }, (f) => {
        if (f) runOnJS(setPlanReady)(true);
      });
      orbit.value = 0;
      orbit.value = withRepeat(withTiming(2 * Math.PI, { duration: 4000, easing: Easing.linear }), -1, false);
    }
  }, [index, finalProgress, orbit]);

  const canFinish = useMemo(() => (profile.goals?.length ?? 0) > 0, [profile.goals]);

  // Animated orbiting icons for final slide
  const OrbitIcon: React.FC<{ radius: number; angleOffset: number; icon: string; color: string }> = ({ radius, angleOffset, icon, color }) => {
    const s = useAnimatedStyle(() => {
      const angle = orbit.value + angleOffset;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      return { transform: [{ translateX: x }, { translateY: y }] };
    });
    return (
      <Animated.View style={[styles.orbitIcon, s]}> 
        <Ionicons name={icon as any} size={18} color={color} />
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panSlides}>
        <Animated.View style={[{ flex: 1 }, animatedSlideStyle]}>
          {index === 0 && (
            <SlideWrapper index={0} onSkip={onSkip} title="Welcome to FitnessTrainerPro" subtitle="Your personal path to a better you starts here.">
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=1200&auto=format&fit=crop' }}
                  style={styles.heroImage}
                />
                <Text style={styles.lead}>Real plans. Real results. No guesswork.</Text>
              </View>
              <NextButton onPress={goNext} label="Get started" />
            </SlideWrapper>
          )}

          {index === 1 && (
            <SlideWrapper index={1} onSkip={onSkip} title="Forget the guessing" subtitle="Smart, adaptive programs that evolve with you">
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1517963628607-235ccdd5476b?q=80&w=1200&auto=format&fit=crop' }}
                  style={styles.mockImage}
                />
                <View style={styles.cardsRow}>
                  <FeatureCard icon="sparkles" title="Personalized" subtitle="Weekly plan made for you" />
                  <FeatureCard icon="stats-chart" title="Adaptive" subtitle="Adjusts to your progress" />
                </View>
              </View>
              <View style={styles.navRow}>
                <BackButton onPress={goBack} />
                <NextButton onPress={goNext} />
              </View>
            </SlideWrapper>
          )}

          {index === 2 && (
            <SlideWrapper index={2} onSkip={onSkip} title="Train anywhere, learn always" subtitle="Workouts for home and gym, articles and challenges—all in one place">
              <View style={styles.cardsRow}>
                <FeatureCard imageUrl="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop" title="Home workouts" subtitle="No equipment needed" />
                <FeatureCard imageUrl="https://images.unsplash.com/photo-1583454110551-c8e28b1f5d1a?q=80&w=1200&auto=format&fit=crop" title="Gym plans" subtitle="Strength & hypertrophy" />
                <FeatureCard imageUrl="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop" title="Articles" subtitle="Science-based tips" />
                <FeatureCard imageUrl="https://images.unsplash.com/photo-1546483875-6fc57f2e7d08?q=80&w=1200&auto=format&fit=crop" title="Challenges" subtitle="Have fun with friends" />
              </View>
              <View style={styles.navRow}>
                <BackButton onPress={goBack} />
                <NextButton onPress={goNext} label="Sounds great!" />
              </View>
            </SlideWrapper>
          )}

          {index === 3 && (
            <SlideWrapper index={3} onSkip={onSkip} title="Let's create your perfect plan" subtitle="Answer a few questions to tailor your training">
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <View style={styles.setupIconWrap}><Ionicons name="settings" size={40} color="#0A1224" /></View>
              </View>
              <View style={styles.navRow}>
                <BackButton onPress={goBack} />
                <NextButton onPress={goNext} label="Start setup" />
              </View>
            </SlideWrapper>
          )}

          {index === 4 && (
            <SlideWrapper index={4} onSkip={onSkip} title="What is your main goal?" subtitle="Pick what motivates you most">
              <View style={styles.optionList}>
                {(['fat_loss', 'muscle', 'cardio'] as Goal[]).map((goal, idx) => (
                  <Pressable
                    key={idx}
                    style={[styles.optionItem, profile.goals?.[0] === goal && styles.optionItemSelected]}
                    onPress={() => updateProfile({ goals: [goal] })}
                  >
                    <Text style={styles.optionText}>{goal === 'fat_loss' ? 'Lose weight' : goal === 'muscle' ? 'Build muscle' : 'Endurance & tone'}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.navRow}>
                <BackButton onPress={goBack} />
                <NextButton onPress={goNext} />
              </View>
            </SlideWrapper>
          )}

          {index === 5 && (
            <SlideWrapper index={5} onSkip={onSkip} title="What's your gender?" subtitle="Your basal metabolic rate will be calculated and your workout plan adapted accordingly">
              <View style={styles.optionList}>
                {[{key: 'male', label: 'Man', icon: 'male'}, {key: 'female', label: 'Woman', icon: 'female'}, {key: 'other', label: 'Non-binary', icon: 'transgender'}].map((option) => (
                  <Pressable
                    key={option.key}
                    style={[styles.optionItem, profile.gender === option.key && styles.optionItemSelected]}
                    onPress={() => updateProfile({ gender: option.key as 'male' | 'female' | 'other' })}
                  >
                    <Ionicons name={option.icon as any} size={24} color="#83C5FF" style={{ marginRight: 12 }} />
                    <Text style={styles.optionText}>{option.label}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.navRow}>
                <BackButton onPress={goBack} />
                <NextButton onPress={goNext} />
              </View>
            </SlideWrapper>
          )}

          {index === 6 && (
            <SlideWrapper index={6} onSkip={onSkip} title="Tell us a bit about you" subtitle="We use this to calibrate your plan">
              <View style={{ alignItems: 'center', marginVertical: 8 }}>
                <AgeSlider min={16} max={80} value={profile.age || 28} onChange={(v) => updateProfile({ age: v })} />
              </View>
              <View style={[styles.formRow, { marginTop: 12 }]}>
                <VerticalSlider min={140} max={210} value={profile.heightCm || 175} onChange={(v) => updateProfile({ heightCm: v })} label="Height" unit="cm" />
                <VerticalSlider min={45} max={150} value={profile.weightKg || 70} onChange={(v) => updateProfile({ weightKg: v })} label="Weight" unit="kg" />
              </View>
              <View style={styles.navRow}>
                <BackButton onPress={goBack} />
                <NextButton onPress={goNext} />
              </View>
            </SlideWrapper>
          )}

          {index === 7 && (
            <SlideWrapper index={7} onSkip={onSkip} title="How do you like to train?" subtitle="This helps us choose the right programs">
              <SectionTitle>Your level</SectionTitle>
              <View style={styles.row}>
                {LEVELS.map(l => (
                  <Pill key={l} selected={profile.level === l} onPress={() => updateProfile({ level: l })}>{l}</Pill>
                ))}
              </View>
              <SectionTitle>Where you'll train</SectionTitle>
              <View style={styles.pillsWrap}>
                {(Object.keys(LOCATION_LABEL) as Location[]).map(l => (
                  <Pill key={l} selected={profile.locations?.includes(l)} onPress={() => {
                    const set = new Set(profile.locations || []);
                    set.has(l) ? set.delete(l) : set.add(l);
                    updateProfile({ locations: Array.from(set) });
                  }}>{LOCATION_LABEL[l]}</Pill>
                ))}
              </View>
              <SectionTitle>Equipment</SectionTitle>
              <View style={styles.pillsWrap}>
                {(Object.keys(EQUIPMENT_LABEL) as Equipment[]).map(e => (
                  <Pill key={e} selected={profile.equipment?.includes(e)} onPress={() => {
                    const set = new Set(profile.equipment || []);
                    set.has(e) ? set.delete(e) : set.add(e);
                    updateProfile({ equipment: Array.from(set) });
                  }}>{EQUIPMENT_LABEL[e]}</Pill>
                ))}
              </View>
              <View style={styles.navRow}>
                <BackButton onPress={goBack} />
                <NextButton onPress={goNext} label="Almost there!" />
              </View>
            </SlideWrapper>
          )}

          {index === 7 && (
            <SlideWrapper index={7} onSkip={onSkip} title="Building your personal plan..." subtitle="Selecting programs, creating your first-week schedule, tuning recommendations">
              <View style={styles.finalWrap}>
                <View style={{ width: 180, height: 180, alignItems: 'center', justifyContent: 'center' }}>
                  <ProgressRing size={160} strokeWidth={10} progress={0} trackColor="#12203A" progressColor="#83C5FF" />
                  <Animated.View style={[styles.absoluteCenter]}>
                    <AnimatedProgress progressSV={finalProgress} />
                  </Animated.View>
                  <OrbitIcon radius={90} angleOffset={0} icon="flame" color="#FF8A65" />
                  <OrbitIcon radius={90} angleOffset={2.1} icon="barbell" color="#83C5FF" />
                  <OrbitIcon radius={90} angleOffset={4.2} icon="home" color="#34D399" />
                </View>
                <Text style={[styles.lead, { marginTop: 16 }]}>Almost done — preparing your first workout...</Text>
              </View>
              <View style={styles.navRow}>
                <BackButton onPress={goBack} />
                <NextButton onPress={() => setHasOnboarded(true)} label="Start my journey!" disabled={!planReady || !canFinish} />
              </View>
            </SlideWrapper>
          )}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

// Animated progress ring overlay using existing ProgressRing component
const AnimatedProgress: React.FC<{ progressSV: Animated.SharedValue<number> }> = ({ progressSV }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progressSV.value,
    transform: [{ scale: 0.8 + 0.2 * progressSV.value }],
  }));
  
  return (
    <Animated.View style={[{ position: 'absolute' }, animatedStyle]}>
      <ProgressRing 
        size={160} 
        strokeWidth={10} 
        progress={1} 
        trackColor="rgba(255,255,255,0.2)" 
        progressColor="#83C5FF" 
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1224', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  optionList: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  optionItem: { width: '90%', padding: 16, marginVertical: 8, borderRadius: 8, backgroundColor: '#E8F1FF', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' },
  optionItemSelected: { backgroundColor: '#83C5FF' },
  optionText: { fontSize: 16, color: '#0A1224' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  skip: { color: '#94A3B8', fontSize: 14 },
  slide: { flex: 1 },
  title: { color: 'white', fontSize: 24, fontWeight: '800', marginBottom: 6 },
  subtitle: { color: '#94A3B8', fontSize: 15, marginBottom: 16 },
  lead: { color: '#CBD5E1', fontSize: 16, textAlign: 'center' },
  cardsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12, columnGap: 12 },
  card: { width: '48%', backgroundColor: 'white', borderRadius: 16, padding: 14 },
  cardIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#83C5FF', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  cardTitle: { color: '#0A1224', fontWeight: '800', fontSize: 14, marginBottom: 4 },
  cardSubtitle: { color: '#334155', fontSize: 12 },
  cardImage: { width: '100%', height: 90, borderRadius: 12, marginBottom: 8 },
  pillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, backgroundColor: '#111827', borderColor: '#1F2937', borderWidth: 1 },
  pillSelected: { backgroundColor: '#83C5FF' },
  pillText: { color: '#83C5FF', fontWeight: '700' },
  pillTextSelected: { color: '#0A1224' },
  sectionTitle: { color: '#E2E8F0', fontWeight: '800', marginTop: 8, marginBottom: 6 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 },
  nextBtn: { flexDirection: 'row', backgroundColor: '#83C5FF', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14, alignItems: 'center' },
  nextBtnText: { color: '#0A1224', fontWeight: '800', marginRight: 8 },
  backBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 6 },
  backBtnText: { color: '#83C5FF', fontWeight: '700', marginLeft: 6 },
  formRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 8 },
  inputBlock: { flex: 1 },
  inputLabel: { color: '#94A3B8', marginBottom: 6 },
  input: { backgroundColor: '#111827', borderColor: '#1F2937', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: 'white' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bottomProgressWrap: { marginTop: 16 },
  bottomProgressBarBg: { height: 6, backgroundColor: '#12203A', borderRadius: 999, overflow: 'hidden' },
  bottomProgressBarFill: { height: 6, backgroundColor: '#83C5FF' },
  bottomProgressText: { color: '#94A3B8', fontSize: 12, marginTop: 6, textAlign: 'center' },
  heroImage: { width: '100%', height: 220, borderRadius: 16, marginBottom: 16 },
  mockImage: { width: '100%', height: 180, borderRadius: 16, marginBottom: 16 },
  setupIconWrap: { width: 84, height: 84, borderRadius: 20, backgroundColor: '#83C5FF', alignItems: 'center', justifyContent: 'center' },
  // Sliders
  sliderTrack: { width: 280, height: 40, backgroundColor: '#111827', borderRadius: 999, justifyContent: 'center', overflow: 'hidden' },
  sliderFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: '#1F3B63' },
  sliderKnob: { position: 'absolute', width: 24, height: 24, borderRadius: 12, backgroundColor: '#83C5FF', top: 8 },
  sliderLabel: { position: 'absolute', alignSelf: 'center', color: '#E2E8F0', fontSize: 12 },
  vSliderWrap: { flex: 1, alignItems: 'center' },
  vSliderTrack: { width: 56, height: 180, backgroundColor: '#111827', borderRadius: 16, overflow: 'hidden', justifyContent: 'flex-end', alignItems: 'center' },
  vSliderFill: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#1F3B63' },
  vSliderKnob: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#83C5FF' },
  vSliderTitle: { color: '#E2E8F0', marginBottom: 6, fontWeight: '700' },
  vSliderValue: { color: '#94A3B8', marginTop: 6 },
  finalWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  absoluteCenter: { position: 'absolute', top: 10, left: 10 },
  orbitIcon: { position: 'absolute' },
});

export default OnboardingScreen;