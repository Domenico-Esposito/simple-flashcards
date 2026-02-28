/**
 * App-wide semantic color palette.
 *
 * Every hardcoded color used across components should reference this map
 * so that a palette change only requires editing this single file.
 *
 * Colors that are part of the Tamagui theme (e.g. $background, $color, $primary)
 * should still be used via theme tokens. This file covers colors that sit
 * outside of Tamagui's token system — status colors, chart colors, icon tints, etc.
 */

export type ColorScheme = 'light' | 'dark';

const palette = {
  light: {
    /** Primary brand / accent blue */
    accent: '#3B82F6',
    /** Success green (correct answers, positive indicators) */
    success: '#4CD964',
    /** Error red (incorrect answers, destructive actions) */
    error: '#FF3B30',
    /** Muted icon/text color */
    muted: '#888888',
    /** Card background */
    cardBg: '#FFFFFF',
    /** Shadow color for cards */
    shadow: 'rgba(23,23,23,0.2)',
    /** Close/action icon color */
    iconDefault: '#000',
    /** Active dot / progress indicator */
    dotActive: '#3B82F6',
    /** Inactive dot / progress indicator */
    dotInactive: '#D4D4D4',
    /** Text on colored buttons */
    onAccent: '#FFFFFF',

    /** Success background tint */
    successBgTint: 'rgba(76, 217, 100, 0.1)',
    /** Error background tint */
    errorBgTint: 'rgba(255, 59, 48, 0.1)',
    /** Accent background tint */
    accentBgTint: 'rgba(59, 130, 246, 0.1)',
    /** Success shadow */
    successShadow: 'rgba(76,217,100,0.4)',
    /** Error shadow */
    errorShadow: 'rgba(255,59,48,0.4)',

    /** Toolbar active text/icon */
    toolbarActive: '#3B82F6',
    /** Toolbar inactive text/icon */
    toolbarInactive: '#737373',
    /** Toolbar active background */
    toolbarActiveBg: 'rgba(59, 130, 246, 0.1)',
    /** Toolbar container background */
    toolbarBg: '#F5F5F5',

    /** Neutral chip / time row background */
    chipBg: '#F5F5F5',

    /** Text input color */
    textInput: '#171717',
    /** Placeholder text color */
    placeholder: '#A3A3A3',
  },
  dark: {
    accent: '#60A5FA',
    success: '#4CD964',
    error: '#FF3B30',
    muted: '#888888',
    cardBg: '#171717',
    shadow: 'rgba(100,100,100,0.2)',
    iconDefault: '#FFF',
    dotActive: '#60A5FA',
    dotInactive: '#404040',
    onAccent: '#FFFFFF',

    successBgTint: 'rgba(76, 217, 100, 0.15)',
    errorBgTint: 'rgba(255, 59, 48, 0.15)',
    accentBgTint: 'rgba(96, 165, 250, 0.15)',
    successShadow: 'rgba(76,217,100,0.4)',
    errorShadow: 'rgba(255,59,48,0.4)',

    toolbarActive: '#60A5FA',
    toolbarInactive: '#A3A3A3',
    toolbarActiveBg: 'rgba(96, 165, 250, 0.15)',
    /** Toolbar container background */
    toolbarBg: '#262626',

    chipBg: '#262626',

    /** Text input color */
    textInput: '#FAFAFA',
    /** Placeholder text color */
    placeholder: '#737373',
  },
} as const;

/**
 * Return the semantic colors for the given color scheme.
 */
export function getColors(scheme: ColorScheme) {
  return palette[scheme];
}

/** Chart-specific colors (scheme-independent) */
export const chartColors = {
  correct: '#4CD964',
  incorrect: '#FF3B30',
  barColors: ['#4CD964', '#FF3B30'] as [string, string],
};

/** KPI icon colors (scheme-independent) */
export const kpiColors = {
  quizzes: '#3B82F6',
  accuracy: '#4CD964',
  answers: '#FF9500',
  totalTime: '#AF52DE',
  avgTime: '#FF2D55',
};
