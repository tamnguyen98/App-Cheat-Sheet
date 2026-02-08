/**
 * Type-safe app navigation: goToHome, resetToHome (panic button), goToGuide.
 * Uses root navigation ref so these work from any screen (stack or tab).
 */

import { CommonActions } from '@react-navigation/native';
import { useNavigationRef } from '../context/NavigationRefContext';
import type { RootStackParamList } from '../navigation/types';

export function useAppNavigation() {
  const navRef = useNavigationRef();

  function goToHome(): void {
    const root = navRef?.current;
    if (!root?.isReady()) return;
    root.navigate('MainTabs', { screen: 'Browse' });
  }

  /**
   * Reset entire stack and show Browse tab. Use for "Done" and as panic button
   * so seniors don't get stuck in a Back button loop.
   */
  function resetToHome(): void {
    const root = navRef?.current;
    if (!root?.isReady()) return;
    root.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'MainTabs',
            state: {
              index: 0,
              routes: [
                { name: 'Browse' },
                { name: 'Library' },
                { name: 'Settings' },
              ] as const,
            },
          },
        ],
      })
    );
  }

  function goToGuide(guideId: string): void {
    const root = navRef?.current;
    if (!root?.isReady()) return;
    console.log('Navigating to guide:', guideId);
    root.navigate('GuideDetail', { guideId });
  }

  return { goToHome, resetToHome, goToGuide };
}
