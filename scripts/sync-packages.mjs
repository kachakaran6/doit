import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const packages = [
  { name: 'contracts', target: '@samyukt/contracts' },
  { name: 'design-tokens', target: '@samyukt/tokens' },
];

for (const pkg of packages) {
  const pkgDir = path.join(rootDir, 'packages', pkg.name);
  const targetDir = path.join(rootDir, 'node_modules', pkg.target);

  fs.mkdirSync(targetDir, { recursive: true });

  const pkgJsonPath = path.join(pkgDir, 'package.json');
  if (fs.existsSync(pkgJsonPath)) {
    fs.copyFileSync(pkgJsonPath, path.join(targetDir, 'package.json'));
  }

  const distSrc = path.join(pkgDir, 'dist');
  const distDest = path.join(targetDir, 'dist');
  if (fs.existsSync(distSrc)) {
    fs.cpSync(distSrc, distDest, { recursive: true, force: true });
  }
}

// eslint-disable-next-line no-console
console.log('Synchronized workspace packages into node_modules/@samyukt');
