/**
 * Centralized color palette for the app.
 * Includes default and high-contrast palettes (WCAG AA compliant).
 */

export interface ColorPalette {
    // Backgrounds
    background: string;
    surface: string;
    surfaceAlt: string;

    // Text
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    textInverse: string;

    // Primary/Accent
    primary: string;
    primaryLight: string;
    primaryDark: string;

    // Interactive
    border: string;
    borderFocus: string;
    disabled: string;

    // Status
    success: string;
    warning: string;
    error: string;

    // Specific UI elements
    tabBarBackground: string;
    tabBarBorder: string;
    progressBar: string;
    progressFill: string;
    inputPlaceholder: string;
}

/**
 * Default palette (current app colors)
 */
export const defaultPalette: ColorPalette = {
    // Backgrounds
    background: '#f5f9f7',
    surface: '#ffffff',
    surfaceAlt: '#e8f4f0',

    // Text
    textPrimary: '#111111',
    textSecondary: '#333333',
    textTertiary: '#666666',
    textInverse: '#ffffff',

    // Primary/Accent
    primary: '#2d7a5e',
    primaryLight: '#e8f4f0',
    primaryDark: '#1f5742',

    // Interactive
    border: '#cccccc',
    borderFocus: '#2d7a5e',
    disabled: '#e0e0e0',

    // Status
    success: '#2d7a5e',
    warning: '#f59e0b',
    error: '#dc2626',

    // Specific UI elements
    tabBarBackground: '#ffffff',
    tabBarBorder: '#e0e0e0',
    progressBar: '#dddddd',
    progressFill: '#2d7a5e',
    inputPlaceholder: '#666666',
};

/**
 * High-contrast palette (WCAG AA compliant)
 * Ensures minimum 4.5:1 contrast ratio for normal text
 * and 3:1 for large text (18pt+)
 */
export const highContrastPalette: ColorPalette = {
    // Backgrounds - Pure white for maximum contrast
    background: '#ffffff',
    surface: '#ffffff',
    surfaceAlt: '#f0f0f0',

    // Text - Pure black for maximum contrast
    textPrimary: '#000000',
    textSecondary: '#000000',
    textTertiary: '#1a1a1a',
    textInverse: '#ffffff',

    // Primary/Accent - Darker green for better contrast
    primary: '#1a5c45',
    primaryLight: '#e0f0ea',
    primaryDark: '#0f3829',

    // Interactive - Higher contrast borders
    border: '#000000',
    borderFocus: '#1a5c45',
    disabled: '#cccccc',

    // Status - High contrast versions
    success: '#1a5c45',
    warning: '#b45309',
    error: '#991b1b',

    // Specific UI elements
    tabBarBackground: '#ffffff',
    tabBarBorder: '#000000',
    progressBar: '#cccccc',
    progressFill: '#1a5c45',
    inputPlaceholder: '#1a1a1a',
};

/**
 * Get the appropriate palette based on high contrast setting
 */
export function getPalette(highContrast: boolean): ColorPalette {
    return highContrast ? highContrastPalette : defaultPalette;
}
