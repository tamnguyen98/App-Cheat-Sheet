/**
 * Landing: Google-like search with suggestive chips (Connect to Zoom, Screenshot on iPhone, etc.).
 * User can open a guide from suggestions or go to Browse (Home) via bottom nav or link.
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
import { HomeButton } from '../components/HomeButton';
import { loadAllGuides } from '../services/storage';
import { Guide } from '../types/guide';
import { useAppNavigation } from '../hooks/useAppNavigation';

const MIN_FONT_SIZE = 18;
const MIN_TOUCH_DP = 48;

/** Top inquiry suggestions (keys match guide IDs or search terms). */
const SUGGESTION_IDS = [
  'zoom-join-android',
  'zoom-join-ios',
  'phone-basics-calls-android',
  'photos-save-android',
] as const;

export function SearchScreen() {
  const { t } = useTranslation();
  const { goToGuide, goToHome } = useAppNavigation();
  const [query, setQuery] = useState('');
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadGuides = useCallback(async () => {
    const list = await loadAllGuides();
    setGuides(list);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) loadGuides();
  }, [loaded, loadGuides]);

  const suggestions = loaded
    ? SUGGESTION_IDS.map((id) => guides.find((g) => g.id === id)).filter(
        (g): g is Guide => g != null
      )
    : [];

  const filtered =
    query.trim() === ''
      ? []
      : guides.filter(
          (g) =>
            g.title.toLowerCase().includes(query.toLowerCase()) ||
            g.category?.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      accessibilityLabel={t('search.landingLabel')}
    >
      <View style={styles.homeRow}>
        <HomeButton
          accessibilityLabel={t('search.browseAll')}
          accessibilityHint={t('search.browseAllHint')}
        />
      </View>

      <Text style={styles.title} allowFontScaling>
        {t('search.title')}
      </Text>

      <View style={styles.searchRow}>
        <LargeSearchBar
          value={query}
          onChangeText={setQuery}
          onSubmit={() => {
            if (filtered.length === 1) goToGuide(filtered[0].id);
          }}
          placeholder={t('search.placeholder')}
          accessibilityLabel={t('search.placeholder')}
          accessibilityHint={t('search.searchHint')}
        />
      </View>

      <Text style={styles.suggestionsTitle} allowFontScaling>
        {t('search.topInquiries')}
      </Text>
      <View style={styles.suggestions}>
        {suggestions.map((g) => (
          <Pressable
            key={g.id}
            onPress={() => goToGuide(g.id)}
            style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
            accessibilityLabel={g.title}
            accessibilityRole="button"
            accessibilityHint={t('search.openGuideHint')}
          >
            <Text style={styles.chipText} allowFontScaling>
              {g.title}
            </Text>
          </Pressable>
        ))}
      </View>

      {filtered.length > 0 && (
        <View style={styles.results}>
          <Text style={styles.resultsTitle} allowFontScaling>
            {t('search.results')}
          </Text>
          {filtered.slice(0, 10).map((g) => (
            <Pressable
              key={g.id}
              onPress={() => goToGuide(g.id)}
              style={({ pressed }) => [styles.resultRow, pressed && styles.pressed]}
              accessibilityLabel={g.title}
              accessibilityRole="button"
              accessibilityHint={t('search.openGuideHint')}
            >
              <Text style={styles.resultText} allowFontScaling>
                {g.title}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <Pressable
        onPress={goToHome}
        style={({ pressed }) => [styles.browseButton, pressed && styles.pressed]}
        accessibilityLabel={t('search.browseAll')}
        accessibilityRole="button"
        accessibilityHint={t('search.browseAllHint')}
      >
        <Text style={styles.browseText} allowFontScaling>
          {t('search.browseAll')}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f9f7' },
  content: { padding: 24, paddingBottom: 48 },
  homeRow: { marginBottom: 20 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
    marginBottom: 24,
    textAlign: 'center',
  },
  searchRow: { marginBottom: 28 },
  suggestionsTitle: {
    fontSize: MIN_FONT_SIZE,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  chip: {
    minHeight: MIN_TOUCH_DP,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#e8f4f0',
    borderRadius: 24,
    justifyContent: 'center',
  },
  chipText: { fontSize: MIN_FONT_SIZE, fontWeight: '600', color: '#2d7a5e' },
  pressed: { opacity: 0.85 },
  results: { marginTop: 16, gap: 8 },
  resultsTitle: {
    fontSize: MIN_FONT_SIZE,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  resultRow: {
    minHeight: MIN_TOUCH_DP,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
  },
  resultText: { fontSize: MIN_FONT_SIZE, color: '#111' },
  browseButton: {
    minHeight: MIN_TOUCH_DP,
    marginTop: 24,
    paddingVertical: 14,
    backgroundColor: '#2d7a5e',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  browseText: { fontSize: MIN_FONT_SIZE, fontWeight: '700', color: '#fff' },
});
