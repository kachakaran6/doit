import { neutrals, accents, spacing, radius } from './tokens';

if (!neutrals.light.bg || !neutrals.dark.bg) {
  throw new Error('Neutrals token missing bg');
}

if (!accents.indigo || !accents.teal || !accents.amber || !accents.rose || !accents.violet) {
  throw new Error('Missing one of the 5 required accents');
}

if (!spacing.md || !radius.lg) {
  throw new Error('Missing spacing or radius tokens');
}
