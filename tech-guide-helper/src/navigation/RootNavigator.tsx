/**
 * Root navigator: stack with MainTabs and GuideDetail.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabs } from './MainTabs';
import { GuideDetailScreen } from '../screens/GuideDetailScreen';
import { SearchScreen } from '../screens/SearchScreen'; // Import SearchScreen
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      // SearchScreen is first, so it loads first
      initialRouteName="Search" 
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#f5f9f7' },
      }}
    >
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="GuideDetail"
        component={GuideDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
