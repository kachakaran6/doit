/**
 * Samyukt Design Tokens
 * Master Design System - Linear / Plane / Things 3 / Notion Inspired
 */

export const neutrals = {
  light: {
    bg: '#F7F8FA',
    bgSubtle: '#F1F2F5',
    surface: '#FFFFFF',
    surfaceRaised: '#F1F2F5',
    surfaceSubtle: '#E9EBEF',
    border: '#E4E4E7',
    borderStrong: '#D4D4D8',
    textPrimary: '#18181B',
    textSecondary: '#52525B',
    textTertiary: '#8A8A94',
    overlay: 'rgba(0,0,0,0.32)',
  },
  dark: {
    bg: '#101113',
    bgSubtle: '#17191C',
    surface: '#17191C',
    surfaceRaised: '#1D2024',
    surfaceSubtle: '#23262B',
    border: '#2B2E33',
    borderStrong: '#3A3E45',
    textPrimary: '#F3F4F6',
    textSecondary: '#A1A1AA',
    textTertiary: '#71717A',
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

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 30, lineHeight: 36, fontWeight: '700' as const },
  h1: { fontSize: 24, lineHeight: 30, fontWeight: '600' as const },
  h2: { fontSize: 18, lineHeight: 24, fontWeight: '600' as const },
  h3: { fontSize: 16, lineHeight: 22, fontWeight: '600' as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '500' as const },
  secondary: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  caption: { fontSize: 11, lineHeight: 15, fontWeight: '500' as const, letterSpacing: 0.3 },
} as const;

export type TypographyVariant = keyof typeof typography;

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

export const elevation = {
  e1: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  e2: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  e3: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  e4: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 16,
  },
} as const;
