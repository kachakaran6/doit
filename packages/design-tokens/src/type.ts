/**
 * DoIt Premium Type System
 * 03-TYPE-SYSTEM.md & 02-design-language.md
 */

export type FontWeightToken = '400' | '500' | '600' | '700';

export interface TypographySpec {
  fontSize: number;
  lineHeight: number;
  fontWeight: FontWeightToken;
  letterSpacing: number;
  fontFamily: string;
  textTransform?: 'uppercase' | 'none';
  fontVariant?: ('tabular-nums')[];
}

/**
 * Optical tracking computation:
 * size >= 32  → tracking -1.0
 * size 28–31  → tracking -0.5 (largeTitle: 30px -> -0.5)
 * size 24–27  → tracking -0.4
 * size 18–23  → tracking -0.2
 * size 15–17  → tracking  0
 * size 12–14  → tracking +0.1 to +0.2
 * size <= 11  → tracking +0.8 (tab / uppercase labels)
 */
export function computeTracking(fontSize: number): number {
  if (fontSize >= 32) return -1.0;
  if (fontSize >= 28) return -0.5;
  if (fontSize >= 24) return -0.4;
  if (fontSize >= 18) return -0.2;
  if (fontSize >= 15) return 0;
  if (fontSize >= 12) return 0.2;
  return 0.8;
}

export const FONT_FAMILY = 'Inter';

export const typographyScale = {
  // Canonical 8-Level Inter Scale
  largeTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    fontFamily: FONT_FAMILY,
  },
  title1: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600' as const,
    letterSpacing: computeTracking(24),
    fontFamily: FONT_FAMILY,
  },
  title2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600' as const,
    letterSpacing: computeTracking(22),
    fontFamily: FONT_FAMILY,
  },
  title3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
    letterSpacing: computeTracking(18),
    fontFamily: FONT_FAMILY,
  },
  headline: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as const,
    letterSpacing: computeTracking(16),
    fontFamily: FONT_FAMILY,
  },
  body: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '400' as const,
    letterSpacing: computeTracking(15),
    fontFamily: FONT_FAMILY,
  },
  callout: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '400' as const,
    letterSpacing: 0.1,
    fontFamily: FONT_FAMILY,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
    letterSpacing: computeTracking(12),
    fontFamily: FONT_FAMILY,
  },
  tab: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '600' as const,
    letterSpacing: 0.8,
    fontFamily: FONT_FAMILY,
  },

  // Specialized Tabular/Numeric Styles
  meta: {
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: '500' as const,
    letterSpacing: computeTracking(12),
    fontFamily: FONT_FAMILY,
    fontVariant: ['tabular-nums' as const],
  },
  numeric: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600' as const,
    letterSpacing: computeTracking(15),
    fontFamily: FONT_FAMILY,
    fontVariant: ['tabular-nums' as const],
  },

  // Semantic & Role Aliases
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600' as const,
    letterSpacing: computeTracking(22),
    fontFamily: FONT_FAMILY,
  },
  subhead: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '400' as const,
    letterSpacing: 0.1,
    fontFamily: FONT_FAMILY,
  },

  // Legacy Transitional Aliases for Pre-existing Components
  display: {
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '700' as const,
    letterSpacing: computeTracking(40),
    fontFamily: FONT_FAMILY,
  },
  h1: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    fontFamily: FONT_FAMILY,
  },
  h2: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600' as const,
    letterSpacing: computeTracking(24),
    fontFamily: FONT_FAMILY,
  },
  h3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
    letterSpacing: computeTracking(18),
    fontFamily: FONT_FAMILY,
  },
  bodyStrong: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500' as const,
    letterSpacing: computeTracking(15),
    fontFamily: FONT_FAMILY,
  },
  bodySmall: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '400' as const,
    letterSpacing: computeTracking(13),
    fontFamily: FONT_FAMILY,
  },
  secondary: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '400' as const,
    letterSpacing: computeTracking(13),
    fontFamily: FONT_FAMILY,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
    letterSpacing: computeTracking(12),
    fontFamily: FONT_FAMILY,
  },
  eyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600' as const,
    letterSpacing: computeTracking(11),
    fontFamily: FONT_FAMILY,
    textTransform: 'uppercase' as const,
  },
} as const;

export type TypographyVariant = keyof typeof typographyScale;
