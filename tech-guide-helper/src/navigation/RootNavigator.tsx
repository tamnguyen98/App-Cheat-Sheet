/**
 * Root navigator: stack with MainTabs and GuideDetail.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabs } from './MainTabs';
import { GuideDetailScreen } from '../screens/GuideDetailScreen';
import { LandingScreen } from '../screens/LandingScreen';
import { GuideEditorScreen } from '../screens/GuideEditorScreen'; // Import GuideEditorScreen
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      // LandingScreen is first, so it loads first
      initialRouteName="Landing"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#f5f9f7' },
      }}
    >
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="GuideDetail"
        component={GuideDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GuideEditor"
        component={GuideEditorScreen}
        options={{ headerShown: false, presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
