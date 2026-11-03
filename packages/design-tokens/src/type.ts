/**
 * DoIt Premium Type System
 * 03-TYPE-SYSTEM.md
 */

export type FontWeightToken = '400' | '500' | '600';

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
 * Rule 2 — tracking is size-dependent:
 * size >= 32  → tracking -1.0
 * size 24–31  → tracking -0.4 (or -0.6 for 30px)
 * size 18–23  → tracking -0.2 (or -0.1 for 18px)
 * size 15–17  → tracking  0
 * size 12–14  → tracking +0.2
 * size <= 11  → tracking +0.8 (uppercase labels only)
 */
export function computeTracking(fontSize: number): number {
  if (fontSize >= 32) return -1.0;
  if (fontSize >= 28) return -0.6;
  if (fontSize >= 24) return -0.4;
  if (fontSize >= 18) return -0.2;
  if (fontSize >= 15) return 0;
  if (fontSize >= 12) return 0.2;
  return 0.8;
}

export const FONT_FAMILY = 'Inter';

export const typographyScale = {
  display: {
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '600' as const,
    letterSpacing: computeTracking(40),
    fontFamily: FONT_FAMILY,
  },
  h1: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '600' as const,
    letterSpacing: computeTracking(30),
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
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
    letterSpacing: computeTracking(15),
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
  // Transitional alias for older screens before their dedicated overhaul
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
  // Transitional alias for existing screens before their dedicated prompt (P-03...P-06)
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
    letterSpacing: computeTracking(12),
    fontFamily: FONT_FAMILY,
  },
  numeric: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600' as const,
    letterSpacing: computeTracking(15),
    fontFamily: FONT_FAMILY,
    fontVariant: ['tabular-nums' as const],
  },
} as const;

export type TypographyVariant = keyof typeof typographyScale;
