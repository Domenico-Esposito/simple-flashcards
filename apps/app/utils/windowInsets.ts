import { Platform } from 'react-native';

const IPAD_WINDOW_CONTROLS_TOP_GUARD = 45;

/**
 * In iPad resizable windows, the system window controls can overlap app content.
 * Keep a minimum top inset when needed.
 */
export function getSafeTopInsetForIpadWindowControls(topInset: number): number {
  if (Platform.OS === 'ios' && Platform.isPad) {
    return Math.max(topInset, IPAD_WINDOW_CONTROLS_TOP_GUARD);
  }
  return topInset;
}

/**
 * Header top padding:
 * - iOS modal uses spacing token to align with sheet-style presentation
 * - all other cases use safe inset (including iPad window controls guard)
 */
export function getHeaderTopPadding(topInset: number, isModal: boolean): number | '$2' {
  if (Platform.OS === 'ios' && isModal) {
    return '$2';
  }
  return getSafeTopInsetForIpadWindowControls(topInset);
}

/**
 * Flashcard viewer top padding:
 * - iPad large screen: no top padding
 * - iPad non-large: safe inset plus extra breathing room
 * - all other devices: native top inset
 */
export function getFlashcardViewerTopPadding(topInset: number, isLargeScreen: boolean): number {
  if (Platform.OS === 'ios' && Platform.isPad) {
    if (isLargeScreen) {
      return 0;
    }
    return getSafeTopInsetForIpadWindowControls(topInset) + 10;
  }
  return topInset;
}
