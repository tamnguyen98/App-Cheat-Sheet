/**
 * Central large search bar: text + optional voice.
 * High contrast, min 18pt, a11y labeled.
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';

const MIN_FONT_SIZE = 18;
const MIN_TOUCH_DP = 48;

export function LargeSearchBar({
  value,
  onChangeText,
  onSubmit,
  onVoicePress,
  placeholder,
  accessibilityLabel,
  accessibilityHint,
}: {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  onVoicePress?: () => void;
  placeholder?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}) {
  const { t } = useTranslation();
  const [focused, setFocused] = useState(false);
  const place = placeholder ?? t('home.searchPlaceholder');
  const a11yLabel = accessibilityLabel ?? t('home.searchPlaceholder');
  const a11yHint = accessibilityHint ?? t('home.searchHint');

  return (
    <View style={styles.wrapper}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={place}
        placeholderTextColor="#666"
        style={[styles.input, focused && styles.inputFocused]}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityLabel={a11yLabel}
        accessibilityHint={a11yHint}
        accessibilityRole="search"
        editable
        allowFontScaling
        selectTextOnFocus={false}
      />
      {onVoicePress && (
        <Pressable
          onPress={onVoicePress}
          style={({ pressed }) => [
            styles.voiceButton,
            pressed && styles.pressed,
          ]}
          accessibilityLabel="Search by voice"
          accessibilityRole="button"
          accessibilityHint="Tap to speak your search"
        >
          <Text style={styles.voiceLabel}>🎤</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    paddingHorizontal: 16,
    minHeight: MIN_TOUCH_DP + 8,
  },
  input: {
    flex: 1,
    fontSize: MIN_FONT_SIZE,
    paddingVertical: 14,
    color: '#111',
  },
  inputFocused: {
    borderColor: '#2d7a5e',
  },
  voiceButton: {
    minWidth: MIN_TOUCH_DP,
    minHeight: MIN_TOUCH_DP,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceLabel: {
    fontSize: 24,
  },
  pressed: {
    opacity: 0.7,
  },
});
