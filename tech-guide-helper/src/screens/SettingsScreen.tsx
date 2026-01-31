/**
 * Settings: language, TTS auto-play, high contrast, about.
 * Persistent HOME button.
 */

import React from 'react';
import { View, Text, ScrollView, Pressable, Switch, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { HomeButton } from '../components/HomeButton';
import { useAppStore } from '../store/useAppStore';
import { ScreenWrapper } from '../components/ScreenWrapper';

const MIN_FONT_SIZE = 18;
const MIN_TOUCH_DP = 48;

export function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const ttsAutoPlay = useAppStore((s) => s.ttsAutoPlay);
  const setTtsAutoPlay = useAppStore((s) => s.setTtsAutoPlay);
  const highContrast = useAppStore((s) => s.highContrast);
  const setHighContrast = useAppStore((s) => s.setHighContrast);

  const setLang = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <ScreenWrapper padding={10}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        accessibilityLabel={t('settings.title')}
      >
        {/* <View style={styles.homeRow}>
          <HomeButton
            accessibilityLabel={t('settings.homeButton')}
            accessibilityHint={t('settings.homeHint')}
          />
        </View> */}
        <Text style={styles.title} allowFontScaling>
          {t('settings.title')}
        </Text>

        <View style={styles.section}>
          <Text style={styles.label} allowFontScaling>
            {t('settings.language')}
          </Text>
          <View style={styles.row}>
            <Pressable
              onPress={() => setLang('en')}
              style={[
                styles.langButton,
                language === 'en' && styles.langActive,
              ]}
              accessibilityLabel="English"
              accessibilityRole="button"
              accessibilityState={{ selected: language === 'en' }}
            >
              <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>English</Text>
            </Pressable>
            <Pressable
              onPress={() => setLang('es')}
              style={[
                styles.langButton,
                language === 'es' && styles.langActive,
              ]}
              accessibilityLabel="Spanish"
              accessibilityRole="button"
              accessibilityState={{ selected: language === 'es' }}
            >
              <Text style={[styles.langText, language === 'es' && styles.langTextActive]}>Español</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={styles.label} allowFontScaling>
              {t('settings.ttsAutoPlay')}
            </Text>
            <Switch
              value={ttsAutoPlay}
              onValueChange={setTtsAutoPlay}
              accessibilityLabel={t('settings.ttsAutoPlay')}
              accessibilityRole="switch"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={styles.label} allowFontScaling>
              {t('settings.highContrast')}
            </Text>
            <Switch
              value={highContrast}
              onValueChange={setHighContrast}
              accessibilityLabel={t('settings.highContrast')}
              accessibilityRole="switch"
            />
          </View>
        </View>

        <Text style={styles.about} allowFontScaling>
          {t('settings.about')}
        </Text>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f9f7' },
  content: { padding: 24, paddingBottom: 48 },
  homeRow: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#111', marginBottom: 24 },
  section: { marginBottom: 24 },
  label: { fontSize: MIN_FONT_SIZE, color: '#333', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 12 },
  langButton: {
    minHeight: MIN_TOUCH_DP,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    justifyContent: 'center',
  },
  langActive: { backgroundColor: '#2d7a5e' },
  langText: { fontSize: MIN_FONT_SIZE, fontWeight: '600', color: '#111' },
  langTextActive: { color: '#fff' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: MIN_TOUCH_DP,
  },
  about: { fontSize: MIN_FONT_SIZE, color: '#666', marginTop: 16 },
});
