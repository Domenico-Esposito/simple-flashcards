import { useWindowDimensions } from 'react-native';

const LARGE_SCREEN_BREAKPOINT = 768;

/**
 * Returns true when the viewport is wider than the breakpoint,
 * regardless of platform (tablet, large phone in landscape, desktop, etc.).
 */
export function useIsLargeScreen(): boolean {
  const { width } = useWindowDimensions();
  return width >= LARGE_SCREEN_BREAKPOINT;
}
