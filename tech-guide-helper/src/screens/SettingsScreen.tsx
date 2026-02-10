/**
 * Settings: language, TTS auto-play, high contrast, about.
 * Persistent HOME button.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Switch, StyleSheet, TextInput, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { getFirebaseAuth } from '../services/firebase';
import { useTranslation } from 'react-i18next';
import { HomeButton } from '../components/HomeButton';
import { useAppStore } from '../store/useAppStore';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useTheme } from '../hooks/useTheme';
import { LANGUAGES } from '../i18n';
import { api } from '../services/api';

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
  const userEmail = useAppStore((s) => s.userEmail);
  const setAuth = useAppStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Note: onAuthStateChanged and hydration are now handled globally in useAuth() (App.tsx)

  const handleSignIn = async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const token = await cred.user.getIdToken();
      setAuth(cred.user.email, token);
      setEmail('');
      setPassword('');
      // hydration happens in onAuthStateChanged
    } catch (e: any) {
      Alert.alert(t('settings.authError'), e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const token = await cred.user.getIdToken();
      setAuth(cred.user.email, token);
      setEmail('');
      setPassword('');
    } catch (e: any) {
      Alert.alert(t('settings.authError'), e.message);
    } finally {
      setLoading(false);
    }
  };

  const syncSettings = async (updates: any) => {
    if (userEmail) {
      try {
        await api.patchMeSettings(updates);
      } catch (e) {
        console.warn('Failed to sync settings to backend', e);
      }
    }
  };

  const handleSignOut = async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    try {
      await signOut(auth);
      setAuth(null, null);
    } catch (e: any) {
      Alert.alert(t('settings.authError'), e.message);
    }
  };

  const setLang = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    syncSettings({ language: lang });
  };

  const toggleTts = (val: boolean) => {
    setTtsAutoPlay(val);
    syncSettings({ ttsAutoPlay: val });
  };

  const toggleHighContrast = (val: boolean) => {
    setHighContrast(val);
    syncSettings({ highContrast: val });
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
    input: {
      minHeight: MIN_TOUCH_DP,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      paddingHorizontal: 16,
      fontSize: MIN_FONT_SIZE,
      marginBottom: 12,
      color: theme.textPrimary,
      backgroundColor: theme.surface,
    },
    authButton: {
      flex: 1,
      minHeight: MIN_TOUCH_DP,
      paddingVertical: 14,
      backgroundColor: theme.primary,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    authButtonText: {
      fontSize: MIN_FONT_SIZE,
      fontWeight: '700',
      color: theme.textInverse,
    },
    signUpButton: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: theme.primary,
    },
    signUpButtonText: {
      color: theme.primary,
    },
    signOutButton: {
      backgroundColor: theme.error || '#b00',
    },
    signOutButtonText: {
      color: '#fff',
    },
    authState: {
      fontSize: MIN_FONT_SIZE,
      color: theme.textSecondary,
      marginBottom: 16,
    },
    navDisabled: {
      opacity: 0.5,
    },
    pressed: {
      opacity: 0.85,
    },
  });

  return (
    <ScreenWrapper padding={10}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        accessibilityLabel={t('settings.title')}
      >
        <View style={styles.section}>
          <Text style={styles.title} allowFontScaling>{t('settings.authTitle')}</Text>
          <Text style={styles.authState} allowFontScaling>
            {userEmail ? t('settings.signedInAs', { email: userEmail }) : t('settings.notSignedIn')}
          </Text>

          {!userEmail ? (
            <View>
              <TextInput
                style={styles.input}
                placeholder={t('settings.emailLabel')}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor={theme.inputPlaceholder}
              />
              <TextInput
                style={styles.input}
                placeholder={t('settings.passwordLabel')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor={theme.inputPlaceholder}
              />
              <View style={styles.row}>
                <Pressable
                  onPress={handleSignIn}
                  disabled={loading}
                  style={({ pressed }) => [styles.authButton, pressed && styles.pressed, loading && styles.navDisabled]}
                >
                  <Text style={styles.authButtonText}>{t('settings.signIn')}</Text>
                </Pressable>
                <Pressable
                  onPress={handleSignUp}
                  disabled={loading}
                  style={({ pressed }) => [styles.authButton, styles.signUpButton, pressed && styles.pressed, loading && styles.navDisabled]}
                >
                  <Text style={[styles.authButtonText, styles.signUpButtonText]}>{t('settings.signUp')}</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={handleSignOut}
              style={({ pressed }) => [styles.authButton, styles.signOutButton, pressed && styles.pressed]}
            >
              <Text style={[styles.authButtonText, styles.signOutButtonText]}>{t('settings.signOut')}</Text>
            </Pressable>
          )}
        </View>

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
              onValueChange={toggleTts}
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
              onValueChange={toggleHighContrast}
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
