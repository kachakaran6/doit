/**
 * Empirical Challenge Test Suite for @doit/tokens and apps/mobile/src/theme/useTheme.ts
 * Executed by challenger_m1_2
 */

import {
  buildThemeColors,
  normalizeAccent,
  VERIFIED_ACCENTS,
  ACCENT_ALIASES,
  ThemeColors,
  ThemeMode,
  VerifiedAccentName,
} from '../useTheme';
import {
  neutrals,
  semantics,
  semanticTokens,
  canonicalAccents,
  accents,
  DEFAULT_ACCENT,
  spacing,
  radius,
  typography,
  dimensions,
  tokens,
} from '@doit/tokens';

interface TestResult {
  category: string;
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

function record(category: string, condition: boolean, message: string, details?: any) {
  if (!condition) {
    const err = new Error(message);
    results.push({ category, name: message, passed: false, error: err.message, details });
    console.error(`  FAIL [${category}]: ${message}`, details ? JSON.stringify(details) : '');
  } else {
    results.push({ category, name: message, passed: true, details });
    console.log(`  PASS [${category}]: ${message}`);
  }
}

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;
const RGBA_COLOR_REGEX = /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0(\.\d+)?|1(\.0+)?)\s*\)$/;

console.log('===============================================================');
console.log('EMPIRICAL CHALLENGE HARNESS: @doit/tokens & useTheme');
console.log('===============================================================\n');

// -------------------------------------------------------------
// SECTION 1: Boundary Cases for colors.surface, surface1, hairline
// -------------------------------------------------------------
console.log('--- Focus Area 1: colors.surface, surface1, hairline ---');

['dark', 'light'].forEach((mode) => {
  const resolved = mode as 'light' | 'dark';
  const colors = buildThemeColors(resolved, 'blue');

  // colors.surface: valid hex
  record(
    'Surface Ramp',
    typeof colors.surface === 'string' && HEX_COLOR_REGEX.test(colors.surface),
    `[${mode}] colors.surface returns a valid 6-char hex string`,
    { value: colors.surface }
  );

  // colors.surface1: valid hex
  record(
    'Surface Ramp',
    typeof colors.surface1 === 'string' && HEX_COLOR_REGEX.test(colors.surface1),
    `[${mode}] colors.surface1 returns a valid 6-char hex string`,
    { value: colors.surface1 }
  );

  // surface === surface1
  record(
    'Surface Ramp',
    colors.surface === colors.surface1,
    `[${mode}] colors.surface matches colors.surface1 (${colors.surface})`
  );

  // surface2, surface3, canvas
  record(
    'Surface Ramp',
    HEX_COLOR_REGEX.test(colors.canvas) &&
    HEX_COLOR_REGEX.test(colors.surface2) &&
    HEX_COLOR_REGEX.test(colors.surface3),
    `[${mode}] full surface ladder (canvas, s1, s2, s3) are valid hex`
  );

  // 8% distinct luminance steps
  const surfaces = [colors.canvas, colors.surface1, colors.surface2, colors.surface3];
  record(
    'Surface Ramp',
    new Set(surfaces).size === 4,
    `[${mode}] 4 distinct luminance steps exist in surface ramp`,
    { surfaces }
  );

  // colors.hairline: valid rgba
  record(
    'Hairline Separator',
    typeof colors.hairline === 'string' && RGBA_COLOR_REGEX.test(colors.hairline),
    `[${mode}] colors.hairline returns a valid rgba() string`,
    { value: colors.hairline }
  );

  // Legacy border alias
  record(
    'Border Aliases',
    colors.border === colors.hairline && colors.borderSubtle === colors.hairline,
    `[${mode}] colors.border and colors.borderSubtle equal colors.hairline`
  );
});

// -------------------------------------------------------------
// SECTION 2: colors.text Dual Nature (String & Object)
// -------------------------------------------------------------
console.log('\n--- Focus Area 2: colors.text Dual String/Object Nature ---');

['dark', 'light'].forEach((mode) => {
  const resolved = mode as 'light' | 'dark';
  const colors = buildThemeColors(resolved, 'blue');
  const expectedPrimary = resolved === 'dark' ? '#F5F5F7' : '#16161A';

  record(
    'Text Object',
    typeof colors.text === 'object' && colors.text !== null,
    `[${mode}] colors.text is accessible as an object`
  );
  record(
    'Text Object',
    colors.text.primary === expectedPrimary,
    `[${mode}] colors.text.primary matches expected primary (${colors.text.primary})`
  );
  record(
    'Text Object',
    typeof colors.text.secondary === 'string' && HEX_COLOR_REGEX.test(colors.text.secondary),
    `[${mode}] colors.text.secondary is valid hex (${colors.text.secondary})`
  );
  record(
    'Text Object',
    typeof colors.text.tertiary === 'string' && HEX_COLOR_REGEX.test(colors.text.tertiary),
    `[${mode}] colors.text.tertiary is valid hex (${colors.text.tertiary})`
  );

  // Interpolation in template literal
  const interpolated = `${colors.text}`;
  record(
    'Text Interpolation',
    interpolated !== '[object Object]',
    `[${mode}] \`\${colors.text}\` does NOT produce '[object Object]'`,
    { result: interpolated }
  );
  record(
    'Text Interpolation',
    interpolated === expectedPrimary,
    `[${mode}] \`\${colors.text}\` evaluates to primary hex (${interpolated})`
  );

  // String concatenation
  record(
    'Text Concatenation',
    'color: ' + colors.text === `color: ${expectedPrimary}`,
    `[${mode}] 'color: ' + colors.text evaluates to primary hex`
  );

  // String() wrapper
  record(
    'Text String Constructor',
    String(colors.text) === expectedPrimary,
    `[${mode}] String(colors.text) evaluates to primary hex`
  );

  // typeof check: reveals runtime object nature
  record(
    'Text Runtime Type',
    typeof colors.text === 'object',
    `[${mode}] Note: typeof colors.text is 'object' at runtime (StyleSheet color pitfall)`
  );
});

// -------------------------------------------------------------
// SECTION 3: Accent Handling & Adversarial normalizeAccent
// -------------------------------------------------------------
console.log('\n--- Focus Area 3: normalizeAccent & Accent Fallbacks ---');

// 3a. Canonical accents
const canonicalKeys: VerifiedAccentName[] = ['blue', 'violet', 'green', 'orange', 'rose'];
canonicalKeys.forEach((c) => {
  record(
    'Canonical Accents',
    normalizeAccent(c) === c,
    `normalizeAccent('${c}') returns '${c}'`
  );
});

// 3b. Legacy accents
record('Legacy Accents', normalizeAccent('indigo') === 'blue', "normalizeAccent('indigo') maps to 'blue'");
record('Legacy Accents', normalizeAccent('teal') === 'green', "normalizeAccent('teal') maps to 'green'");
record('Legacy Accents', normalizeAccent('amber') === 'orange', "normalizeAccent('amber') maps to 'orange'");

// 3c. Safe standard edge cases
record('Edge Cases', normalizeAccent('') === 'blue', "normalizeAccent('') falls back to 'blue'");
record('Edge Cases', normalizeAccent(undefined) === 'blue', "normalizeAccent(undefined) falls back to 'blue'");
record('Edge Cases', normalizeAccent(null as any) === 'blue', "normalizeAccent(null) falls back to 'blue'");
record('Edge Cases', normalizeAccent('magenta' as any) === 'blue', "normalizeAccent('magenta') falls back to 'blue'");

// 3d. Prototype pollution vulnerability check
const protoKeys = ['toString', 'valueOf', 'constructor', '__proto__', 'hasOwnProperty'];
protoKeys.forEach((key) => {
  const norm = normalizeAccent(key as any);
  const isSafe = canonicalKeys.includes(norm as any);
  record(
    'Prototype Property Leak',
    isSafe,
    `normalizeAccent('${key}') must return a VerifiedAccentName without prototype leakage (got '${typeof norm === 'function' ? 'Function' : typeof norm}')`,
    { key, result: norm }
  );
});

// 3e. Display name / Case sensitivity test
Object.values(VERIFIED_ACCENTS).forEach((acc) => {
  const norm = normalizeAccent(acc.name);
  record(
    'Display Name Handling',
    canonicalKeys.includes(norm) && norm === acc.name.toLowerCase(),
    `normalizeAccent('${acc.name}') handles capitalized display name`,
    { input: acc.name, result: norm }
  );
});

// -------------------------------------------------------------
// SECTION 4: Active Accent Resolution in buildThemeColors
// -------------------------------------------------------------
console.log('\n--- Focus Area 4: buildThemeColors Resolution ---');

canonicalKeys.forEach((k) => {
  const colorsDark = buildThemeColors('dark', k);
  const colorsLight = buildThemeColors('light', k);

  record(
    'Active Accent',
    HEX_COLOR_REGEX.test(colorsDark.accent) && HEX_COLOR_REGEX.test(colorsLight.accent),
    `[${k}] active accent resolves to valid hex in dark and light modes`
  );
  record(
    'Active Accent Text',
    HEX_COLOR_REGEX.test(colorsDark.accentText) && HEX_COLOR_REGEX.test(colorsLight.accentText),
    `[${k}] active accentText resolves to valid hex in dark and light modes`
  );
  record(
    'Active Accent Soft',
    RGBA_COLOR_REGEX.test(colorsDark.accentSoft) && RGBA_COLOR_REGEX.test(colorsLight.accentSoft),
    `[${k}] active accentSoft resolves to valid rgba in dark and light modes`
  );
});

// -------------------------------------------------------------
// SECTION 5: Semantics Flat and Structured Contracts
// -------------------------------------------------------------
console.log('\n--- Focus Area 5: Semantics Contracts ---');

['dark', 'light'].forEach((mode) => {
  const colors = buildThemeColors(mode as 'dark' | 'light', 'blue');
  ['success', 'warning', 'danger', 'info'].forEach((semanticKey) => {
    const flatVal = (colors as any)[semanticKey];
    record(
      'Semantics',
      typeof flatVal === 'string' && HEX_COLOR_REGEX.test(flatVal),
      `[${mode}] colors.${semanticKey} is flat hex string (${flatVal})`
    );

    const group = (colors.semantics as any)[semanticKey];
    record(
      'Semantics',
      typeof group.fill === 'string' && HEX_COLOR_REGEX.test(group.fill),
      `[${mode}] colors.semantics.${semanticKey}.fill is valid hex (${group.fill})`
    );
    record(
      'Semantics',
      typeof group.text === 'string' && HEX_COLOR_REGEX.test(group.text),
      `[${mode}] colors.semantics.${semanticKey}.text is valid hex (${group.text})`
    );
    record(
      'Semantics',
      typeof group.soft === 'string' && RGBA_COLOR_REGEX.test(group.soft),
      `[${mode}] colors.semantics.${semanticKey}.soft is valid rgba (${group.soft})`
    );
  });
});

// -------------------------------------------------------------
// FINAL SUMMARY
// -------------------------------------------------------------
console.log('\n===============================================================');
const passedCount = results.filter((r) => r.passed).length;
const failedResults = results.filter((r) => !r.passed);
console.log(`TOTAL CHECKS: ${results.length}`);
console.log(`PASSED: ${passedCount}`);
console.log(`FAILED: ${failedResults.length}`);
console.log('===============================================================\n');

if (failedResults.length > 0) {
  console.log('CONFIRMED VULNERABILITIES & FAILURE MODES:');
  failedResults.forEach((f, idx) => {
    console.log(`${idx + 1}. [${f.category}] ${f.name}`);
    if (f.details) console.log(`   Details: ${JSON.stringify(f.details)}`);
  });
}
