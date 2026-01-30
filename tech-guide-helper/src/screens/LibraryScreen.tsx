/**
 * Library: list of available (local) guides.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { HomeButton } from '../components/HomeButton';
import { loadAllGuides } from '../services/storage';
import { Guide } from '../types/guide';
import { useAppNavigation } from '../hooks/useAppNavigation';

const MIN_FONT_SIZE = 18;
const MIN_TOUCH_DP = 48;

export function LibraryScreen() {
  const { t } = useTranslation();
  const { goToGuide } = useAppNavigation();
  const [guides, setGuides] = useState<Guide[]>([]);

  const refresh = useCallback(async () => {
    const list = await loadAllGuides();
    setGuides(list);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      accessibilityLabel={t('library.title')}
    >
      <View style={styles.homeRow}>
        <HomeButton />
      </View>
      <Text style={styles.title} allowFontScaling>
        {t('library.title')}
      </Text>
      <Text style={styles.subtitle} allowFontScaling>
        {t('library.yourGuides')}
      </Text>
      {guides.length === 0 ? (
        <Text style={styles.empty} allowFontScaling>
          {t('library.noGuides')}
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
  title: { fontSize: 24, fontWeight: '700', color: '#111', marginBottom: 8 },
  subtitle: { fontSize: MIN_FONT_SIZE, color: '#555', marginBottom: 20 },
  empty: { fontSize: MIN_FONT_SIZE, color: '#666' },
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
