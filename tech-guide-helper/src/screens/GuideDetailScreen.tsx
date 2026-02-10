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
import { useTheme } from '../hooks/useTheme';
import { api } from '../services/api';

const MIN_FONT_SIZE = 18;
const MIN_TOUCH_DP = 48;

export function GuideDetailScreen() {
  const { params } = useRoute<GuideDetailRouteProp>();
  const { resetToHome } = useAppNavigation();
  const { t } = useTranslation();
  const theme = useTheme();
  const guideId = params?.guideId;
  const [guide, setGuide] = useState<Guide | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const language = useAppStore((s) => s.language);
  const ttsAutoPlay = useAppStore((s) => s.ttsAutoPlay);
  const addFavorite = useAppStore((s) => s.addFavorite);
  const removeFavorite = useAppStore((s) => s.removeFavorite);
  const favoriteIds = useAppStore((s) => s.favorites);
  const favoriteGuides = useAppStore((s) => s.favoriteGuides);
  const idToken = useAppStore((s) => s.idToken);
  const incrementGuidesViewedToday = useAppStore((s) => s.incrementGuidesViewedToday);
  const addViewedGuide = useAppStore((s) => s.addViewedGuide);

  // Task 2 fix: check hydrated favoriteGuides list (cloud + local orphans)
  // Matches by ID or baseId (to handle cloud vs local search variants)
  const isFav = favoriteGuides.some(g => g.id === guideId || g.baseId === guideId);

  console.log('[GuideDetail] Status Check:', {
    guideId,
    isFav,
    totalFavoriteGuides: favoriteGuides.length,
    inSyncIds: favoriteIds.includes(guideId || ''),
  });

  const toggleFavorite = () => {
    if (!guideId) return;
    console.log('[GuideDetail] Toggling favorite', { guideId, currentIsFav: isFav });
    if (isFav) {
      removeFavorite(guideId);
    } else {
      addFavorite(guideId);
    }
  };

  const myGuides = useAppStore((s) => s.myGuides);

  useEffect(() => {
    if (!guideId) return;

    const findGuide = async () => {
      // 1. Check local store (user-created guides in memory)
      const inStore = myGuides.find(g => g.id === guideId);
      if (inStore) {
        setGuide(inStore);
        return;
      }

      // 2. Check filesystem (seed guides / offline cache)
      const local = await loadGuide(guideId);
      if (local) {
        setGuide(local);
        return;
      }

      // 3. Fallback to API (cloud search results or shared guides)
      try {
        const cloud = await api.getGuide(guideId, { lang: language });
        if (cloud) setGuide(cloud);
      } catch (e) {
        console.error('[GuideDetail] Failed to load guide from any source', e);
      }
    };

    findGuide();
  }, [guideId, myGuides, language]);

  useEffect(() => {
    if (!guideId) return;
    incrementGuidesViewedToday();
    addViewedGuide(guideId);
  }, [guideId, incrementGuidesViewedToday, addViewedGuide]);

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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 24,
    },
    homeRow: {
      marginBottom: 16,
    },
    loading: {
      fontSize: MIN_FONT_SIZE,
      color: theme.textTertiary,
      marginTop: 24,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.textPrimary,
      marginBottom: 12,
    },
    progressBar: {
      height: 8,
      backgroundColor: theme.progressBar,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 16,
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.progressFill,
    },
    stepLabel: {
      fontSize: MIN_FONT_SIZE,
      fontWeight: '600',
      color: theme.textSecondary,
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
      color: theme.textPrimary,
      marginBottom: 20,
    },
    imageContainer: {
      width: '100%',
      alignSelf: 'center',
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
      backgroundColor: theme.primaryLight,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    ttsLabel: {
      fontSize: MIN_FONT_SIZE,
      fontWeight: '600',
      color: theme.primary,
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
      backgroundColor: theme.disabled,
      borderRadius: 8,
      justifyContent: 'center',
    },
    next: {
      backgroundColor: theme.primary,
    },
    done: {
      backgroundColor: theme.primary,
    },
    navDisabled: {
      opacity: 0.5,
    },
    navText: {
      fontSize: MIN_FONT_SIZE,
      fontWeight: '600',
      color: theme.textPrimary,
    },
    favButton: {
      minHeight: MIN_TOUCH_DP,
      marginTop: 16,
      paddingVertical: 14,
      alignItems: 'center',
    },
    favText: {
      fontSize: MIN_FONT_SIZE,
      color: theme.primary,
    },
  });

  if (!guide) {
    return (
      <ScreenWrapper padding={10}>
        <View style={styles.container}>
          <HomeButton />
          <Text style={styles.loading}>{t('guide.loading')}</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const steps = guide.steps ?? [];
  const currentStep = steps[currentStepIndex];
  const progress = steps.length ? (currentStepIndex + 1) / steps.length : 0;
  const isFavorite = isFav;

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
              <Text style={styles.ttsLabel}>{speaking ? '⏸' : '▶'} {t('guide.readAloud')}</Text>
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
          accessibilityLabel={isFavorite ? t('guide.removeFromFavorites') : t('guide.addToFavorites')}
          accessibilityRole="button"
        >
          <Text style={styles.favText}>{isFavorite ? '❤️' : '🤍'} {t('guide.favorites')}</Text>
        </Pressable>
        <HomeButton />
      </View>
    </ScreenWrapper>
  );
}
