/**
 * Home: headline, large search bar, category buttons, history list, persistent HOME.
 * Minimalist, high contrast, a11y per .cursorrules.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LargeSearchBar } from '../components/LargeSearchBar';
import { loadAllGuides, loadGuide } from '../services/storage';
import { Guide } from '../types/guide';
import { useAppStore } from '../store/useAppStore';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useTheme } from '../hooks/useTheme';

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
  const theme = useTheme();
  const { goToGuide } = useAppNavigation();
  const viewedGuideIds = useAppStore((s) => s.viewedGuides);
  const [search, setSearch] = useState('');
  const [guides, setGuides] = useState<Guide[]>([]);
  const [historyGuides, setHistoryGuides] = useState<Guide[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadGuides = useCallback(async () => {
    const list = await loadAllGuides();
    setGuides(list);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) loadGuides();
  }, [loaded, loadGuides]);

  // Load history guides
  useEffect(() => {
    if (viewedGuideIds.length === 0) {
      setHistoryGuides([]);
      return;
    }
    Promise.all(viewedGuideIds.map((id) => loadGuide(id))).then((list) =>
      setHistoryGuides(list.filter((g): g is Guide => g != null))
    );
  }, [viewedGuideIds]);

  const filtered = search.trim()
    ? guides.filter(
      (g) =>
        g.title.toLowerCase().includes(search.toLowerCase()) ||
        g.category?.toLowerCase().includes(search.toLowerCase())
    )
    : [];

  const openGuide = (guide: Guide) => goToGuide(guide.id);

  const filterByCategory = (category: string) => {
    const list = guides.filter(
      (g) => g.category?.toLowerCase() === category.toLowerCase()
    );
    if (list.length === 1) openGuide(list[0]);
    else setSearch(category);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      padding: 24,
      paddingBottom: 48,
    },
    headline: {
      fontSize: 26,
      fontWeight: '700',
      color: theme.textPrimary,
      marginBottom: 20,
    },
    searchRow: {
      marginBottom: 28,
    },
    categoriesTitle: {
      fontSize: MIN_FONT_SIZE,
      fontWeight: '600',
      color: theme.textSecondary,
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
      backgroundColor: theme.primaryLight,
      borderRadius: 8,
      justifyContent: 'center',
    },
    categoryText: {
      fontSize: MIN_FONT_SIZE,
      fontWeight: '600',
      color: theme.primary,
    },
    pressed: {
      opacity: 0.85,
    },
    historySection: {
      marginTop: 12,
    },
    historyTitle: {
      fontSize: MIN_FONT_SIZE,
      fontWeight: '600',
      color: theme.textSecondary,
      marginBottom: 12,
    },
    results: {
      gap: 8,
    },
    guideRow: {
      minHeight: MIN_TOUCH_DP,
      paddingVertical: 14,
      paddingHorizontal: 16,
      backgroundColor: theme.surface,
      borderRadius: 8,
      justifyContent: 'center',
    },
    guideTitle: {
      fontSize: MIN_FONT_SIZE,
      color: theme.textPrimary,
    },
    emptyHistory: {
      fontSize: MIN_FONT_SIZE,
      color: theme.textTertiary,
      fontStyle: 'italic',
    },
  });

  return (
    <ScreenWrapper padding={10}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        accessibilityLabel="Home screen"
      >

        <Text style={styles.headline} allowFontScaling>
          {t('home.headline')}
        </Text>

        <View style={styles.searchRow}>
          <LargeSearchBar
            value={search}
            onChangeText={setSearch}
            onSubmit={() => { }}
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

        {/* Show search results if searching */}
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

        {/* Show history when not searching */}
        {!search.trim() && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle} allowFontScaling>
              {t('home.history')}
            </Text>
            {historyGuides.length === 0 ? (
              <Text style={styles.emptyHistory} allowFontScaling>
                {t('home.noHistory')}
              </Text>
            ) : (
              <View style={styles.results}>
                {historyGuides.map((g) => (
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
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
