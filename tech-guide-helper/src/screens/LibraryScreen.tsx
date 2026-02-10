/**
 * Library: list of available (local) guides + Favorites section.
 * Two collapsible sections: Your Guides and Favorites.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { loadAllGuides } from '../services/storage';
import { Guide } from '../types/guide';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../hooks/useTheme';
import { api } from '../services/api';

const MIN_FONT_SIZE = 18;
const MIN_TOUCH_DP = 48;
const PAGE_SIZE = 20;

export function LibraryScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { goToGuide } = useAppNavigation();
  const navigation = useNavigation();

  // Store state
  const favoriteIds = useAppStore((s) => s.favorites);
  const idToken = useAppStore((s) => s.idToken);

  const favoriteGuides = useAppStore((s) => s.favoriteGuides);
  const setFavoriteGuides = useAppStore((s) => s.setFavoriteGuides);
  const appendFavoriteGuides = useAppStore((s) => s.appendFavoriteGuides);
  const isLoadingFavorites = useAppStore((s) => s.isLoadingFavorites);
  const setIsLoadingFavorites = useAppStore((s) => s.setIsLoadingFavorites);

  const myGuides = useAppStore((s) => s.myGuides);
  const setMyGuides = useAppStore((s) => s.setMyGuides);
  const appendMyGuides = useAppStore((s) => s.appendMyGuides);
  const isLoadingMyGuides = useAppStore((s) => s.isLoadingMyGuides);
  const setIsLoadingMyGuides = useAppStore((s) => s.setIsLoadingMyGuides);

  const [guidesExpanded, setGuidesExpanded] = useState(true);
  const [favoritesExpanded, setFavoritesExpanded] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Lazy load Library (Favorites + Created Guides)
  const loadLibrary = useCallback(async (isInitial = false) => {
    if (!idToken) {
      setMyGuides([]);
      // Not logged in: show local/seed favorites if any
      if (isInitial) {
        console.log('[Library] Not logged in, loading local favorites');
        const local = await loadAllGuides();
        setFavoriteGuides(local.filter(g => favoriteIds.includes(g.id)));
      }
      return;
    }

    setIsLoadingMyGuides(true);
    setIsLoadingFavorites(true);
    try {
      const currentOffset = isInitial ? 0 : myGuides.length;
      console.log(`[Library] Fetching cloud library, offset: ${currentOffset}`);
      const response = await api.getMyLibrary({ limit: PAGE_SIZE, offset: currentOffset });

      if (isInitial) {
        const cloudFavIds = response.favorites.map(g => g.id);
        // 1. Correctly identify orphans (missing both title and category)
        const orphans = response.favorites.filter(g => !g.title && !g.category);

        console.log('[Library] Cloud favorites count:', response.favorites.length);
        console.log('[Library] Orphan favorites:', orphans.length);

        let mergedFavorites = response.favorites;

        if (orphans.length > 0) {
          const localGuides = await loadAllGuides();

          // 2. Create a list of orphan IDs for quick lookup
          const orphanIds = orphans.map(o => o.id);

          // 3. Instead of appending (which creates duplicates), we map and replace
          mergedFavorites = response.favorites.map(cloudItem => {
            // If this specific item is an orphan...
            if (orphanIds.includes(cloudItem.id)) {
              // Find the "full" data from your local guides
              const fullData = localGuides.find(l => l.id === cloudItem.id);

              // Return the full data if found, otherwise stick with the cloud placeholder
              return fullData ? { ...cloudItem, ...fullData } : cloudItem;
            }

            return cloudItem;
          });

          console.log('[Library] Hydrated orphans with local data');
        }

        setFavoriteGuides(mergedFavorites);
        setMyGuides(response.created);
      } else {
        appendFavoriteGuides(response.favorites);
        appendMyGuides(response.created);
      }
    } catch (e) {
      console.error('[Library] Failed to load library data', e);
    } finally {
      setIsLoadingMyGuides(false);
      setIsLoadingFavorites(false);
      setRefreshing(false);
    }
  }, [idToken, myGuides.length, setFavoriteGuides, appendFavoriteGuides, setMyGuides, appendMyGuides, setIsLoadingFavorites, setIsLoadingMyGuides, favoriteIds]);

  // Initial load on focus/mount
  useEffect(() => {
    loadLibrary(true);
  }, [idToken, loadLibrary]);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    content: { padding: 24, paddingBottom: 48 },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: { fontSize: 24, fontWeight: '700', color: theme.textPrimary },
    refreshButton: {
      padding: 8,
      backgroundColor: theme.surfaceAlt,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    refreshText: {
      fontSize: 16,
      color: theme.primary,
      fontWeight: '600',
    },
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
    loadMore: {
      minHeight: MIN_TOUCH_DP,
      marginTop: 12,
      paddingVertical: 12,
      backgroundColor: theme.disabled,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadMoreText: { fontSize: MIN_FONT_SIZE, fontWeight: '600', color: theme.textPrimary },
    loader: { marginVertical: 20 },
    createButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.primaryLight,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.primary,
      borderStyle: 'dashed',
    },
    createButtonText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.primary,
    },
    guideRowContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    privateBadge: {
      fontSize: 12,
      color: theme.textSecondary,
      backgroundColor: theme.surfaceAlt,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      overflow: 'hidden',
      marginLeft: 8,
    },
    editButton: {
      padding: 10,
      backgroundColor: theme.surfaceAlt,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      minWidth: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    editButtonText: {
      fontSize: 18,
      color: theme.textPrimary,
    },
  });

  return (
    <ScreenWrapper padding={10}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        accessibilityLabel={t('library.title')}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadLibrary(true);
            }}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
      >
        <View style={styles.titleRow}>
          <Text style={styles.title} allowFontScaling>
            {t('library.title')}
          </Text>
          {idToken && (
            <Pressable
              onPress={() => {
                setRefreshing(true);
                loadLibrary(true);
              }}
              style={({ pressed }) => [styles.refreshButton, pressed && styles.pressed]}
              accessibilityLabel="Refresh library"
              accessibilityRole="button"
            >
              <Text style={styles.refreshText}>↻</Text>
            </Pressable>
          )}
        </View>

        {/* Favorites Section */}
        <View style={styles.section}>
          <Pressable
            onPress={() => setFavoritesExpanded(!favoritesExpanded)}
            style={styles.sectionHeader}
            accessibilityLabel={t('library.favorites')}
            accessibilityRole="button"
            accessibilityState={{ expanded: favoritesExpanded }}
          >
            <Text style={styles.sectionTitle} allowFontScaling>
              {t('library.favorites')}
            </Text>
            <Text style={styles.expandIcon}>{favoritesExpanded ? '▼' : '▶'}</Text>
          </Pressable>
          {favoritesExpanded && (
            isLoadingFavorites && favoriteGuides.length === 0 ? (
              <ActivityIndicator size="small" color={theme.primary} style={styles.loader} />
            ) : favoriteGuides.length === 0 ? (
              <Text style={styles.empty} allowFontScaling>
                {t('library.noFavorites')}
              </Text>
            ) : (
              <View style={styles.list}>
                {favoriteGuides.map((g) => (
                  <Pressable
                    key={g.id}
                    onPress={() => goToGuide(g.id)}
                    style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                  >
                    <Text style={styles.rowTitle} allowFontScaling>
                      {g.title}
                    </Text>
                  </Pressable>
                ))}

                {favoriteIds.length > favoriteGuides.length && (
                  <Pressable
                    onPress={() => loadLibrary(false)}
                    disabled={isLoadingFavorites}
                    style={({ pressed }) => [styles.loadMore, pressed && styles.pressed]}
                  >
                    {isLoadingFavorites ? (
                      <ActivityIndicator size="small" color={theme.textPrimary} />
                    ) : (
                      <Text style={styles.loadMoreText}>Load more</Text>
                    )}
                  </Pressable>
                )}
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
            accessibilityState={{ expanded: guidesExpanded }}
          >
            <Text style={styles.sectionTitle} allowFontScaling>
              {t('library.yourGuides')}
            </Text>
            <Text style={styles.expandIcon}>{guidesExpanded ? '▼' : '▶'}</Text>
          </Pressable>

          {guidesExpanded && (
            <View>
              {/* CREATE BUTTON */}
              <Pressable
                onPress={() => (navigation as any).navigate('GuideEditor')} // Type cast for now or update hook
                style={({ pressed }) => [styles.createButton, pressed && styles.pressed]}
                accessibilityLabel={t('editor.createGuide')}
                accessibilityRole="button"
              >
                <Text style={styles.createButtonText}>+ {t('editor.createGuide')}</Text>
              </Pressable>

              {isLoadingMyGuides && myGuides.length === 0 ? (
                <ActivityIndicator size="small" color={theme.primary} style={styles.loader} />
              ) : myGuides.length === 0 ? (
                <Text style={styles.empty} allowFontScaling>
                  {t('library.noGuides')}
                </Text>
              ) : (
                <View style={styles.list}>
                  {myGuides.map((g) => (
                    <View key={g.id} style={styles.guideRowContainer}>
                      <Pressable
                        onPress={() => goToGuide(g.id)}
                        style={({ pressed }) => [styles.row, pressed && styles.pressed, { flex: 1 }]}
                      >
                        <Text style={styles.rowTitle} allowFontScaling>
                          {g.title}
                        </Text>
                        {g.isPrivate && <Text style={styles.privateBadge}>Private</Text>}
                      </Pressable>
                      <Pressable
                        onPress={() => (navigation as any).navigate('GuideEditor', { guideId: g.id })}
                        style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
                        accessibilityLabel={`${t('editor.editGuide')} ${g.title}`}
                        accessibilityRole="button"
                      >
                        <Text style={styles.editButtonText}>✎</Text>
                      </Pressable>
                    </View>
                  ))}

                  <Pressable
                    onPress={() => loadLibrary(false)}
                    disabled={isLoadingMyGuides}
                    style={({ pressed }) => [styles.loadMore, pressed && styles.pressed]}
                  >
                    {isLoadingMyGuides ? (
                      <ActivityIndicator size="small" color={theme.textPrimary} />
                    ) : (
                      <Text style={styles.loadMoreText}>Load more</Text>
                    )}
                  </Pressable>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

// Add styles here... I need to see full file or append styles.
// I will target the styles object.
