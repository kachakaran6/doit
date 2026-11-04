/**
 * DoIt Design Tokens — Premium System
 * 02-design-language.md & premium-tokens.json
 */

import { typographyScale, TypographyVariant, computeTracking, FONT_FAMILY } from './type';

export * from './type';

export interface SemanticTokenGroup {
  fill: string;
  text: string;
  soft: string;
}

export interface AccentToken {
  name: string;
  fillLight: string;
  fillDark: string;
  textLight: string;
  textDark: string;
  softLight: string;
  softDark: string;
  // Backwards compatibility properties
  primary: string;
  primaryDark: string;
  onPrimary: string;
  containerLight: string;
  containerDark: string;
  accentTextLight: string;
  accentTextDark: string;
}

export const neutrals = {
  light: {
    // Canonical 8% Luminance Ramp
    canvas: '#F4F4F7',
    surface1: '#FFFFFF',
    surface2: '#F0F0F4',
    surface3: '#E8E8EE',
    hairline: 'rgba(0,0,0,0.08)',

    // Text Hierarchy
    text: {
      primary: '#16161A',
      secondary: '#5B5B66',
      tertiary: '#6B6B77',
    },

    // Flat Text Aliases
    textPrimary: '#16161A',
    textSecondary: '#5B5B66',
    textTertiary: '#6B6B77',
    textMuted: '#6B6B77',

    // Backwards Compatibility Aliases
    bg: '#F4F4F7',
    bgSubtle: '#F0F0F4',
    surface: '#FFFFFF',
    surfaceRaised: '#F0F0F4',
    surfaceOverlay: '#E8E8EE',
    surfaceSubtle: '#F0F0F4',
    border: 'rgba(0,0,0,0.08)',
    borderSubtle: 'rgba(0,0,0,0.04)',
    borderStrong: 'rgba(0,0,0,0.12)',
    highlight: 'rgba(0,0,0,0.03)',
    overlay: 'rgba(0,0,0,0.32)',
    white: '#FFFFFF',
  },
  dark: {
    // Canonical 8% Luminance Ramp
    canvas: '#0B0B0E',
    surface1: '#141418',
    surface2: '#1C1C22',
    surface3: '#25252C',
    hairline: 'rgba(255,255,255,0.07)',

    // Text Hierarchy
    text: {
      primary: '#F5F5F7',
      secondary: '#A3A3AD',
      tertiary: '#868691',
    },

    // Flat Text Aliases
    textPrimary: '#F5F5F7',
    textSecondary: '#A3A3AD',
    textTertiary: '#868691',
    textMuted: '#868691',

    // Backwards Compatibility Aliases
    bg: '#0B0B0E',
    bgSubtle: '#141418',
    surface: '#141418',
    surfaceRaised: '#1C1C22',
    surfaceOverlay: '#25252C',
    surfaceSubtle: '#1C1C22',
    border: 'rgba(255,255,255,0.07)',
    borderSubtle: 'rgba(255,255,255,0.05)',
    borderStrong: 'rgba(255,255,255,0.12)',
    highlight: 'rgba(255,255,255,0.06)',
    overlay: 'rgba(0,0,0,0.64)',
    white: '#FFFFFF',
  },
} as const;

export const semanticTokens = {
  light: {
    success: { fill: '#0E8550', text: '#18794E', soft: 'rgba(14,133,80,0.10)' },
    warning: { fill: '#A15E00', text: '#9A5B00', soft: 'rgba(178,106,0,0.10)' },
    danger:  { fill: '#C93C35', text: '#C8322B', soft: 'rgba(201,60,53,0.09)' },
    info:    { fill: '#2563EB', text: '#2563EB', soft: 'rgba(37,99,235,0.12)' },
  },
  dark: {
    success: { fill: '#0E8550', text: '#5FD38D', soft: 'rgba(95,211,141,0.14)' },
    warning: { fill: '#A15E00', text: '#FFB84D', soft: 'rgba(255,184,77,0.14)' },
    danger:  { fill: '#C93C35', text: '#FF7A72', soft: 'rgba(255,122,114,0.14)' },
    info:    { fill: '#3B82F6', text: '#60A5FA', soft: 'rgba(59,130,246,0.14)' },
  },
} as const;

// Legacy flat semantic strings ensuring React Native styles receive string color values
export const semantics = {
  light: {
    success: semanticTokens.light.success.text,
    warning: semanticTokens.light.warning.text,
    danger:  semanticTokens.light.danger.text,
    info:    semanticTokens.light.info.text,
  },
  dark: {
    success: semanticTokens.dark.success.text,
    warning: semanticTokens.dark.warning.text,
    danger:  semanticTokens.dark.danger.text,
    info:    semanticTokens.dark.info.text,
  },
} as const;

const createAccent = (
  name: string,
  fillLight: string,
  fillDark: string,
  textLight: string,
  textDark: string,
  softLight: string,
  softDark: string,
): AccentToken => ({
  name,
  fillLight,
  fillDark,
  textLight,
  textDark,
  softLight,
  softDark,
  primary: fillLight,
  primaryDark: fillDark,
  onPrimary: '#FFFFFF',
  containerLight: softLight,
  containerDark: softDark,
  accentTextLight: textLight,
  accentTextDark: textDark,
});

export const canonicalAccents = {
  blue: createAccent(
    'Blue',
    '#2F5BEA',
    '#3A66F2',
    '#2750D8',
    '#8FAEFF',
    'rgba(47,91,234,0.12)',
    'rgba(58,102,242,0.16)',
  ),
  violet: createAccent(
    'Violet',
    '#7B54E8',
    '#7B54E8',
    '#6A3FD6',
    '#B9A3FF',
    'rgba(123,84,232,0.12)',
    'rgba(123,84,232,0.16)',
  ),
  green: createAccent(
    'Green',
    '#0E8550',
    '#0E8550',
    '#18794E',
    '#5FD38D',
    'rgba(14,133,80,0.10)',
    'rgba(95,211,141,0.14)',
  ),
  orange: createAccent(
    'Orange',
    '#C24E07',
    '#C24E07',
    '#B24400',
    '#FFA066',
    'rgba(194,78,7,0.10)',
    'rgba(255,160,102,0.14)',
  ),
  rose: createAccent(
    'Rose',
    '#D6305A',
    '#D6305A',
    '#C1234B',
    '#FF8BA7',
    'rgba(214,48,90,0.10)',
    'rgba(255,139,167,0.14)',
  ),
} as const;

export const accents = {
  ...canonicalAccents,
  // Backwards compatibility aliases
  indigo: canonicalAccents.blue,
  teal: canonicalAccents.green,
  amber: canonicalAccents.orange,
} as const;

export type CanonicalAccentName = keyof typeof canonicalAccents;
export type AccentName = keyof typeof accents;

export const canonicalAccentKeys: CanonicalAccentName[] = ['blue', 'violet', 'green', 'orange', 'rose'];
export const accentKeys: AccentName[] = ['blue', 'violet', 'green', 'orange', 'rose', 'indigo', 'teal', 'amber'];
export const DEFAULT_ACCENT: CanonicalAccentName = 'blue';

export function accentFor(id: string = '') {
  let hash = 0;
  const str = String(id || 'default');
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % canonicalAccentKeys.length;
  const name: CanonicalAccentName = canonicalAccentKeys[index] || 'blue';
  const item = canonicalAccents[name];
  return {
    name,
    primary: item.fillLight,
    primaryDark: item.fillDark,
    onPrimary: item.onPrimary,
    containerLight: item.softLight,
    containerDark: item.softDark,
    accentTextLight: item.textLight,
    accentTextDark: item.textDark,
    softLight: item.softLight,
    softDark: item.softDark,
    fillLight: item.fillLight,
    fillDark: item.fillDark,
    textLight: item.textLight,
    textDark: item.textDark,
    tintLight: item.softLight,
    tintDark: item.softDark,
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
  // Layout semantic dimensions
  screenMargin: 20,
  cardPadding: 16,
  sectionGap: 28,
} as const;

export const radius = {
  xs: 4,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  pill: 999,
  // Semantic component radii
  card: 20,
  sheet: 28,
  input: 14,
  button: 14,
  // Numeric ladder
  r4: 4,
  r8: 8,
  r12: 12,
  r14: 14,
  r16: 16,
  r20: 20,
  r28: 28,
} as const;

export const typography = typographyScale;

export const dimensions = {
  buttonHeight: 44,
  buttonHeightLg: 52,
  buttonHeightSm: 36,
  inputHeight: 44,
  rowHeight: 48,
  rowHeightTall: 56,
  rowHeightSm: 40,
  touchTarget: 44,
  iconXs: 14,
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  iconXl: 28,
  cardPadding: 16,
  screenPadding: 20, // 20pt unified margin
} as const;

export const elevation = {
  e0: {
    shadowOpacity: 0,
    elevation: 0,
  },
  e1: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  e2: {
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 12,
  },
  fab: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  sheet: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.50,
    shadowRadius: 32,
    elevation: 16,
  },
  toast: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.50,
    shadowRadius: 24,
    elevation: 10,
  },
  cardLight: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardDark: {
    shadowOpacity: 0,
    elevation: 0,
  },
} as const;

// Canonical raw tokens object for scripts/contrast.py compliance
export const tokens = {
  dark: {
    canvas: neutrals.dark.canvas,
    surface1: neutrals.dark.surface1,
    surface2: neutrals.dark.surface2,
    surface3: neutrals.dark.surface3,
    hairline: neutrals.dark.hairline,
    text: neutrals.dark.text,
    success: semanticTokens.dark.success,
    warning: semanticTokens.dark.warning,
    danger: semanticTokens.dark.danger,
  },
  light: {
    canvas: neutrals.light.canvas,
    surface1: neutrals.light.surface1,
    surface2: neutrals.light.surface2,
    surface3: neutrals.light.surface3,
    hairline: neutrals.light.hairline,
    text: neutrals.light.text,
    success: semanticTokens.light.success,
    warning: semanticTokens.light.warning,
    danger: semanticTokens.light.danger,
  },
  accents: {
    blue: {
      fillLight: canonicalAccents.blue.fillLight,
      fillDark: canonicalAccents.blue.fillDark,
      textLight: canonicalAccents.blue.textLight,
      textDark: canonicalAccents.blue.textDark,
    },
    violet: {
      fillLight: canonicalAccents.violet.fillLight,
      fillDark: canonicalAccents.violet.fillDark,
      textLight: canonicalAccents.violet.textLight,
      textDark: canonicalAccents.violet.textDark,
    },
    green: {
      fillLight: canonicalAccents.green.fillLight,
      fillDark: canonicalAccents.green.fillDark,
      textLight: canonicalAccents.green.textLight,
      textDark: canonicalAccents.green.textDark,
    },
    orange: {
      fillLight: canonicalAccents.orange.fillLight,
      fillDark: canonicalAccents.orange.fillDark,
      textLight: canonicalAccents.orange.textLight,
      textDark: canonicalAccents.orange.textDark,
    },
    rose: {
      fillLight: canonicalAccents.rose.fillLight,
      fillDark: canonicalAccents.rose.fillDark,
      textLight: canonicalAccents.rose.textLight,
      textDark: canonicalAccents.rose.textDark,
    },
  },
  defaultAccent: DEFAULT_ACCENT,
} as const;
