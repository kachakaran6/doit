import { neutrals, accents, spacing, radius, accentFor, dimensions } from './tokens.js';

if (!neutrals.light.bg || !neutrals.dark.bg) {
  throw new Error('Neutrals token missing bg');
}

if (!accents.indigo || !accents.teal || !accents.amber || !accents.rose || !accents.violet) {
  throw new Error('Missing one of the 5 required accents');
}

if (!spacing.md || !radius.lg) {
  throw new Error('Missing spacing or radius tokens');
}

// 09-PROMPTS/P-01-primitives.md requirements
if (radius.sm !== 12 || radius.md !== 16 || radius.lg !== 20) {
  throw new Error(`Radius role mismatch: sm=${radius.sm}, md=${radius.md}, lg=${radius.lg}`);
}

const a1 = accentFor('task-123');
const a2 = accentFor('task-123');
if (!a1 || a1.name !== a2.name || !a1.primary) {
  throw new Error('accentFor must be deterministic and return a valid accent');
}

console.log('✓ All token and primitive contract checks passed');
