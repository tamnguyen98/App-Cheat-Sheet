import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  padding?: number; // Allow custom override
}

export const ScreenWrapper = ({ children, scroll = false, padding = 20 }: Props) => {
  const insets = useSafeAreaInsets();

  const containerStyle = [
    styles.container,
    {
      // Safe Area Insets + Your custom padding
      paddingTop: insets.top + padding,
      paddingBottom: insets.bottom + padding,
      paddingHorizontal: padding,
    }
  ];

  return scroll ? (
    <ScrollView 
      contentContainerStyle={containerStyle} 
      showsVerticalScrollIndicator={false} // This hides the bar on iOS and Android
      persistentScrollbar={false}          // Ensures it doesn't stay visible on Android
      overScrollMode="never"               // Optional: removes the "glow" effect at the edges on Android
    >
      {children}
    </ScrollView>
  ) : (
    <View style={containerStyle}>{children}</View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f9f7', // Matches your App.tsx background
  },
});