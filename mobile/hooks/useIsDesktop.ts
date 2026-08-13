import { useWindowDimensions } from 'react-native';

import { layout } from '@/constants/theme';

export function useIsDesktop() {
  const { width } = useWindowDimensions();
  return width >= layout.desktopBreakpoint;
}

export function useContentWidth() {
  const { width } = useWindowDimensions();
  return Math.min(width, layout.maxContentWidth);
}
