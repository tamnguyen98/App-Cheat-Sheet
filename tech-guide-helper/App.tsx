/**
 * Root: bootstrap, i18n, Paper, Navigation.
 * Bootstrap runs once before rendering navigation.
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { RootNavigator } from './src/navigation/RootNavigator';
import { NavigationRefProvider } from './src/context/NavigationRefContext';
import { bootstrap } from './src/bootstrap';
import type { RootNavigationRef } from './src/navigation/types';
import './src/i18n';

const MIN_FONT_SIZE = 18;

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rootNavRef = useRef<RootNavigationRef | null>(null);

  useEffect(() => {
    bootstrap()
      .then(() => setReady(true))
      .catch((e) => setError(String(e?.message ?? e)));
  }, []);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error} allowFontScaling>
          Something went wrong. Please restart the app.
        </Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2d7a5e" />
        <Text style={styles.loading} allowFontScaling>
          Loading…
        </Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <NavigationContainer ref={rootNavRef}>
        <NavigationRefProvider navigationRef={rootNavRef}>
          <RootNavigator />
          <StatusBar style="auto" />
        </NavigationRefProvider>
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: '#f5f9f7',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loading: {
    fontSize: MIN_FONT_SIZE,
    color: '#555',
    marginTop: 16,
  },
  error: {
    fontSize: MIN_FONT_SIZE,
    color: '#b00',
    textAlign: 'center',
  },
});
