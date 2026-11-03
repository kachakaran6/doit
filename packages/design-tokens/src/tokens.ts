/**
 * DoIt Design Tokens — Premium System
 * 02-SURFACE-SYSTEM.md & 03-TYPE-SYSTEM.md
 */

import { typographyScale, TypographyVariant, computeTracking } from './type';

export * from './type';

export const neutrals = {
  light: {
    bg: '#FFFFFF',
    bgSubtle: '#F6F7F9',
    surface: '#FFFFFF',
    surfaceRaised: '#F6F7F9',
    surfaceOverlay: '#ECEEF2',
    surfaceSubtle: '#F6F7F9',
    border: '#E4E6EB',
    borderSubtle: '#ECEEF2',
    borderStrong: '#D4D7E0',
    highlight: 'rgba(0,0,0,0.03)',
    text: '#111215',
    textPrimary: '#111215',
    textSecondary: '#6B707B',
    textTertiary: '#9DA2AD',
    textMuted: '#9DA2AD',
    overlay: 'rgba(0,0,0,0.32)',
  },
  dark: {
    bg: '#08090A',            // L0 Canvas
    bgSubtle: '#0F1012',
    surface: '#0F1012',       // L1 Cards, list rows
    surfaceRaised: '#16181B', // L2 Inputs, chips, stat tiles
    surfaceOverlay: '#1D2024',// L3 Selected chips, pressed states
    surfaceSubtle: '#16181B',
    border: 'rgba(255,255,255,0.08)',
    borderSubtle: 'rgba(255,255,255,0.05)',
    borderStrong: 'rgba(255,255,255,0.12)',
    highlight: 'rgba(255,255,255,0.06)', // 1px top highlight
    text: '#F4F5F6',
    textPrimary: '#F4F5F6',
    textSecondary: '#8F94A0',
    textTertiary: '#5C606A',
    textMuted: '#5C606A',
    overlay: 'rgba(0,0,0,0.64)',
  },
} as const;

export const semantics = {
  light: {
    success: '#16A34A',
    warning: '#D97706',
    danger: '#DC2626',
    info: '#2563EB',
  },
  dark: {
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
  },
} as const;

export const accents = {
  indigo: {
    name: 'Indigo',
    primary: '#5B5FC7',
    primaryDark: '#7775D8',
    onPrimary: '#FFFFFF',
    containerLight: '#EEF0FE',
    containerDark: '#1E1F30',
    softLight: '#F1F2FD',
    softDark: '#1A1B29',
    accentTextLight: '#4B4FA8',
    accentTextDark: '#9B99E8',
  },
  teal: {
    name: 'Teal',
    primary: '#0D9488',
    primaryDark: '#14B8A6',
    onPrimary: '#FFFFFF',
    containerLight: '#E6F7F5',
    containerDark: '#0D2926',
    softLight: '#EDFAF8',
    softDark: '#0B2220',
    accentTextLight: '#0F766E',
    accentTextDark: '#2DD4BF',
  },
  amber: {
    name: 'Amber',
    primary: '#D97706',
    primaryDark: '#F59E0B',
    onPrimary: '#FFFFFF',
    containerLight: '#FEF3C7',
    containerDark: '#2E200B',
    softLight: '#FFFBEB',
    softDark: '#241908',
    accentTextLight: '#B45309',
    accentTextDark: '#FBBF24',
  },
  rose: {
    name: 'Rose',
    primary: '#E11D48',
    primaryDark: '#FB7185',
    onPrimary: '#FFFFFF',
    containerLight: '#FFE4E6',
    containerDark: '#33121A',
    softLight: '#FFF1F2',
    softDark: '#270C13',
    accentTextLight: '#BE123C',
    accentTextDark: '#FDA4AF',
  },
  violet: {
    name: 'Violet',
    primary: '#7C3AED',
    primaryDark: '#A78BFA',
    onPrimary: '#FFFFFF',
    containerLight: '#EDE9FE',
    containerDark: '#23143F',
    softLight: '#F5F3FF',
    softDark: '#1B0E33',
    accentTextLight: '#6D28D9',
    accentTextDark: '#C4B5FD',
  },
} as const;

export type AccentName = keyof typeof accents;

export const accentKeys: AccentName[] = ['indigo', 'teal', 'amber', 'rose', 'violet'];

/**
 * 04-COLOUR-AS-INFORMATION.md §4.4
 * Deterministic mapping from any entity id or string to one of the five accents.
 */
export function accentFor(id: string = '') {
  let hash = 0;
  const str = String(id || 'default');
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % accentKeys.length;
  const name: AccentName = accentKeys[index] || 'indigo';
  const item = accents[name];
  return {
    name,
    primary: item.primary,
    primaryDark: item.primaryDark,
    containerLight: item.containerLight,
    containerDark: item.containerDark,
    accentTextLight: item.accentTextLight,
    accentTextDark: item.accentTextDark,
    tintLight: `${item.primary}1F`, // ~12% opacity
    tintDark: `${item.primaryDark}24`, // ~14% opacity
  };
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

/**
 * 02-SURFACE-SYSTEM.md §2.6
 * Radius by role:
 * sm: 12 - inputs, small chips, label pills
 * md: 16 - buttons, stat tiles
 * lg: 20 - cards, list rows
 * xl: 28 - sheets, project hero card
 * pill: 999
 */
export const radius = {
  xs: 4,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const typography = typographyScale;

export const dimensions = {
  buttonHeight: 44,
  buttonHeightSm: 36,
  inputHeight: 44,
  rowHeight: 48,
  rowHeightSm: 40,
  touchTarget: 44,
  iconXs: 14,
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  iconXl: 28,
  cardPadding: 16,
  screenPadding: 16,
} as const;

/**
 * 02-SURFACE-SYSTEM.md §2.4 Shadows
 * Used for separation from content beneath floating elements, never on static cards.
 */
export const elevation = {
  e0: {
    shadowOpacity: 0,
    elevation: 0,
  },
  e1: {
    // Subtle tile separation
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  e2: {
    // Stat tiles / popovers
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.20,
    shadowRadius: 10,
    elevation: 4,
  },
  e3: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  e4: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 32,
    elevation: 16,
  },
  navbar: {
    // 0 8px 32px rgba(0,0,0,0.55)
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 32,
    elevation: 12,
  },
  fab: {
    // 0 6px 20px rgba(0,0,0,0.45)
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 8,
  },
  sheet: {
    // 0 -12px 40px rgba(0,0,0,0.60)
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.60,
    shadowRadius: 40,
    elevation: 16,
  },
  toast: {
    // 0 8px 24px rgba(0,0,0,0.50)
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.50,
    shadowRadius: 24,
    elevation: 10,
  },
} as const;
