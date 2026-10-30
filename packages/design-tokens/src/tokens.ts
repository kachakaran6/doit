export const neutrals = {
  light: {
    bg: '#FFFFFF',
    bgSubtle: '#F6F7F9',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    border: '#E4E6EB',
    borderStrong: '#D0D3DA',
    textPrimary: '#101114',
    textSecondary: '#5B616E',
    textTertiary: '#8B919E',
    overlay: 'rgba(0,0,0,0.32)',
  },
  dark: {
    bg: '#0B0C0E',
    bgSubtle: '#131417',
    surface: '#17181C',
    surfaceRaised: '#1E2025',
    border: '#26282E',
    borderStrong: '#33363D',
    textPrimary: '#F2F3F5',
    textSecondary: '#9BA1AC',
    textTertiary: '#6B7280',
    overlay: 'rgba(0,0,0,0.60)',
  },
} as const;

export const semantics = {
  light: {
    success: '#0F9D58',
    warning: '#B45309',
    danger: '#D93025',
    info: '#1A73E8',
  },
  dark: {
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
    info: '#60A5FA',
  },
} as const;

export const accents = {
  indigo: {
    name: 'Indigo',
    primary: '#4F46E5',
    onPrimary: '#FFFFFF',
    containerLight: '#EEF0FE',
    containerDark: '#1E1B4B',
    softLight: '#E8EAFD',
    softDark: '#1C1B3A',
    accentTextDark: '#818CF8', // Lightened for contrast AA > 4.5:1 on dark bg #0B0C0E
  },
  teal: {
    name: 'Teal',
    primary: '#0D9488',
    onPrimary: '#FFFFFF',
    containerLight: '#E6F7F5',
    containerDark: '#0B2E2B',
    softLight: '#DFF3F0',
    softDark: '#0C2A27',
    accentTextDark: '#2DD4BF', // Lightened for contrast AA > 4.5:1
  },
  amber: {
    name: 'Amber',
    primary: '#B45309',
    onPrimary: '#FFFFFF',
    containerLight: '#FDF3E3',
    containerDark: '#33230A',
    softLight: '#FBEBD5',
    softDark: '#2C1F0B',
    accentTextDark: '#FBBF24', // Lightened for contrast AA > 4.5:1
  },
  rose: {
    name: 'Rose',
    primary: '#BE123C',
    onPrimary: '#FFFFFF',
    containerLight: '#FDE9EE',
    containerDark: '#3B0A18',
    softLight: '#FBDCE4',
    softDark: '#330B16',
    accentTextDark: '#FB7185', // Lightened for contrast AA > 4.5:1
  },
  violet: {
    name: 'Violet',
    primary: '#7C3AED',
    onPrimary: '#FFFFFF',
    containerLight: '#F2EBFE',
    containerDark: '#241145',
    softLight: '#EBE0FD',
    softDark: '#20103D',
    accentTextDark: '#A78BFA', // Lightened for contrast AA > 4.5:1
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
  '5xl': 56,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 24, lineHeight: 30, fontWeight: '700' },
  title: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  headline: { fontSize: 15, lineHeight: 20, fontWeight: '600' },
  body: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  bodyMedium: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  captionMedium: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  mono: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
} as const;

export const shadows = {
  floatingNav: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  sheet: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 12,
  },
  bubble: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 10,
  },
} as const;

