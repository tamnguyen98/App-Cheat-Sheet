/**
 * Home: headline, large search bar, category buttons, persistent HOME.
 * Minimalist, high contrast, a11y per .cursorrules.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LargeSearchBar } from '../components/LargeSearchBar';
import { HomeButton } from '../components/HomeButton';
import { loadAllGuides } from '../services/storage';
import { Guide } from '../types/guide';
import { useAppStore } from '../store/useAppStore';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { ScreenWrapper } from '../components/ScreenWrapper';

const MIN_FONT_SIZE = 18;
const MIN_TOUCH_DP = 48;

const CATEGORIES = [
  { key: 'Video Calls', i18nKey: 'home.videoCalls' },
  { key: 'Phone Basics', i18nKey: 'home.phoneBasics' },
  { key: 'Email', i18nKey: 'home.email' },
  { key: 'Photos', i18nKey: 'home.photos' },
  { key: 'Security', i18nKey: 'home.security' },
] as const;

export function HomeScreen() {
  const { t } = useTranslation();
  const { goToGuide } = useAppNavigation();
  const language = useAppStore((s) => s.language);
  const [search, setSearch] = useState('');
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadGuides = useCallback(async () => {
    const list = await loadAllGuides();
    setGuides(list);
    setLoaded(true);
  }, []);

  if (!loaded) {
    loadGuides();
  }

  const filtered = search.trim()
    ? guides.filter(
        (g) =>
          g.title.toLowerCase().includes(search.toLowerCase()) ||
          g.category?.toLowerCase().includes(search.toLowerCase())
      )
    : guides;

  const openGuide = (guide: Guide) => goToGuide(guide.id);

  const filterByCategory = (category: string) => {
    const list = guides.filter(
      (g) => g.category?.toLowerCase() === category.toLowerCase()
    );
    if (list.length === 1) openGuide(list[0]);
    else setSearch(category);
  };

  return (
    <ScreenWrapper padding={10}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        accessibilityLabel="Home screen"
      >
        {/* <View style={styles.homeButtonRow}>
          <HomeButton
            accessibilityLabel={t('home.homeButton')}
            accessibilityHint={t('home.homeHint')}
          />
        </View> */}

        <Text style={styles.headline} allowFontScaling>
          {t('home.headline')}
        </Text>

        <View style={styles.searchRow}>
          <LargeSearchBar
            value={search}
            onChangeText={setSearch}
            onSubmit={() => {}}
          />
        </View>

        <Text style={styles.categoriesTitle} allowFontScaling>
          {t('home.categories')}
        </Text>
        <View style={styles.categories}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.key}
              onPress={() => filterByCategory(cat.key)}
              style={({ pressed }) => [styles.categoryButton, pressed && styles.pressed]}
              accessibilityLabel={t(cat.i18nKey)}
              accessibilityRole="button"
              accessibilityHint={`Show guides in ${cat.key}`}
            >
              <Text style={styles.categoryText} allowFontScaling>
                {t(cat.i18nKey)}
              </Text>
            </Pressable>
          ))}
        </View>

        {filtered.length > 0 && (
          <View style={styles.results}>
            {filtered.slice(0, 20).map((g) => (
              <Pressable
                key={g.id}
                onPress={() => openGuide(g)}
                style={({ pressed }) => [styles.guideRow, pressed && styles.pressed]}
                accessibilityLabel={g.title}
                accessibilityRole="button"
                accessibilityHint="Open this guide"
              >
                <Text style={styles.guideTitle} allowFontScaling>
                  {g.title}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f9f7',
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  homeButtonRow: {
    marginBottom: 24,
  },
  headline: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111',
    marginBottom: 20,
  },
  searchRow: {
    marginBottom: 28,
  },
  categoriesTitle: {
    fontSize: MIN_FONT_SIZE,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  categoryButton: {
    minHeight: MIN_TOUCH_DP,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#e8f4f0',
    borderRadius: 8,
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: MIN_FONT_SIZE,
    fontWeight: '600',
    color: '#2d7a5e',
  },
  pressed: {
    opacity: 0.85,
  },
  results: {
    gap: 8,
  },
  guideRow: {
    minHeight: MIN_TOUCH_DP,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
  },
  guideTitle: {
    fontSize: MIN_FONT_SIZE,
    color: '#111',
  },
});
