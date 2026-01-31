/**
 * Guide viewing: swipeable steps, large text, TTS per step, progress, Done.
 * Persistent HOME button. WCAG AA+, large touch targets.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Image,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { useTranslation } from 'react-i18next';
import { HomeButton } from '../components/HomeButton';
import { loadGuide } from '../services/storage';
import { Guide, GuideStep } from '../types/guide';
import { useAppStore } from '../store/useAppStore';
import { useAppNavigation } from '../hooks/useAppNavigation';
import type { GuideDetailRouteProp } from '../navigation/types';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { ASSET_MAP } from '../services/seedImport';

const MIN_FONT_SIZE = 18;
const MIN_TOUCH_DP = 48;

export function GuideDetailScreen() {
  const { params } = useRoute<GuideDetailRouteProp>();
  const { resetToHome } = useAppNavigation();
  const { t } = useTranslation();
  const guideId = params?.guideId;
  const [guide, setGuide] = useState<Guide | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const language = useAppStore((s) => s.language);
  const ttsAutoPlay = useAppStore((s) => s.ttsAutoPlay);
  const addFavorite = useAppStore((s) => s.addFavorite);
  const removeFavorite = useAppStore((s) => s.removeFavorite);
  const favorites = useAppStore((s) => s.favorites);
  const incrementGuidesViewedToday = useAppStore((s) => s.incrementGuidesViewedToday);

  
  useEffect(() => {
    if (!guideId) return;
    loadGuide(guideId).then(setGuide);
  }, [guideId]);
  
  useEffect(() => {
    if (!guideId) return;
    incrementGuidesViewedToday();
  }, [guideId, incrementGuidesViewedToday]);
  
  const scrollRef = useRef<ScrollView>(null);
  useEffect(() => {
    // Whenever the step index changes, scroll to the top immediately
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [currentStepIndex]); // This dependency ensures it runs on every step change

  const speakStep = useCallback(
    (step: GuideStep) => {
      if (speaking) {
        Speech.stop();
        setSpeaking(false);
        return;
      }
      const text = step.tts || step.text;
      const lang = guide?.language === 'es' ? 'es' : 'en';
      Speech.speak(text, {
        language: lang,
        onDone: () => setSpeaking(false),
        onStopped: () => setSpeaking(false),
      });
      setSpeaking(true);
    },
    [speaking, guide?.language]
  );

  useEffect(() => {
    if (!guide?.steps?.length || !ttsAutoPlay) return;
    const step = guide.steps[currentStepIndex];
    if (step) speakStep(step);
    return () => {
      Speech.stop();
    };
  }, [currentStepIndex, ttsAutoPlay, guide?.id, guide?.steps?.length]);

  if (!guide) {
    return (
      <ScreenWrapper padding={10}>
        <View style={styles.container}>
          <HomeButton />
          <Text style={styles.loading}>Loading…</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const steps = guide.steps ?? [];
  const currentStep = steps[currentStepIndex];
  const progress = steps.length ? (currentStepIndex + 1) / steps.length : 0;
  const isFavorite = favorites.includes(guide.id);

  return (
    <ScreenWrapper padding={10}>
      <View style={styles.container}>

        <Text style={styles.title} allowFontScaling>
          {guide.title}
        </Text>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>

        <Text style={styles.stepLabel} allowFontScaling>
          {t('guide.step', { number: currentStepIndex + 1 })} of {steps.length}
        </Text>

        {currentStep && (
  <ScrollView
    ref={scrollRef}
    style={styles.stepScroll}
    contentContainerStyle={styles.stepContent}
    accessibilityLabel={`Step ${currentStepIndex + 1} of ${steps.length}`}
  >

    <Text style={styles.stepText} allowFontScaling>
      {currentStep.text}
    </Text>

    <Pressable
      onPress={() => speakStep(currentStep)}
      style={({ pressed }) => [styles.ttsButton, pressed && styles.pressed]}
      accessibilityLabel={speaking ? t('guide.pauseTts') : t('guide.playTts')}
      accessibilityRole="button"
      accessibilityHint="Hear this step read aloud"
      >
      <Text style={styles.ttsLabel}>{speaking ? '⏸' : '▶'} Read aloud</Text>
    </Pressable>
    {/* 1. The Image & HUD Section */}
    {currentStep.image && (
      <View style={styles.imageContainer}>
        <Image 
          // Change from {{ uri: currentStep.image }} to this:
          source={ASSET_MAP[currentStep.image]}
          style={styles.stepImage}
          resizeMode="contain"
        />
      </View>
    )}
  </ScrollView>
)}

        {/* <Text>v.{guide.version}</Text> */}
        <View style={styles.navRow}>
          <Pressable
            onPress={() => setCurrentStepIndex((i) => Math.max(0, i - 1))}
            disabled={currentStepIndex === 0}
            style={({ pressed }) => [
              styles.navButton,
              currentStepIndex === 0 && styles.navDisabled,
              pressed && styles.pressed,
            ]}
            accessibilityLabel={t('guide.previous')}
            accessibilityRole="button"
            accessibilityState={{ disabled: currentStepIndex === 0 }}
          >
            <Text style={styles.navText} allowFontScaling>
              {t('guide.previous')}
            </Text>
          </Pressable>
          {currentStepIndex < steps.length - 1 ? (
            <Pressable
              onPress={() => setCurrentStepIndex((i) => i + 1)}
              style={({ pressed }) => [styles.navButton, styles.next, pressed && styles.pressed]}
              accessibilityLabel={t('guide.next')}
              accessibilityRole="button"
            >
              <Text style={styles.navText} allowFontScaling>
                {t('guide.next')}
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={resetToHome}
              style={({ pressed }) => [styles.navButton, styles.done, pressed && styles.pressed]}
              accessibilityLabel={t('guide.done')}
              accessibilityRole="button"
              accessibilityHint="Finish and return to home"
            >
              <Text style={styles.navText} allowFontScaling>
                {t('guide.done')}
              </Text>
            </Pressable>
          )}
        </View>

        <Pressable
          onPress={() => (isFavorite ? removeFavorite(guide.id) : addFavorite(guide.id))}
          style={({ pressed }) => [styles.favButton, pressed && styles.pressed]}
          accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          accessibilityRole="button"
        >
          <Text style={styles.favText}>{isFavorite ? '❤️' : '🤍'} Favorites</Text>
        </Pressable>
        <HomeButton />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f9f7',
    padding: 24,
  },
  homeRow: {
    marginBottom: 16,
  },
  loading: {
    fontSize: MIN_FONT_SIZE,
    color: '#666',
    marginTop: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ddd',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2d7a5e',
  },
  stepLabel: {
    fontSize: MIN_FONT_SIZE,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  stepScroll: {
    flex: 1,
  },
  stepContent: {
    paddingBottom: 24,
  },
  stepText: {
    fontSize: 20,
    lineHeight: 30,
    color: '#111',
    marginBottom: 20,
  },
  imageContainer: {
    width: '100%',
    // maxWidth: 600, // Optional: prevents screenshots from becoming massive on web
    alignSelf: 'center', // Centers the guide on larger tablet/web screens
    backgroundColor: 'transparent',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  stepImage: {
    width: '100%',
    height: undefined, 
    aspectRatio: 1, 
  },
  ttsButton: {
    minHeight: MIN_TOUCH_DP,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#e8f4f0',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  ttsLabel: {
    fontSize: MIN_FONT_SIZE,
    fontWeight: '600',
    color: '#2d7a5e',
  },
  pressed: {
    opacity: 0.85,
  },
  navRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  navButton: {
    minHeight: MIN_TOUCH_DP,
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: '#ddd',
    borderRadius: 8,
    justifyContent: 'center',
  },
  next: {
    backgroundColor: '#2d7a5e',
  },
  done: {
    backgroundColor: '#2d7a5e',
  },
  navDisabled: {
    opacity: 0.5,
  },
  navText: {
    fontSize: MIN_FONT_SIZE,
    fontWeight: '600',
    color: '#111',
  },
  favButton: {
    minHeight: MIN_TOUCH_DP,
    marginTop: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  favText: {
    fontSize: MIN_FONT_SIZE,
    color: '#2d7a5e',
  },
});
