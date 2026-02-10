/**
 * Browse: headline, large search bar, category buttons, history list, persistent HOME.
 * Minimalist, high contrast, a11y per .cursorrules.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    StyleSheet,
    Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LargeSearchBar } from '../components/LargeSearchBar';
import { loadAllGuides, loadGuide } from '../services/storage';
import { Guide } from '../types/guide';
import { useAppStore } from '../store/useAppStore';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useTheme } from '../hooks/useTheme';
import { api } from '../services/api';

const MIN_FONT_SIZE = 18;
const MIN_TOUCH_DP = 48;

const CATEGORIES = [
    { key: 'Video Calls', i18nKey: 'home.videoCalls' },
    { key: 'Phone Basics', i18nKey: 'home.phoneBasics' },
    { key: 'Email', i18nKey: 'home.email' },
    { key: 'Photos', i18nKey: 'home.photos' },
    { key: 'Security', i18nKey: 'home.security' },
] as const;

export function BrowseScreen() {
    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const { goToGuide } = useAppNavigation();
    const viewedGuideIds = useAppStore((s) => s.viewedGuides);
    const language = useAppStore((s) => s.language);

    const [search, setSearch] = useState('');
    const [guides, setGuides] = useState<Guide[]>([]);
    const [historyGuides, setHistoryGuides] = useState<Guide[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [searchResults, setSearchResults] = useState<Guide[]>([]);

    // Device family logic
    const deviceFamily = Platform.OS === 'ios' ? 'ios-iphone' : 'android-generic';

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

    const handleSearch = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            console.log(`[Browse] Triggering search flow for: "${query}"`);

            // 1. Cloud Search
            let cloud: Guide[] = [];
            try {
                cloud = await api.getGuides({
                    search: query,
                    lang: language,
                    device: deviceFamily
                });
                console.log(`[Browse] Cloud results: ${cloud.length}`);
            } catch (e) {
                console.warn('[Browse] Cloud search failed', e);
            }

            // 2. Local Filter
            const local = guides.filter(
                (g) =>
                    g.title.toLowerCase().includes(query.toLowerCase()) ||
                    g.category?.toLowerCase().includes(query.toLowerCase())
            );

            // 3. Merge & Deduplicate
            const mergedMap = new Map<string, Guide>();
            local.forEach(g => mergedMap.set(g.baseId || g.id, g));
            cloud.forEach(g => {
                const key = g.baseId || g.id;
                const existing = mergedMap.get(key);
                if (!existing || g.version >= existing.version) {
                    mergedMap.set(key, g);
                }
            });

            setSearchResults(Array.from(mergedMap.values()));
        } catch (e) {
            console.error('[Browse] Search failed', e);
        }
    }, [language, deviceFamily, guides]);

    // Debounced search for live results
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search, handleSearch]);

    const openGuide = (guide: Guide) => goToGuide(guide.id);

    const filterByCategory = (category: string) => {
        const list = guides.filter(
            (g) => g.category?.toLowerCase() === category.toLowerCase()
        );
        if (list.length === 1) openGuide(list[0]);
        else setSearch(category);
    };

    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.background },
        content: { padding: 24, paddingBottom: 48 },
        headline: { fontSize: 26, fontWeight: '700', color: theme.textPrimary, marginBottom: 20 },
        searchRow: { marginBottom: 28 },
        categoriesTitle: { fontSize: MIN_FONT_SIZE, fontWeight: '600', color: theme.textSecondary, marginBottom: 12 },
        categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
        categoryButton: {
            minHeight: MIN_TOUCH_DP,
            paddingHorizontal: 20,
            paddingVertical: 14,
            backgroundColor: theme.primaryLight,
            borderRadius: 8,
            justifyContent: 'center',
        },
        categoryText: { fontSize: MIN_FONT_SIZE, fontWeight: '600', color: theme.primary },
        pressed: { opacity: 0.85 },
        historySection: { marginTop: 12 },
        historyTitle: { fontSize: MIN_FONT_SIZE, fontWeight: '600', color: theme.textSecondary, marginBottom: 12 },
        results: { gap: 8 },
        guideRow: {
            minHeight: MIN_TOUCH_DP,
            paddingVertical: 14,
            paddingHorizontal: 16,
            backgroundColor: theme.surface,
            borderRadius: 8,
            justifyContent: 'center',
        },
        guideTitle: { fontSize: MIN_FONT_SIZE, color: theme.textPrimary },
        emptyHistory: { fontSize: MIN_FONT_SIZE, color: theme.textTertiary, fontStyle: 'italic' },
    });

    return (
        <ScreenWrapper padding={10}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                accessibilityLabel="Browse screen"
            >
                <Text style={styles.headline} allowFontScaling>
                    {t('home.headline')}
                </Text>

                <View style={styles.searchRow}>
                    <LargeSearchBar
                        value={search}
                        onChangeText={setSearch}
                        onSubmit={() => handleSearch(search)}
                        placeholder={t('search.placeholder')}
                    />
                </View>

                {!search.trim() && (
                    <>
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
                    </>
                )}

                {search.trim().length > 0 && (
                    <View style={styles.results}>
                        {searchResults.slice(0, 20).map((g) => (
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
