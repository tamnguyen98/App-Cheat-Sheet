/**
 * React Navigation type overrides and composite types.
 * Root stack: MainTabs, GuideDetail. Tabs: Home, Library, Settings.
 */

import type {
  CompositeNavigationProp,
  NavigatorScreenParams,
  NavigationContainerRefWithCurrent,
  RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

/** Tab bar: Home (browse), Library, Settings */
export type RootTabParamList = {
  Search: undefined;
  Home: undefined;
  Library: undefined;
  Settings: undefined;
};

/** Root stack: tabs + guide detail */
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<RootTabParamList>;
  GuideDetail: { guideId: string };
};

/** Navigation prop when inside a root stack screen (e.g. GuideDetail). */
export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;

/** Navigation prop when inside a tab screen. */
export type RootTabNavigationProp<T extends keyof RootTabParamList> =
  BottomTabNavigationProp<RootTabParamList, T>;

/** Composite: from any screen, can navigate to stack or tab targets. */
export type AppNavigationProp = CompositeNavigationProp<
  RootStackNavigationProp,
  RootTabNavigationProp<keyof RootTabParamList>
>;

/** Route prop for GuideDetail screen */
export type GuideDetailRouteProp = RouteProp<RootStackParamList, 'GuideDetail'>;

/** Root navigation container ref (for useAppNavigation). */
export type RootNavigationRef = NavigationContainerRefWithCurrent<RootStackParamList>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}
