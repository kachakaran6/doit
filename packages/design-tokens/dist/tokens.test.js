import { neutrals, accents, canonicalAccents, semanticTokens, semantics, spacing, radius, accentFor, typography, DEFAULT_ACCENT, tokens, } from './tokens';
// 1. Surface Luminance Ramp (8% ladder)
if (!neutrals.light.canvas || !neutrals.dark.canvas) {
    throw new Error('Neutrals token missing canvas');
}
if (neutrals.dark.canvas !== '#0B0B0E' || neutrals.light.canvas !== '#F4F4F7') {
    throw new Error(`Canvas luminance mismatch: dark=${neutrals.dark.canvas}, light=${neutrals.light.canvas}`);
}
if (neutrals.dark.surface1 !== '#141418' || neutrals.light.surface1 !== '#FFFFFF') {
    throw new Error(`Surface1 luminance mismatch: dark=${neutrals.dark.surface1}, light=${neutrals.light.surface1}`);
}
if (neutrals.dark.surface2 !== '#1C1C22' || neutrals.light.surface2 !== '#F0F0F4') {
    throw new Error(`Surface2 luminance mismatch: dark=${neutrals.dark.surface2}, light=${neutrals.light.surface2}`);
}
if (neutrals.dark.surface3 !== '#25252C' || neutrals.light.surface3 !== '#E8E8EE') {
    throw new Error(`Surface3 luminance mismatch: dark=${neutrals.dark.surface3}, light=${neutrals.light.surface3}`);
}
if (neutrals.dark.hairline !== 'rgba(255,255,255,0.07)' || neutrals.light.hairline !== 'rgba(0,0,0,0.08)') {
    throw new Error(`Hairline mismatch: dark=${neutrals.dark.hairline}, light=${neutrals.light.hairline}`);
}
// 2. Backwards-compatible surface aliases
if (!neutrals.light.bg || !neutrals.dark.bg || neutrals.dark.bg !== neutrals.dark.canvas) {
    throw new Error('Neutrals token missing bg alias');
}
if (!neutrals.dark.surface || !neutrals.dark.surfaceRaised || !neutrals.dark.surfaceOverlay) {
    throw new Error('Neutrals token missing legacy surface aliases');
}
// 3. Text levels
if (!neutrals.dark.text.primary || !neutrals.dark.text.secondary || !neutrals.dark.text.tertiary) {
    throw new Error('Neutrals dark missing text hierarchy levels');
}
if (!neutrals.light.text.primary || !neutrals.light.text.secondary || !neutrals.light.text.tertiary) {
    throw new Error('Neutrals light missing text hierarchy levels');
}
if (neutrals.dark.textPrimary !== '#F5F5F7' || neutrals.light.textPrimary !== '#16161A') {
    throw new Error('Flat textPrimary alias mismatch');
}
// 4. 5 Verified Accents & Legacy Aliases
if (!canonicalAccents.blue || !canonicalAccents.violet || !canonicalAccents.green || !canonicalAccents.orange || !canonicalAccents.rose) {
    throw new Error('Missing one of the 5 canonical verified accents');
}
if (!accents.indigo || !accents.teal || !accents.amber || !accents.rose || !accents.violet || !accents.blue) {
    throw new Error('Missing required accent or backward compatibility alias');
}
if (DEFAULT_ACCENT !== 'blue') {
    throw new Error(`Default accent must be blue, got ${DEFAULT_ACCENT}`);
}
// 5. Semantics
if (!semanticTokens.dark.success.fill || !semanticTokens.dark.warning.fill || !semanticTokens.dark.danger.fill) {
    throw new Error('Missing dark semanticTokens');
}
if (typeof semantics.dark.danger !== 'string' || typeof semantics.light.success !== 'string') {
    throw new Error('Legacy semantics must export flat string colors for React Native styles');
}
// 6. Spacing & Radius
if (!spacing.md || !radius.lg) {
    throw new Error('Missing spacing or radius tokens');
}
if (spacing.screenMargin !== 20) {
    throw new Error(`screenMargin must be 20, got ${spacing.screenMargin}`);
}
if (radius.sm !== 12 || radius.md !== 16 || radius.lg !== 20 || radius.xl !== 28) {
    throw new Error(`Radius role mismatch: sm=${radius.sm}, md=${radius.md}, lg=${radius.lg}, xl=${radius.xl}`);
}
if (radius.card !== 20 || radius.sheet !== 28 || radius.input !== 14 || radius.button !== 14) {
    throw new Error(`Semantic component radius mismatch: card=${radius.card}, sheet=${radius.sheet}, input=${radius.input}, button=${radius.button}`);
}
// 7. Typography Scale
if (typography.largeTitle.fontSize !== 30 || typography.largeTitle.fontWeight !== '700' || typography.largeTitle.letterSpacing !== -0.5) {
    throw new Error('typography.largeTitle contract mismatch (fontSize 30, weight 700, tracking -0.5)');
}
if (typography.title1.fontSize !== 24 || typography.title2.fontSize !== 22 || typography.title3.fontSize !== 18) {
    throw new Error('typography title scale mismatch');
}
if (!typography.meta.fontVariant?.includes('tabular-nums') || !typography.numeric.fontVariant?.includes('tabular-nums')) {
    throw new Error('typography meta/numeric must include tabular-nums');
}
// 8. Deterministic accent hashing
const a1 = accentFor('task-123');
const a2 = accentFor('task-123');
if (!a1 || a1.name !== a2.name || !a1.primary || !a1.fillDark || !a1.textDark) {
    throw new Error('accentFor must be deterministic and return a valid accent with fill/text contrast pairs');
}
// 9. Raw tokens object for contrast runner compatibility
if (!tokens.dark.canvas || !tokens.light.canvas || !tokens.accents.blue.fillLight) {
    throw new Error('tokens object missing contrast verification keys');
}
console.log('✓ All token, typography, luminance, and primitive contract checks passed');
//# sourceMappingURL=tokens.test.js.map