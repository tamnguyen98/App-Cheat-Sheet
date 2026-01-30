/**
 * Provides root navigation ref so goToHome / resetToHome / goToGuide work from any screen.
 */

import React, { createContext, useContext, type RefObject } from 'react';
import type { RootNavigationRef } from '../navigation/types';

const NavigationRefContext = createContext<RefObject<RootNavigationRef | null> | null>(null);

export function NavigationRefProvider({
  navigationRef,
  children,
}: {
  navigationRef: RefObject<RootNavigationRef | null>;
  children: React.ReactNode;
}) {
  return (
    <NavigationRefContext.Provider value={navigationRef}>
      {children}
    </NavigationRefContext.Provider>
  );
}

export function useNavigationRef(): RefObject<RootNavigationRef | null> | null {
  return useContext(NavigationRefContext);
}
