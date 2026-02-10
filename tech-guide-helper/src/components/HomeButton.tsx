/**
 * Persistent HOME button: every screen must show this.
 * Large, prominent, different color. Safety UX per .cursorrules.
 */

import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { useTheme } from '../hooks/useTheme';

const MIN_TOUCH_DP = 48;

export function HomeButton({
  style,
  textStyle,
  label,
  accessibilityLabel,
  accessibilityHint,
}: {
  style?: ViewStyle;
  textStyle?: TextStyle;
  label?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}) {
  const { t } = useTranslation();
  const { goToHome } = useAppNavigation();
  const theme = useTheme();

  const theLabel = label ?? t('settings.homeButton');
  const a11yLabel = accessibilityLabel ?? theLabel;
  const a11yHint = accessibilityHint ?? t('settings.homeHint');

  const styles = StyleSheet.create({
    button: {
      minHeight: MIN_TOUCH_DP,
      minWidth: MIN_TOUCH_DP * 2,
      paddingHorizontal: 24,
      paddingVertical: 14,
      backgroundColor: theme.primary,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    pressed: {
      opacity: 0.85,
    },
    text: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.textInverse,
    },
  });

  return (
    <Pressable
      onPress={goToHome}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}
      accessibilityLabel={a11yLabel}
      accessibilityRole="button"
      accessibilityHint={a11yHint}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <Text style={[styles.text, textStyle]} allowFontScaling>
        {theLabel}
      </Text>
    </Pressable>
  );
}
