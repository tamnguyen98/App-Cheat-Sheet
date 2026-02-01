/**
 * Custom hook to access the current theme palette
 */

import { useAppStore } from '../store/useAppStore';
import { getPalette, ColorPalette } from '../theme/colors';

export function useTheme(): ColorPalette {
    const highContrast = useAppStore((s) => s.highContrast);
    return getPalette(highContrast);
}
