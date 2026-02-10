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
    Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from 'react-i18next';
import { LargeSearchBar } from '../components/LargeSearchBar';
import { HomeButton } from '../components/HomeButton';
import { loadAllGuides } from '../services/storage';
import { Guide } from '../types/guide';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useTheme } from '../hooks/useTheme';
import { api } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { LANGUAGES } from '../i18n';

const MIN_FONT_SIZE = 18;
const MIN_TOUCH_DP = 48;

/** Top inquiry suggestions (keys match guide IDs or search terms). */
const SUGGESTION_IDS = [
    'zoom-join-android',
    'zoom-join-ios',
    'phone-basics-calls-android',
    'photos-save-android',
] as const;

export function LandingScreen() {
    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const { goToGuide, goToHome } = useAppNavigation();
    const language = useAppStore((s) => s.language);
    const setLanguage = useAppStore((s) => s.setLanguage);
    const userEmail = useAppStore((s) => s.userEmail);

    const [query, setQuery] = useState('');
    const [guides, setGuides] = useState<Guide[]>([]);
    const [suggestions, setSuggestions] = useState<Guide[]>([]);
    const [loading, setLoading] = useState(false);

    // Device family logic: pick a default based on OS
    const deviceFamily = Platform.OS === 'ios' ? 'ios-iphone' : 'android-generic';

    const syncSettings = async (updates: any) => {
        if (userEmail) {
            try {
                await api.patchMeSettings(updates);
            } catch (e) {
                console.warn('[Landing] Failed to sync settings to backend', e);
            }
        }
    };

    const setLang = (lang: string) => {
        setLanguage(lang);
        i18n.changeLanguage(lang);
        syncSettings({ language: lang });
    };

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            // 1) Load initial suggestions (top inquiries)
            const top = await api.getGuides({ lang: language, device: deviceFamily, limit: 10 });
            setSuggestions(top);

            // 2) Load all local guides as fallback for immediate search if offline
            const local = await loadAllGuides();
            setGuides(local);
        } catch (e) {
            console.warn('[Landing] Failed to load search data from backend', e);
            // Fallback to local only
            const local = await loadAllGuides();
            setGuides(local);
            setSuggestions(SUGGESTION_IDS.map(id => local.find(g => g.id === id)).filter((g): g is Guide => !!g));
        } finally {
            setLoading(false);
        }
    }, [language, deviceFamily]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Handle search via API or local filter
    const [searchResults, setSearchResults] = useState<Guide[]>([]);

    useEffect(() => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                console.log(`[Landing] Triggering search flow for: "${query}"`);

                // 1. Fetch Cloud Results
                let cloud: Guide[] = [];
                try {
                    cloud = await api.getGuides({
                        search: query,
                        lang: language,
                        device: deviceFamily
                    });
                    console.log(`[Landing] Cloud results fetched: ${cloud.length}`);
                } catch (e) {
                    console.warn('[Landing] Cloud search failed, using local fallback if needed', e);
                }

                // 2. Filter Local Results (from pre-loaded 'guides' state)
                const local = guides.filter(
                    (g) =>
                        g.title.toLowerCase().includes(query.toLowerCase()) ||
                        g.category?.toLowerCase().includes(query.toLowerCase())
                );
                console.log(`[Landing] Local matches filtered: ${local.length}`);

                // 3. Merge & Deduplicate
                // Use baseId (fallback to id) as key. Prefer cloud version for same guide.
                const mergedMap = new Map<string, Guide>();

                // Load local matches first
                local.forEach(g => {
                    const key = g.baseId || g.id;
                    mergedMap.set(key, g);
                });

                // Overwrite/Update with cloud matches
                cloud.forEach(g => {
                    const key = g.baseId || g.id;
                    const existing = mergedMap.get(key);
                    // If not in map, or if cloud version is newer/equal, overwrite
                    if (!existing || g.version >= existing.version) {
                        mergedMap.set(key, g);
                    }
                });

                const finalResults = Array.from(mergedMap.values());
                console.log(`[Landing] Final merged & deduplicated count: ${finalResults.length}`);

                setSearchResults(finalResults);
            } catch (e) {
                console.error('[Landing] Failed to perform search', e);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, language, deviceFamily, guides]);

    const filtered = searchResults;

    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.background },
        content: { padding: 24, paddingBottom: 48 },
        title: {
            fontSize: 28,
            fontWeight: '700',
            color: theme.textPrimary,
            marginBottom: 24,
            textAlign: 'center',
        },
        langSection: {
            marginBottom: 20,
            alignSelf: 'center',
            width: '100%',
            maxWidth: 300,
        },
        pickerContainer: {
            backgroundColor: theme.surfaceAlt,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.disabled,
            overflow: 'hidden',
        },
        picker: {
            height: 50,
            color: theme.textPrimary,
        },
        searchRow: { marginBottom: 28 },
        suggestionsTitle: {
            fontSize: MIN_FONT_SIZE,
            fontWeight: '600',
            color: theme.textSecondary,
            marginBottom: 12,
        },
        suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
        chip: {
            minHeight: MIN_TOUCH_DP,
            paddingHorizontal: 20,
            paddingVertical: 14,
            backgroundColor: theme.primaryLight,
            borderRadius: 24,
            justifyContent: 'center',
        },
        chipText: { fontSize: MIN_FONT_SIZE, fontWeight: '600', color: theme.primary },
        pressed: { opacity: 0.85 },
        results: { marginTop: 16, gap: 8 },
        resultsTitle: {
            fontSize: MIN_FONT_SIZE,
            fontWeight: '600',
            color: theme.textSecondary,
            marginBottom: 8,
        },
        resultRow: {
            minHeight: MIN_TOUCH_DP,
            paddingVertical: 14,
            paddingHorizontal: 16,
            backgroundColor: theme.surface,
            borderRadius: 8,
            justifyContent: 'center',
        },
        resultText: { fontSize: MIN_FONT_SIZE, color: theme.textPrimary },
        browseButton: {
            minHeight: MIN_TOUCH_DP,
            marginTop: 24,
            paddingVertical: 14,
            backgroundColor: theme.primary,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
        },
        browseText: { fontSize: MIN_FONT_SIZE, fontWeight: '700', color: theme.textInverse },
    });

    return (
        <ScreenWrapper padding={10}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                accessibilityLabel={t('search.landingLabel')}
            >
                <Text style={styles.title} allowFontScaling>
                    {t('search.title')}
                </Text>

                <View style={styles.langSection}>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={language}
                            onValueChange={(itemValue) => setLang(itemValue)}
                            style={styles.picker}
                            dropdownIconColor={theme.primary}
                        >
                            {LANGUAGES.map((lang) => (
                                <Picker.Item
                                    key={lang.id}
                                    label={lang.label}
                                    value={lang.id}
                                />
                            ))}
                        </Picker>
                    </View>
                </View>

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

                {!query.trim() && (
                    <>
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
                    </>
                )}

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
        </ScreenWrapper>
    );
}
