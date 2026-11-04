import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.expo/**',
      '**/build/**',
      '**/.turbo/**',
      'docs/**',
      'doit-1/**',
      'doit-2/**',
      'doit-3/**',
      'coverage/**',
      'apps/mobile/android/**',
      'apps/mobile/ios/**',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    // DoIt Premium UI Kit P-00 Lint Rule:
    // fontSize / fontFamily / fontWeight outside Text.tsx warned
    files: ['apps/mobile/src/components/ui/**/*.tsx'],
    ignores: [
      'apps/mobile/src/components/ui/Text.tsx',
    ],
    rules: {
      'no-restricted-syntax': [
        'warn',
        {
          selector: "Property[key.name='fontSize']",
          message: "Direct 'fontSize' is forbidden outside Text.tsx. Use <Text variant=\"...\"> instead (03-TYPE-SYSTEM.md).",
        },
        {
          selector: "Property[key.name='fontFamily']",
          message: "Direct 'fontFamily' is forbidden outside Text.tsx. Use <Text variant=\"...\"> instead (03-TYPE-SYSTEM.md).",
        },
      ],
    },
  },
];
