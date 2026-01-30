/**
 * Favorites: list of favorited guides.
 */

import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { HomeButton } from '../components/HomeButton';
import { useAppStore } from '../store/useAppStore';
import { loadGuide } from '../services/storage';
import { Guide } from '../types/guide';
import { useState, useEffect } from 'react';
import { useAppNavigation } from '../hooks/useAppNavigation';

const MIN_FONT_SIZE = 18;
const MIN_TOUCH_DP = 48;

export function FavoritesScreen() {
  const { t } = useTranslation();
  const { goToGuide } = useAppNavigation();
  const favoriteIds = useAppStore((s) => s.favorites);
  const [guides, setGuides] = useState<Guide[]>([]);

  useEffect(() => {
    Promise.all(favoriteIds.map((id) => loadGuide(id))).then((list) =>
      setGuides(list.filter((g): g is Guide => g != null))
    );
  }, [favoriteIds]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      accessibilityLabel={t('favorites.title')}
    >
      <View style={styles.homeRow}>
        <HomeButton />
      </View>
      <Text style={styles.title} allowFontScaling>
        {t('favorites.title')}
      </Text>
      {guides.length === 0 ? (
        <Text style={styles.empty} allowFontScaling>
          {t('favorites.empty')}
        </Text>
      ) : (
        <View style={styles.list}>
          {guides.map((g) => (
            <Pressable
              key={g.id}
              onPress={() => goToGuide(g.id)}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              accessibilityLabel={g.title}
              accessibilityRole="button"
              accessibilityHint="Open this guide"
            >
              <Text style={styles.rowTitle} allowFontScaling>
                {g.title}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f9f7' },
  content: { padding: 24, paddingBottom: 48 },
  homeRow: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#111', marginBottom: 20 },
  empty: { fontSize: 18, color: '#666' },
  list: { gap: 8 },
  row: {
    minHeight: MIN_TOUCH_DP,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
  },
  rowTitle: { fontSize: MIN_FONT_SIZE, color: '#111' },
  pressed: { opacity: 0.85 },
});
