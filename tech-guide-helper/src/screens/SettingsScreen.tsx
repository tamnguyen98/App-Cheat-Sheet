/**
 * Settings: language, TTS auto-play, high contrast, about.
 * Persistent HOME button.
 */

import React from 'react';
import { View, Text, ScrollView, Pressable, Switch, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from 'react-i18next';
import { HomeButton } from '../components/HomeButton';
import { useAppStore } from '../store/useAppStore';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useTheme } from '../hooks/useTheme';
import { LANGUAGES } from '../i18n';

const MIN_FONT_SIZE = 18;
const MIN_TOUCH_DP = 48;

export function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
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

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    content: { padding: 24, paddingBottom: 48 },
    homeRow: { marginBottom: 24 },
    title: { fontSize: 24, fontWeight: '700', color: theme.textPrimary, marginBottom: 24 },
    section: { marginBottom: 24 },
    label: { fontSize: MIN_FONT_SIZE, color: theme.textSecondary, marginBottom: 8 },
    row: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
    langButton: {
      minHeight: MIN_TOUCH_DP,
      paddingHorizontal: 20,
      paddingVertical: 14,
      backgroundColor: theme.disabled,
      borderRadius: 8,
      justifyContent: 'center',
    },
    pickerContainer: {
      backgroundColor: '#fafafa',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#e0e0e0',
      marginTop: 8,
      overflow: 'hidden', // Ensures the picker stays inside rounded corners
    },
    picker: {
      width: '100%',
      height: 55, // Larger touch target for seniors
      color: '#333',
    },
    pickerItem: {
      fontSize: 18, // High legibility
    },
    // label: {
    //   fontSize: 18,
    //   fontWeight: '700',
    //   color: '#333',
    // },
    langActive: { backgroundColor: theme.primary },
    langText: { fontSize: MIN_FONT_SIZE, fontWeight: '600', color: theme.textPrimary },
    langTextActive: { color: theme.textInverse },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: MIN_TOUCH_DP,
    },
    about: { fontSize: MIN_FONT_SIZE, color: theme.textTertiary, marginTop: 16 },
  });

  return (
    <ScreenWrapper padding={10}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        accessibilityLabel={t('settings.title')}
      >
        <Text style={styles.title} allowFontScaling>
          {t('settings.title')}
        </Text>

        <View style={styles.section}>
          <Text style={styles.label} allowFontScaling>
            {t('settings.language')}
          </Text>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={language} // From your Zustand store
              onValueChange={(itemValue) => setLang(itemValue)}
              style={styles.picker}
              dropdownIconColor="#2d7a5e" // Matching your app theme
            >
              {LANGUAGES.map((lang) => (
                <Picker.Item
                  key={lang.id}
                  label={lang.label}
                  value={lang.id}
                  style={styles.pickerItem}
                />
              ))}
            </Picker>
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
