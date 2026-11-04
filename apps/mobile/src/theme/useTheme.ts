import { createContext, useContext } from 'react';
import {
  neutrals,
  semantics,
  semanticTokens,
  canonicalAccents,
  accents,
  spacing,
  radius,
  typography,
  dimensions,
  elevation,
  AccentName,
  CanonicalAccentName,
  DEFAULT_ACCENT,
} from '@doit/tokens';

export type ThemeMode = 'system' | 'light' | 'dark';

export type VerifiedAccentName = 'blue' | 'violet' | 'green' | 'orange' | 'rose';
export type LegacyAccentName = 'indigo' | 'teal' | 'amber';
export type Accent = AccentName;

export interface ThemeTextColors {
  primary: string;
  secondary: string;
  tertiary: string;
  muted: string;
}

export interface SemanticToken {
  fill: string;
  text: string;
  soft: string;
}

export interface AccentToken {
  name: string;
  fill: string;
  text: string;
  soft: string;
  onPrimary: string;
  fillLight: string;
  fillDark: string;
  textLight: string;
  textDark: string;
  softLight: string;
  softDark: string;
}

export interface ThemeColors {
  // --- Surface Luminance Ramp (M1/M2 Core Contract) ---
  canvas: string;        // L0 Canvas (#0B0B0E dark, #F4F4F7 light)
  surface1: string;      // L1 Cards, list rows (#141418 dark, #FFFFFF light)
  surface2: string;      // L2 Inputs, chips, stat tiles, sheets (#1C1C22 dark, #F0F0F4 light)
  surface3: string;      // L3 Selected chips, pressed states (#25252C dark, #E8E8EE light)
  hairline: string;      // 1px separators (rgba(255,255,255,0.07) dark, rgba(0,0,0,0.08) light)

  // --- Text Hierarchy Levels (M1/M2 Core Contract) ---
  text: ThemeTextColors & string; // Object { primary, secondary, tertiary, muted } with string fallback
  textPrimary: string;   // Flat alias (#F5F5F7 dark, #16161A light)
  textSecondary: string; // Flat alias (#A3A3AD dark, #5B5B66 light)
  textTertiary: string;  // Flat alias (#868691 dark, #6B6B77 light)
  textMuted: string;     // Flat alias for tertiary/eyebrow labels

  // --- Active Accent (dynamically resolved for active accent & theme) ---
  accent: string;            // Active accent fill (e.g. #3A66F2 dark, #2F5BEA light)
  accentFill: string;        // Active accent fill alias
  accentText: string;        // Active accent high-contrast text (e.g. #8FAEFF dark, #2750D8 light)
  accentSoft: string;        // Active accent 12-16% soft tint fill
  accentOnPrimary: string;   // Text on accent button (#FFFFFF)
  accentContainer: string;   // Soft container alias

  // --- 5 Verified Accents (Direct access) ---
  accents: Record<VerifiedAccentName, AccentToken>;

  // --- Semantic Scales - Flat Strings (React Native style props safe) ---
  success: string;
  successText: string;
  successSoft: string;
  warning: string;
  warningText: string;
  warningSoft: string;
  danger: string;
  dangerText: string;
  dangerSoft: string;
  info: string;

  // --- Rich Structured Semantics ---
  semantics: {
    success: SemanticToken;
    warning: SemanticToken;
    danger: SemanticToken;
    info: SemanticToken;
  };
  semantic: {
    success: SemanticToken;
    warning: SemanticToken;
    danger: SemanticToken;
    info: SemanticToken;
  };

  // --- Backwards Compatibility Aliases ---
  bg: string;             // Alias for canvas
  bgSubtle: string;       // Alias for surface1
  surface: string;        // Alias for surface1
  surfaceRaised: string;  // Alias for surface2
  surfaceOverlay: string; // Alias for surface3
  surfaceSubtle: string;  // Alias for surface2
  border: string;         // Alias for hairline
  borderSubtle: string;   // Alias for hairline
  borderStrong: string;   // Border strong
  highlight: string;      // 1px top highlight
  overlay: string;        // Backdrop overlay
  white: string;          // '#FFFFFF'
}

export interface ThemeContextValue {
  mode: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  accent: Accent;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  dimensions: typeof dimensions;
  elevation: typeof elevation;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: Accent) => void;
}

export const VERIFIED_ACCENTS: Record<VerifiedAccentName, {
  name: string;
  fillLight: string;
  fillDark: string;
  textLight: string;
  textDark: string;
  softLight: string;
  softDark: string;
}> = {
  blue: {
    name: canonicalAccents.blue.name,
    fillLight: canonicalAccents.blue.fillLight,
    fillDark: canonicalAccents.blue.fillDark,
    textLight: canonicalAccents.blue.textLight,
    textDark: canonicalAccents.blue.textDark,
    softLight: canonicalAccents.blue.softLight,
    softDark: canonicalAccents.blue.softDark,
  },
  violet: {
    name: canonicalAccents.violet.name,
    fillLight: canonicalAccents.violet.fillLight,
    fillDark: canonicalAccents.violet.fillDark,
    textLight: canonicalAccents.violet.textLight,
    textDark: canonicalAccents.violet.textDark,
    softLight: canonicalAccents.violet.softLight,
    softDark: canonicalAccents.violet.softDark,
  },
  green: {
    name: canonicalAccents.green.name,
    fillLight: canonicalAccents.green.fillLight,
    fillDark: canonicalAccents.green.fillDark,
    textLight: canonicalAccents.green.textLight,
    textDark: canonicalAccents.green.textDark,
    softLight: canonicalAccents.green.softLight,
    softDark: canonicalAccents.green.softDark,
  },
  orange: {
    name: canonicalAccents.orange.name,
    fillLight: canonicalAccents.orange.fillLight,
    fillDark: canonicalAccents.orange.fillDark,
    textLight: canonicalAccents.orange.textLight,
    textDark: canonicalAccents.orange.textDark,
    softLight: canonicalAccents.orange.softLight,
    softDark: canonicalAccents.orange.softDark,
  },
  rose: {
    name: canonicalAccents.rose.name,
    fillLight: canonicalAccents.rose.fillLight,
    fillDark: canonicalAccents.rose.fillDark,
    textLight: canonicalAccents.rose.textLight,
    textDark: canonicalAccents.rose.textDark,
    softLight: canonicalAccents.rose.softLight,
    softDark: canonicalAccents.rose.softDark,
  },
};

export const ACCENT_ALIASES: Record<string, VerifiedAccentName> = Object.assign(
  Object.create(null),
  {
    indigo: 'blue',
    teal: 'green',
    amber: 'orange',
  }
);

export function normalizeAccent(accent: string = ''): VerifiedAccentName {
  if (typeof accent !== 'string') {
    return DEFAULT_ACCENT;
  }
  const clean = accent.trim().toLowerCase();
  if (Object.prototype.hasOwnProperty.call(ACCENT_ALIASES, clean)) {
    return ACCENT_ALIASES[clean] as VerifiedAccentName;
  }
  if (clean === 'blue' || clean === 'violet' || clean === 'green' || clean === 'orange' || clean === 'rose') {
    return clean as VerifiedAccentName;
  }
  return DEFAULT_ACCENT;
}

export function buildThemeColors(resolvedTheme: 'light' | 'dark', accent: Accent): ThemeColors {
  const isDark = resolvedTheme === 'dark';
  const activeAccentKey = normalizeAccent(accent);
  const neutral = neutrals[resolvedTheme];
  const semanticFlat = semantics[resolvedTheme];
  const semanticGroup = semanticTokens[resolvedTheme];

  // Build text object with string fallback via toString
  const textObject: any = {
    primary: neutral.textPrimary,
    secondary: neutral.textSecondary,
    tertiary: neutral.textTertiary,
    muted: neutral.textMuted,
  };
  Object.defineProperty(textObject, 'toString', {
    value: () => neutral.textPrimary,
    enumerable: false,
  });
  Object.defineProperty(textObject, 'valueOf', {
    value: () => neutral.textPrimary,
    enumerable: false,
  });

  // Build 5 accents map
  const verifiedKeys: VerifiedAccentName[] = ['blue', 'violet', 'green', 'orange', 'rose'];
  const accentsMap: Record<VerifiedAccentName, AccentToken> = {} as Record<VerifiedAccentName, AccentToken>;

  verifiedKeys.forEach((key) => {
    const item = VERIFIED_ACCENTS[key];
    accentsMap[key] = {
      name: item.name,
      fill: isDark ? item.fillDark : item.fillLight,
      text: isDark ? item.textDark : item.textLight,
      soft: isDark ? item.softDark : item.softLight,
      onPrimary: '#FFFFFF',
      fillLight: item.fillLight,
      fillDark: item.fillDark,
      textLight: item.textLight,
      textDark: item.textDark,
      softLight: item.softLight,
      softDark: item.softDark,
    };
  });

  const activeAccent = accentsMap[activeAccentKey] || accentsMap.blue;

  return {
    // Surface Ramp
    canvas: neutral.canvas,
    surface1: neutral.surface1,
    surface2: neutral.surface2,
    surface3: neutral.surface3,
    hairline: neutral.hairline,

    // Text Hierarchy
    text: textObject,
    textPrimary: neutral.textPrimary,
    textSecondary: neutral.textSecondary,
    textTertiary: neutral.textTertiary,
    textMuted: neutral.textMuted,

    // Active Accent
    accent: activeAccent.fill,
    accentFill: activeAccent.fill,
    accentText: activeAccent.text,
    accentSoft: activeAccent.soft,
    accentOnPrimary: '#FFFFFF',
    accentContainer: activeAccent.soft,

    // 5 Verified Accents
    accents: accentsMap,

    // Semantics
    success: semanticFlat.success,
    successText: semanticGroup.success.text,
    successSoft: semanticGroup.success.soft,
    warning: semanticFlat.warning,
    warningText: semanticGroup.warning.text,
    warningSoft: semanticGroup.warning.soft,
    danger: semanticFlat.danger,
    dangerText: semanticGroup.danger.text,
    dangerSoft: semanticGroup.danger.soft,
    info: semanticFlat.info,

    semantics: {
      success: semanticGroup.success,
      warning: semanticGroup.warning,
      danger: semanticGroup.danger,
      info: semanticGroup.info,
    },
    semantic: {
      success: semanticGroup.success,
      warning: semanticGroup.warning,
      danger: semanticGroup.danger,
      info: semanticGroup.info,
    },

    // Compatibility Aliases
    bg: neutral.canvas,
    bgSubtle: neutral.surface1,
    surface: neutral.surface1,
    surfaceRaised: neutral.surface2,
    surfaceOverlay: neutral.surface3,
    surfaceSubtle: neutral.surface2,
    border: neutral.hairline,
    borderSubtle: neutral.hairline,
    borderStrong: neutral.borderStrong,
    highlight: neutral.highlight,
    overlay: neutral.overlay,
    white: neutral.white,
  };
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
