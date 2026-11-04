/**
 * DoIt Design Tokens — Premium System
 * 02-design-language.md & premium-tokens.json
 */
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
    primary: string;
    primaryDark: string;
    onPrimary: string;
    containerLight: string;
    containerDark: string;
    accentTextLight: string;
    accentTextDark: string;
}
export declare const neutrals: {
    readonly light: {
        readonly canvas: "#F4F4F7";
        readonly surface1: "#FFFFFF";
        readonly surface2: "#F0F0F4";
        readonly surface3: "#E8E8EE";
        readonly hairline: "rgba(0,0,0,0.08)";
        readonly text: {
            readonly primary: "#16161A";
            readonly secondary: "#5B5B66";
            readonly tertiary: "#6B6B77";
        };
        readonly textPrimary: "#16161A";
        readonly textSecondary: "#5B5B66";
        readonly textTertiary: "#6B6B77";
        readonly textMuted: "#6B6B77";
        readonly bg: "#F4F4F7";
        readonly bgSubtle: "#F0F0F4";
        readonly surface: "#FFFFFF";
        readonly surfaceRaised: "#F0F0F4";
        readonly surfaceOverlay: "#E8E8EE";
        readonly surfaceSubtle: "#F0F0F4";
        readonly border: "rgba(0,0,0,0.08)";
        readonly borderSubtle: "rgba(0,0,0,0.04)";
        readonly borderStrong: "rgba(0,0,0,0.12)";
        readonly highlight: "rgba(0,0,0,0.03)";
        readonly overlay: "rgba(0,0,0,0.32)";
        readonly white: "#FFFFFF";
    };
    readonly dark: {
        readonly canvas: "#0B0B0E";
        readonly surface1: "#141418";
        readonly surface2: "#1C1C22";
        readonly surface3: "#25252C";
        readonly hairline: "rgba(255,255,255,0.07)";
        readonly text: {
            readonly primary: "#F5F5F7";
            readonly secondary: "#A3A3AD";
            readonly tertiary: "#868691";
        };
        readonly textPrimary: "#F5F5F7";
        readonly textSecondary: "#A3A3AD";
        readonly textTertiary: "#868691";
        readonly textMuted: "#868691";
        readonly bg: "#0B0B0E";
        readonly bgSubtle: "#141418";
        readonly surface: "#141418";
        readonly surfaceRaised: "#1C1C22";
        readonly surfaceOverlay: "#25252C";
        readonly surfaceSubtle: "#1C1C22";
        readonly border: "rgba(255,255,255,0.07)";
        readonly borderSubtle: "rgba(255,255,255,0.05)";
        readonly borderStrong: "rgba(255,255,255,0.12)";
        readonly highlight: "rgba(255,255,255,0.06)";
        readonly overlay: "rgba(0,0,0,0.64)";
        readonly white: "#FFFFFF";
    };
};
export declare const semanticTokens: {
    readonly light: {
        readonly success: {
            readonly fill: "#0E8550";
            readonly text: "#18794E";
            readonly soft: "rgba(14,133,80,0.10)";
        };
        readonly warning: {
            readonly fill: "#A15E00";
            readonly text: "#9A5B00";
            readonly soft: "rgba(178,106,0,0.10)";
        };
        readonly danger: {
            readonly fill: "#C93C35";
            readonly text: "#C8322B";
            readonly soft: "rgba(201,60,53,0.09)";
        };
        readonly info: {
            readonly fill: "#2563EB";
            readonly text: "#2563EB";
            readonly soft: "rgba(37,99,235,0.12)";
        };
    };
    readonly dark: {
        readonly success: {
            readonly fill: "#0E8550";
            readonly text: "#5FD38D";
            readonly soft: "rgba(95,211,141,0.14)";
        };
        readonly warning: {
            readonly fill: "#A15E00";
            readonly text: "#FFB84D";
            readonly soft: "rgba(255,184,77,0.14)";
        };
        readonly danger: {
            readonly fill: "#C93C35";
            readonly text: "#FF7A72";
            readonly soft: "rgba(255,122,114,0.14)";
        };
        readonly info: {
            readonly fill: "#3B82F6";
            readonly text: "#60A5FA";
            readonly soft: "rgba(59,130,246,0.14)";
        };
    };
};
export declare const semantics: {
    readonly light: {
        readonly success: "#18794E";
        readonly warning: "#9A5B00";
        readonly danger: "#C8322B";
        readonly info: "#2563EB";
    };
    readonly dark: {
        readonly success: "#5FD38D";
        readonly warning: "#FFB84D";
        readonly danger: "#FF7A72";
        readonly info: "#60A5FA";
    };
};
export declare const canonicalAccents: {
    readonly blue: AccentToken;
    readonly violet: AccentToken;
    readonly green: AccentToken;
    readonly orange: AccentToken;
    readonly rose: AccentToken;
};
export declare const accents: {
    readonly indigo: AccentToken;
    readonly teal: AccentToken;
    readonly amber: AccentToken;
    readonly blue: AccentToken;
    readonly violet: AccentToken;
    readonly green: AccentToken;
    readonly orange: AccentToken;
    readonly rose: AccentToken;
};
export type CanonicalAccentName = keyof typeof canonicalAccents;
export type AccentName = keyof typeof accents;
export declare const canonicalAccentKeys: CanonicalAccentName[];
export declare const accentKeys: AccentName[];
export declare const DEFAULT_ACCENT: CanonicalAccentName;
export declare function accentFor(id?: string): {
    name: "blue" | "violet" | "green" | "orange" | "rose";
    primary: string;
    primaryDark: string;
    onPrimary: string;
    containerLight: string;
    containerDark: string;
    accentTextLight: string;
    accentTextDark: string;
    softLight: string;
    softDark: string;
    fillLight: string;
    fillDark: string;
    textLight: string;
    textDark: string;
    tintLight: string;
    tintDark: string;
};
export declare const spacing: {
    readonly xs: 4;
    readonly sm: 8;
    readonly md: 12;
    readonly lg: 16;
    readonly xl: 20;
    readonly '2xl': 24;
    readonly '3xl': 32;
    readonly '4xl': 40;
    readonly '5xl': 48;
    readonly screenMargin: 20;
    readonly cardPadding: 16;
    readonly sectionGap: 28;
};
export declare const radius: {
    readonly xs: 4;
    readonly sm: 12;
    readonly md: 16;
    readonly lg: 20;
    readonly xl: 28;
    readonly pill: 999;
    readonly card: 20;
    readonly sheet: 28;
    readonly input: 14;
    readonly button: 14;
    readonly r4: 4;
    readonly r8: 8;
    readonly r12: 12;
    readonly r14: 14;
    readonly r16: 16;
    readonly r20: 20;
    readonly r28: 28;
};
export declare const typography: {
    readonly largeTitle: {
        readonly fontSize: 30;
        readonly lineHeight: 36;
        readonly fontWeight: "700";
        readonly letterSpacing: -0.5;
        readonly fontFamily: "Inter";
    };
    readonly title1: {
        readonly fontSize: 24;
        readonly lineHeight: 30;
        readonly fontWeight: "600";
        readonly letterSpacing: number;
        readonly fontFamily: "Inter";
    };
    readonly title2: {
        readonly fontSize: 22;
        readonly lineHeight: 28;
        readonly fontWeight: "600";
        readonly letterSpacing: number;
        readonly fontFamily: "Inter";
    };
    readonly title3: {
        readonly fontSize: 18;
        readonly lineHeight: 24;
        readonly fontWeight: "600";
        readonly letterSpacing: number;
        readonly fontFamily: "Inter";
    };
    readonly headline: {
        readonly fontSize: 16;
        readonly lineHeight: 22;
        readonly fontWeight: "600";
        readonly letterSpacing: number;
        readonly fontFamily: "Inter";
    };
    readonly body: {
        readonly fontSize: 15;
        readonly lineHeight: 21;
        readonly fontWeight: "400";
        readonly letterSpacing: number;
        readonly fontFamily: "Inter";
    };
    readonly callout: {
        readonly fontSize: 14;
        readonly lineHeight: 19;
        readonly fontWeight: "400";
        readonly letterSpacing: 0.1;
        readonly fontFamily: "Inter";
    };
    readonly caption: {
        readonly fontSize: 12;
        readonly lineHeight: 16;
        readonly fontWeight: "500";
        readonly letterSpacing: number;
        readonly fontFamily: "Inter";
    };
    readonly tab: {
        readonly fontSize: 11;
        readonly lineHeight: 13;
        readonly fontWeight: "600";
        readonly letterSpacing: 0.8;
        readonly fontFamily: "Inter";
    };
    readonly meta: {
        readonly fontSize: 12.5;
        readonly lineHeight: 16;
        readonly fontWeight: "500";
        readonly letterSpacing: number;
        readonly fontFamily: "Inter";
        readonly fontVariant: readonly ["tabular-nums"];
    };
    readonly numeric: {
        readonly fontSize: 15;
        readonly lineHeight: 20;
        readonly fontWeight: "600";
        readonly letterSpacing: number;
        readonly fontFamily: "Inter";
        readonly fontVariant: readonly ["tabular-nums"];
    };
    readonly title: {
        readonly fontSize: 22;
        readonly lineHeight: 28;
        readonly fontWeight: "600";
        readonly letterSpacing: number;
        readonly fontFamily: "Inter";
    };
    readonly subhead: {
        readonly fontSize: 14;
        readonly lineHeight: 19;
        readonly fontWeight: "400";
        readonly letterSpacing: 0.1;
        readonly fontFamily: "Inter";
    };
    readonly display: {
        readonly fontSize: 40;
        readonly lineHeight: 46;
        readonly fontWeight: "700";
        readonly letterSpacing: number;
        readonly fontFamily: "Inter";
    };
    readonly h1: {
        readonly fontSize: 30;
        readonly lineHeight: 36;
        readonly fontWeight: "700";
        readonly letterSpacing: -0.5;
        readonly fontFamily: "Inter";
    };
    readonly h2: {
        readonly fontSize: 24;
        readonly lineHeight: 30;
        readonly fontWeight: "600";
        readonly letterSpacing: number;
        readonly fontFamily: "Inter";
    };
    readonly h3: {
        readonly fontSize: 18;
        readonly lineHeight: 24;
        readonly fontWeight: "600";
        readonly letterSpacing: number;
        readonly fontFamily: "Inter";
    };
    readonly bodyStrong: {
        readonly fontSize: 15;
        readonly lineHeight: 22;
        readonly fontWeight: "500";
        readonly letterSpacing: number;
        readonly fontFamily: "Inter";
    };
    readonly bodySmall: {
        readonly fontSize: 13;
        readonly lineHeight: 19;
        readonly fontWeight: "400";
        readonly letterSpacing: number;
        readonly fontFamily: "Inter";
    };
    readonly secondary: {
        readonly fontSize: 13;
        readonly lineHeight: 19;
        readonly fontWeight: "400";
        readonly letterSpacing: number;
        readonly fontFamily: "Inter";
    };
    readonly label: {
        readonly fontSize: 12;
        readonly lineHeight: 16;
        readonly fontWeight: "500";
        readonly letterSpacing: number;
        readonly fontFamily: "Inter";
    };
    readonly eyebrow: {
        readonly fontSize: 11;
        readonly lineHeight: 14;
        readonly fontWeight: "600";
        readonly letterSpacing: number;
        readonly fontFamily: "Inter";
        readonly textTransform: "uppercase";
    };
};
export declare const dimensions: {
    readonly buttonHeight: 44;
    readonly buttonHeightLg: 52;
    readonly buttonHeightSm: 36;
    readonly inputHeight: 44;
    readonly rowHeight: 48;
    readonly rowHeightTall: 56;
    readonly rowHeightSm: 40;
    readonly touchTarget: 44;
    readonly iconXs: 14;
    readonly iconSm: 16;
    readonly iconMd: 20;
    readonly iconLg: 24;
    readonly iconXl: 28;
    readonly cardPadding: 16;
    readonly screenPadding: 20;
};
export declare const elevation: {
    readonly e0: {
        readonly shadowOpacity: 0;
        readonly elevation: 0;
    };
    readonly e1: {
        readonly shadowColor: "#000000";
        readonly shadowOffset: {
            readonly width: 0;
            readonly height: 2;
        };
        readonly shadowOpacity: 0.12;
        readonly shadowRadius: 4;
        readonly elevation: 2;
    };
    readonly e2: {
        readonly shadowColor: "#000000";
        readonly shadowOffset: {
            readonly width: 0;
            readonly height: 4;
        };
        readonly shadowOpacity: 0.2;
        readonly shadowRadius: 10;
        readonly elevation: 4;
    };
    readonly e3: {
        readonly shadowColor: "#000000";
        readonly shadowOffset: {
            readonly width: 0;
            readonly height: 8;
        };
        readonly shadowOpacity: 0.35;
        readonly shadowRadius: 20;
        readonly elevation: 8;
    };
    readonly e4: {
        readonly shadowColor: "#000000";
        readonly shadowOffset: {
            readonly width: 0;
            readonly height: 12;
        };
        readonly shadowOpacity: 0.45;
        readonly shadowRadius: 32;
        readonly elevation: 16;
    };
    readonly navbar: {
        readonly shadowColor: "#000000";
        readonly shadowOffset: {
            readonly width: 0;
            readonly height: 8;
        };
        readonly shadowOpacity: 0.45;
        readonly shadowRadius: 24;
        readonly elevation: 12;
    };
    readonly fab: {
        readonly shadowColor: "#000000";
        readonly shadowOffset: {
            readonly width: 0;
            readonly height: 6;
        };
        readonly shadowOpacity: 0.35;
        readonly shadowRadius: 20;
        readonly elevation: 8;
    };
    readonly sheet: {
        readonly shadowColor: "#000000";
        readonly shadowOffset: {
            readonly width: 0;
            readonly height: -8;
        };
        readonly shadowOpacity: 0.5;
        readonly shadowRadius: 32;
        readonly elevation: 16;
    };
    readonly toast: {
        readonly shadowColor: "#000000";
        readonly shadowOffset: {
            readonly width: 0;
            readonly height: 8;
        };
        readonly shadowOpacity: 0.5;
        readonly shadowRadius: 24;
        readonly elevation: 10;
    };
    readonly cardLight: {
        readonly shadowColor: "#000000";
        readonly shadowOffset: {
            readonly width: 0;
            readonly height: 2;
        };
        readonly shadowOpacity: 0.05;
        readonly shadowRadius: 8;
        readonly elevation: 2;
    };
    readonly cardDark: {
        readonly shadowOpacity: 0;
        readonly elevation: 0;
    };
};
export declare const tokens: {
    readonly dark: {
        readonly canvas: "#0B0B0E";
        readonly surface1: "#141418";
        readonly surface2: "#1C1C22";
        readonly surface3: "#25252C";
        readonly hairline: "rgba(255,255,255,0.07)";
        readonly text: {
            readonly primary: "#F5F5F7";
            readonly secondary: "#A3A3AD";
            readonly tertiary: "#868691";
        };
        readonly success: {
            readonly fill: "#0E8550";
            readonly text: "#5FD38D";
            readonly soft: "rgba(95,211,141,0.14)";
        };
        readonly warning: {
            readonly fill: "#A15E00";
            readonly text: "#FFB84D";
            readonly soft: "rgba(255,184,77,0.14)";
        };
        readonly danger: {
            readonly fill: "#C93C35";
            readonly text: "#FF7A72";
            readonly soft: "rgba(255,122,114,0.14)";
        };
    };
    readonly light: {
        readonly canvas: "#F4F4F7";
        readonly surface1: "#FFFFFF";
        readonly surface2: "#F0F0F4";
        readonly surface3: "#E8E8EE";
        readonly hairline: "rgba(0,0,0,0.08)";
        readonly text: {
            readonly primary: "#16161A";
            readonly secondary: "#5B5B66";
            readonly tertiary: "#6B6B77";
        };
        readonly success: {
            readonly fill: "#0E8550";
            readonly text: "#18794E";
            readonly soft: "rgba(14,133,80,0.10)";
        };
        readonly warning: {
            readonly fill: "#A15E00";
            readonly text: "#9A5B00";
            readonly soft: "rgba(178,106,0,0.10)";
        };
        readonly danger: {
            readonly fill: "#C93C35";
            readonly text: "#C8322B";
            readonly soft: "rgba(201,60,53,0.09)";
        };
    };
    readonly accents: {
        readonly blue: {
            readonly fillLight: string;
            readonly fillDark: string;
            readonly textLight: string;
            readonly textDark: string;
        };
        readonly violet: {
            readonly fillLight: string;
            readonly fillDark: string;
            readonly textLight: string;
            readonly textDark: string;
        };
        readonly green: {
            readonly fillLight: string;
            readonly fillDark: string;
            readonly textLight: string;
            readonly textDark: string;
        };
        readonly orange: {
            readonly fillLight: string;
            readonly fillDark: string;
            readonly textLight: string;
            readonly textDark: string;
        };
        readonly rose: {
            readonly fillLight: string;
            readonly fillDark: string;
            readonly textLight: string;
            readonly textDark: string;
        };
    };
    readonly defaultAccent: "blue";
};
//# sourceMappingURL=tokens.d.ts.map