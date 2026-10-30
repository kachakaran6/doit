import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const codegenDirs = [
  path.join(rootDir, 'node_modules', '@react-native', 'codegen', 'lib', 'parsers', 'typescript'),
  path.join(rootDir, 'node_modules', 'babel-preset-expo', 'node_modules', '@react-native', 'codegen', 'lib', 'parsers', 'typescript'),
];

for (const base of codegenDirs) {
  if (!fs.existsSync(base)) continue;

  // 1. parser.js
  const parserPath = path.join(base, 'parser.js');
  if (fs.existsSync(parserPath)) {
    let cp = fs.readFileSync(parserPath, 'utf8');
    if (!cp.includes('typeAnnotation.typeName.right')) {
      cp = cp.replace(
        'getTypeAnnotationName(typeAnnotation) {',
        'getTypeAnnotationName(typeAnnotation) {\n    if (typeAnnotation && typeAnnotation.typeName) {\n      if (typeAnnotation.typeName.right) return typeAnnotation.typeName.right.name;\n      if (typeAnnotation.typeName.name) return typeAnnotation.typeName.name;\n    }'
      );
      fs.writeFileSync(parserPath, cp, 'utf8');
    }
  }

  // 2. parseTopLevelType.js
  const ptPath = path.join(base, 'parseTopLevelType.js');
  if (fs.existsSync(ptPath)) {
    let cpt = fs.readFileSync(ptPath, 'utf8');
    if (!cpt.includes('_vname')) {
      cpt = cpt.replace(
        /if \(types\[value\.typeName\.name\]\)/g,
        'const _vname = value.typeName.right ? value.typeName.right.name : value.typeName.name; if (types[_vname])'
      );
      cpt = cpt.replace(
        /return getValueFromTypes\(types\[value\.typeName\.name\], types\);/g,
        'return getValueFromTypes(types[_vname], types);'
      );
      cpt = cpt.replace(
        /if \(type\.typeName\.name === 'Readonly'\) \{/g,
        'const _tname = type.typeName.right ? type.typeName.right.name : type.typeName.name; if (_tname === \'Readonly\') {'
      );
      cpt = cpt.replace(
        /\} else if \(type\.typeName\.name === 'WithDefault'\) \{/g,
        '} else if (_tname === \'WithDefault\') {'
      );
      fs.writeFileSync(ptPath, cpt, 'utf8');
    }
  }

  // 3. componentsUtils.js
  const cuPath = path.join(base, 'components', 'componentsUtils.js');
  if (fs.existsSync(cuPath)) {
    let ccu = fs.readFileSync(cuPath, 'utf8');
    if (!ccu.includes('extractedTypeAnnotation.typeName.right')) {
      ccu = ccu.replace(
        /\(\(_extractedTypeAnnotat2 = extractedTypeAnnotation\.typeName\) === null \|\|[\s\S]*?_extractedTypeAnnotat2\.name\)/g,
        '((extractedTypeAnnotation.typeName && (extractedTypeAnnotation.typeName.right ? extractedTypeAnnotation.typeName.right.name : extractedTypeAnnotation.typeName.name)))'
      );
      ccu = ccu.replace(
        /extractedTypeAnnotation\.elementType\.typeName\.name/g,
        '(extractedTypeAnnotation.elementType.typeName.right ? extractedTypeAnnotation.elementType.typeName.right.name : extractedTypeAnnotation.elementType.typeName.name)'
      );
      ccu = ccu.replace(
        /parser\.getProperties\(property\.typeName\.name, types\)/g,
        'parser.getProperties(property.typeName.right ? property.typeName.right.name : property.typeName.name, types)'
      );
      fs.writeFileSync(cuPath, ccu, 'utf8');
    }
  }
}

// 4. Ensure missing src/lib/extract/types.ts and lib helpers exist in react-native-svg
const svgTypesDir = path.join(rootDir, 'node_modules', 'react-native-svg', 'src', 'lib', 'extract');
const svgDtsPath = path.join(rootDir, 'node_modules', 'react-native-svg', 'lib', 'typescript', 'lib', 'extract', 'types.d.ts');
if (fs.existsSync(svgDtsPath)) {
  fs.mkdirSync(svgTypesDir, { recursive: true });
  fs.copyFileSync(svgDtsPath, path.join(svgTypesDir, 'types.ts'));
}

const svgLibDir = path.join(rootDir, 'node_modules', 'react-native-svg', 'src', 'lib');
const localFixes = path.join(rootDir, 'scripts', 'svg-fixes');
if (fs.existsSync(localFixes) && fs.existsSync(svgLibDir)) {
  for (const file of fs.readdirSync(localFixes)) {
    fs.copyFileSync(path.join(localFixes, file), path.join(svgLibDir, file));
  }
}

// 5. Ensure react-native-svg package.json points react-native to src/index.ts
const svgPkgPath = path.join(rootDir, 'node_modules', 'react-native-svg', 'package.json');
if (fs.existsSync(svgPkgPath)) {
  const svgPkg = JSON.parse(fs.readFileSync(svgPkgPath, 'utf8'));
  if (svgPkg['react-native'] !== 'src/index.ts') {
    svgPkg['react-native'] = 'src/index.ts';
    fs.writeFileSync(svgPkgPath, JSON.stringify(svgPkg, null, 2) + '\n', 'utf8');
  }
}

// 6. Safeguard @react-native/babel-plugin-codegen from crashing on pre-compiled .js components
const babelCodegenFiles = [
  path.join(rootDir, 'node_modules', '@react-native', 'babel-plugin-codegen', 'index.js'),
  path.join(rootDir, 'node_modules', 'babel-preset-expo', 'node_modules', '@react-native', 'babel-plugin-codegen', 'index.js'),
];

for (const bcf of babelCodegenFiles) {
  if (fs.existsSync(bcf)) {
    let content = fs.readFileSync(bcf, 'utf8');
    if (!content.includes('// SAFE_FALLBACK')) {
      const targetStr = `      Program: {
        exit(path) {
          if (this.defaultExport) {
            const viewConfig = generateViewConfig(this.filename, this.code);
            this.defaultExport.replaceWithMultiple(
              parse(viewConfig, {
                babelrc: false,
                browserslistConfigFile: false,
                configFile: false,
              }).program.body,
            );
            if (this.commandsExport != null) {
              this.commandsExport.remove();
            }
            this.codeInserted = true;
          }
        },
      },`;

      const safeStr = `      Program: {
        exit(path) {
          if (this.defaultExport) {
            try {
              // SAFE_FALLBACK: if viewConfig extraction fails on pre-compiled node_modules, fallback to runtime
              const viewConfig = generateViewConfig(this.filename, this.code);
              this.defaultExport.replaceWithMultiple(
                parse(viewConfig, {
                  babelrc: false,
                  browserslistConfigFile: false,
                  configFile: false,
                }).program.body,
              );
              if (this.commandsExport != null) {
                this.commandsExport.remove();
              }
              this.codeInserted = true;
            } catch (_err) {
              // Gracefully fallback to runtime requireNativeComponent
            }
          }
        },
      },`;

      content = content.replace(targetStr, safeStr);
      fs.writeFileSync(bcf, content, 'utf8');
    }
  }
}

// eslint-disable-next-line no-console
console.log('✔ React Native Codegen & SVG types patched successfully');
