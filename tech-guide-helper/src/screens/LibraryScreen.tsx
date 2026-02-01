/**
 * Library: list of available (local) guides + Favorites section.
 * Two collapsible sections: Your Guides and Favorites.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { loadAllGuides, loadGuide } from '../services/storage';
import { Guide } from '../types/guide';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../hooks/useTheme';

const MIN_FONT_SIZE = 18;
const MIN_TOUCH_DP = 48;

export function LibraryScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { goToGuide } = useAppNavigation();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [favGuides, setFavGuides] = useState<Guide[]>([]);
  const [guidesExpanded, setGuidesExpanded] = useState(true);
  const [favoritesExpanded, setFavoritesExpanded] = useState(true);
  const favoriteIds = useAppStore((s) => s.favorites);

  const refresh = useCallback(async () => {
    const list = await loadAllGuides();
    setGuides(list);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    Promise.all(favoriteIds.map((id) => loadGuide(id))).then((list) =>
      setFavGuides(list.filter((g): g is Guide => g != null))
    );
  }, [favoriteIds]);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    content: { padding: 24, paddingBottom: 48 },
    title: { fontSize: 24, fontWeight: '700', color: theme.textPrimary, marginBottom: 20 },
    section: { marginBottom: 24 },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: MIN_TOUCH_DP,
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: theme.surfaceAlt,
      borderRadius: 8,
      marginBottom: 8,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.textPrimary,
    },
    expandIcon: {
      fontSize: 20,
      color: theme.textPrimary,
    },
    list: { gap: 8 },
    row: {
      minHeight: MIN_TOUCH_DP,
      paddingVertical: 14,
      paddingHorizontal: 16,
      backgroundColor: theme.surface,
      borderRadius: 8,
      justifyContent: 'center',
    },
    rowTitle: { fontSize: MIN_FONT_SIZE, color: theme.textPrimary },
    pressed: { opacity: 0.85 },
    empty: { fontSize: MIN_FONT_SIZE, color: theme.textTertiary, paddingHorizontal: 16 },
  });

  return (
    <ScreenWrapper padding={10}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        accessibilityLabel={t('library.title')}
      >
        <Text style={styles.title} allowFontScaling>
          {t('library.title')}
        </Text>

        {/* Favorites Section */}
        <View style={styles.section}>
          <Pressable
            onPress={() => setFavoritesExpanded(!favoritesExpanded)}
            style={styles.sectionHeader}
            accessibilityLabel={t('library.favorites')}
            accessibilityRole="button"
            accessibilityHint={favoritesExpanded ? 'Collapse section' : 'Expand section'}
            accessibilityState={{ expanded: favoritesExpanded }}
          >
            <Text style={styles.sectionTitle} allowFontScaling>
              {t('library.favorites')}
            </Text>
            <Text style={styles.expandIcon}>{favoritesExpanded ? '▼' : '▶'}</Text>
          </Pressable>
          {favoritesExpanded && (
            favGuides.length === 0 ? (
              <Text style={styles.empty} allowFontScaling>
                {t('library.noFavorites')}
              </Text>
            ) : (
              <View style={styles.list}>
                {favGuides.map((g) => (
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
            )
          )}
        </View>

        {/* Your Guides Section */}
        <View style={styles.section}>
          <Pressable
            onPress={() => setGuidesExpanded(!guidesExpanded)}
            style={styles.sectionHeader}
            accessibilityLabel={t('library.yourGuides')}
            accessibilityRole="button"
            accessibilityHint={guidesExpanded ? 'Collapse section' : 'Expand section'}
            accessibilityState={{ expanded: guidesExpanded }}
          >
            <Text style={styles.sectionTitle} allowFontScaling>
              {t('library.yourGuides')}
            </Text>
            <Text style={styles.expandIcon}>{guidesExpanded ? '▼' : '▶'}</Text>
          </Pressable>
          {guidesExpanded && (
            guides.length === 0 ? (
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
            )
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
