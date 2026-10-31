import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const packages = [
  { name: 'contracts', targets: ['@doit/contracts', '@samyukt/contracts'] },
  { name: 'design-tokens', targets: ['@doit/tokens', '@samyukt/tokens'] },
];

for (const pkg of packages) {
  const pkgDir = path.join(rootDir, 'packages', pkg.name);

  for (const target of pkg.targets) {
    const targetDir = path.join(rootDir, 'node_modules', target);
    fs.mkdirSync(targetDir, { recursive: true });

    const pkgJsonPath = path.join(pkgDir, 'package.json');
    if (fs.existsSync(pkgJsonPath)) {
      const parsed = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
      parsed.name = target;
      fs.writeFileSync(path.join(targetDir, 'package.json'), JSON.stringify(parsed, null, 2) + '\n', 'utf8');
    }

    const themeCssSrc = path.join(pkgDir, 'src', 'theme.css');
    if (fs.existsSync(themeCssSrc)) {
      fs.mkdirSync(path.join(targetDir, 'src'), { recursive: true });
      fs.copyFileSync(themeCssSrc, path.join(targetDir, 'src', 'theme.css'));
      fs.copyFileSync(themeCssSrc, path.join(targetDir, 'theme.css'));
    }

    const distSrc = path.join(pkgDir, 'dist');
    const distDest = path.join(targetDir, 'dist');
    if (fs.existsSync(distSrc)) {
      fs.cpSync(distSrc, distDest, { recursive: true, force: true });
    }
  }
}

// eslint-disable-next-line no-console
console.log('Synchronized workspace packages into node_modules/@doit and node_modules/@samyukt');
