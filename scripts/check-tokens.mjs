import fs from 'node:fs';
import path from 'node:path';

const ALLOWED_PATHS = [
  'packages/design-tokens',
  'apps/mobile/src/theme',
  'apps/mobile/src/components/ui',
  'apps/api',
  'bruno',
  'scripts',
  'node_modules',
  '.git',
  '.turbo',
  'dist',
  'build',
];

const SCAN_DIRS = [
  'apps/mobile/src',
];

const HEX_REGEX = /#(?:[0-9a-fA-F]{3,4}){1,2}\b/g;
const RGBA_REGEX = /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/g;

let violationsCount = 0;

function scanFile(filePath) {
  // Normalize path
  const normalized = filePath.replace(/\\/g, '/');

  // Check if inside allowed paths
  for (const allowed of ALLOWED_PATHS) {
    if (normalized.includes(allowed) && !normalized.includes('apps/mobile/src/features') && !normalized.includes('apps/mobile/src/screens')) {
      return;
    }
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Ignore comments
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
      return;
    }

    const hexMatches = line.match(HEX_REGEX);
    if (hexMatches) {
      console.error(`[check-tokens] Violation at ${filePath}:${index + 1}`);
      console.error(`  Found hardcoded hex: ${hexMatches.join(', ')}`);
      console.error(`  Line: ${line.trim()}`);
      violationsCount++;
    }

    const rgbaMatches = line.match(RGBA_REGEX);
    if (rgbaMatches) {
      console.error(`[check-tokens] Violation at ${filePath}:${index + 1}`);
      console.error(`  Found hardcoded rgba: ${rgbaMatches.join(', ')}`);
      console.error(`  Line: ${line.trim()}`);
      violationsCount++;
    }
  });
}

function traverse(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        traverse(fullPath);
      }
    } else if (
      entry.isFile() &&
      (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js'))
    ) {
      scanFile(fullPath);
    }
  }
}

console.log('Running check-tokens rule verification...');
for (const scanDir of SCAN_DIRS) {
  traverse(path.resolve(process.cwd(), scanDir));
}

if (violationsCount > 0) {
  console.error(`\n❌ check-tokens failed: found ${violationsCount} hardcoded color violation(s).`);
  console.error('All colors must be consumed exclusively through useTheme().');
  process.exit(1);
} else {
  console.log('✔ check-tokens passed: 0 hardcoded color literals found outside theme/tokens.');
  process.exit(0);
}
