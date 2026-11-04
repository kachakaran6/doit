import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const NAVBAR_HEIGHT = 64;
export const NAVBAR_MARGIN = 16;
export const NAVBAR_BOTTOM_OFFSET = 8;
export const ACCESSORY_BAR_HEIGHT = 48;

/**
 * P-02 useBottomInsets():
 * 09-PROMPTS/P-02-shell.md & 07-PLATFORM-CRAFT.md §7.3
 * The single, authoritative source of bottom offsets across all screens and sheets.
 * Guarantees every scroll container clears the floating navbar with zero arbitrary numeric margins.
 */
export function useBottomInsets() {
  const insets = useSafeAreaInsets();

  const navbarBottom = insets.bottom + NAVBAR_BOTTOM_OFFSET;
  const totalNavbarFootprint = NAVBAR_HEIGHT + navbarBottom;
  // Last element to navbar: 24pt rhythm gap per 06-COMPOSITION.md §6.2
  const scrollPaddingBottom = totalNavbarFootprint + 24;

  // Sheet footer padding: accessory height + 12pt gap
  const sheetFooterPaddingBottom = ACCESSORY_BAR_HEIGHT + 12;

  return {
    insets,
    navbarHeight: NAVBAR_HEIGHT,
    navbarBottom,
    totalNavbarFootprint,
    scrollPaddingBottom,
    sheetFooterPaddingBottom,
  };
}

