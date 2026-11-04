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
export declare function computeTracking(fontSize: number): number;
export declare const FONT_FAMILY = "Inter";
export declare const typographyScale: {
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
export type TypographyVariant = keyof typeof typographyScale;
//# sourceMappingURL=type.d.ts.map