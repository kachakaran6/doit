import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper to run commands
function run(cmd, cwd = rootDir) {
  console.log(`\x1b[36m> ${cmd}\x1b[0m`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

function runCapture(cmd, cwd = rootDir) {
  return execSync(cmd, { cwd, encoding: 'utf8' }).trim();
}

async function main() {
  const args = process.argv.slice(2);
  const trackArg = args.find((a) => a.startsWith('--track='))?.split('=')[1] || 'internal';
  const shouldBump = args.includes('--bump');
  const specifiedBuildNum = args.find((a) => a.startsWith('--build='))?.split('=')[1];

  console.log(`\n==================================================`);
  console.log(`🚀 SAMYUKT DOIT — GOOGLE PLAY RELEASE PIPELINE`);
  console.log(`   Track: \x1b[32m${trackArg}\x1b[0m`);
  console.log(`==================================================\n`);

  const buildGradlePath = path.join(rootDir, 'apps/mobile/android/app/build.gradle');
  const mobilePkgPath = path.join(rootDir, 'apps/mobile/package.json');
  const appConfigPath = path.join(rootDir, 'apps/mobile/app.config.ts');
  const releaseBuildsDir = path.join(rootDir, 'release-builds');

  if (!fs.existsSync(releaseBuildsDir)) {
    fs.mkdirSync(releaseBuildsDir, { recursive: true });
  }

  // 1. Read version info
  let gradleContent = fs.readFileSync(buildGradlePath, 'utf8');
  const matchCode = gradleContent.match(/versionCode\s+(\d+)/);
  const matchVersion = gradleContent.match(/versionName\s+["']([^"']+)["']/);

  let currentCode = matchCode ? parseInt(matchCode[1], 10) : 28;
  let versionName = matchVersion ? matchVersion[1] : '0.2.8';

  let targetCode = currentCode;
  if (specifiedBuildNum) {
    targetCode = parseInt(specifiedBuildNum, 10);
  } else if (shouldBump) {
    targetCode = currentCode + 1;
  }

  if (targetCode !== currentCode) {
    console.log(`⬆️ Bumping versionCode from ${currentCode} to ${targetCode}...`);
    gradleContent = gradleContent.replace(/versionCode\s+\d+/, `versionCode ${targetCode}`);
    fs.writeFileSync(buildGradlePath, gradleContent, 'utf8');

    if (fs.existsSync(mobilePkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(mobilePkgPath, 'utf8'));
      pkg.version = versionName;
      fs.writeFileSync(mobilePkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
    }

    if (fs.existsSync(appConfigPath)) {
      let cfg = fs.readFileSync(appConfigPath, 'utf8');
      cfg = cfg.replace(/versionCode:\s*\d+/, `versionCode: ${targetCode}`);
      fs.writeFileSync(appConfigPath, cfg, 'utf8');
    }
  }

  console.log(`📌 Release Version: ${versionName}`);
  console.log(`📌 Build Number:    ${targetCode}`);

  // 2. Check Keystore
  const keyPropertiesPath = path.join(rootDir, 'apps/mobile/android/key.properties');
  const keystorePath = path.join(rootDir, 'apps/mobile/android/app/doit-release-key.jks');
  if (!fs.existsSync(keyPropertiesPath) || !fs.existsSync(keystorePath)) {
    console.error(`❌ Missing release keystore or key.properties!`);
    process.exit(1);
  }
  console.log(`✅ Production release signing key verified.`);

  // 3. Build AAB Bundle
  const targetAabName = `DoIt-v${versionName}-build${targetCode}.aab`;
  const finalAabPath = path.join(releaseBuildsDir, targetAabName);

  if (fs.existsSync(finalAabPath) && !args.includes('--rebuild')) {
    console.log(`📦 Found existing signed bundle: ${finalAabPath}`);
  } else {
    console.log(`🔨 Building signed release bundle with Gradle...`);
    const androidDir = path.join(rootDir, 'apps/mobile/android');
    run(`cmd /c gradlew bundleRelease`, androidDir);

    const generatedAab = path.join(androidDir, 'app/build/outputs/bundle/release/app-release.aab');
    if (!fs.existsSync(generatedAab)) {
      console.error(`❌ Build failed: bundle not found at ${generatedAab}`);
      process.exit(1);
    }
    fs.copyFileSync(generatedAab, finalAabPath);
    console.log(`✅ Generated and signed bundle: ${finalAabPath}`);
  }

  // 4. Check for Google Play Service Account Key
  const possibleKeys = [
    process.env.PLAY_STORE_JSON_KEY,
    path.join(rootDir, 'apps/mobile/android/fastlane/api-key.json'),
    path.join(rootDir, 'apps/mobile/android/api-key.json'),
    path.join(rootDir, 'api-key.json'),
    path.join(rootDir, 'app.json')
  ].filter(Boolean);

  const foundKey = possibleKeys.find((p) => fs.existsSync(p) && fs.statSync(p).size > 0);

  if (foundKey) {
    console.log(`🔑 Using Google Play API Key: ${foundKey}`);
    console.log(`🚀 Uploading to Play Store track '${trackArg}' via Google Play API...`);
    try {
      const playTrack = trackArg === 'closed' ? 'alpha' : trackArg;
      run(`ruby scripts/publish-to-playstore.rb ${playTrack} "${finalAabPath}" "${versionName}" "${targetCode}"`);
      console.log(`🎉 Automated upload to Google Play track '${trackArg}' succeeded!`);
    } catch (err) {
      console.warn(`⚠️ Google Play upload encountered an issue:`, err.message);
    }
  } else {
    console.log(`\nℹ️ Note: No Google Play Service Account JSON key found.`);
    console.log(`   To enable 100% automated headless uploads, place 'api-key.json' in 'apps/mobile/android/fastlane/' or root.`);
    console.log(`   Your signed release bundle is ready for instant upload at:`);
    console.log(`   👉 ${finalAabPath}\n`);
  }

  // 5. Automated Git Release Archiving
  console.log(`\n🌿 Starting Automated Git Release Archiving...`);
  const currentBranch = runCapture('git rev-parse --abbrev-ref HEAD');
  const tagName = `v${versionName}+${targetCode}`;
  const versionBranch = `v${targetCode}`;

  try {
    // Stage all modified files
    run('git add -A');

    // Check if changes exist
    const status = runCapture('git status --porcelain');
    if (status.trim() !== '') {
      const commitMsg = `chore(release): publish build #${targetCode} (${versionName}+${targetCode}) to ${trackArg} [skip ci]`;
      run(`git commit -m "${commitMsg}"`);
    } else {
      console.log(`ℹ️ Working tree clean, proceeding to tag and branch.`);
    }

    // Push working branch
    console.log(`⬆️ Pushing ${currentBranch} to origin...`);
    run(`git push origin ${currentBranch}`);

    // Create & push dedicated version branch
    console.log(`🌿 Creating dedicated version branch: ${versionBranch}...`);
    run(`git branch -f ${versionBranch}`);
    run(`git push origin ${versionBranch} --force`);

    // Create & push annotated Git release tag
    console.log(`🏷️ Creating annotated Git tag: ${tagName}...`);
    run(`git tag -fa ${tagName} -m "Release ${tagName} to ${trackArg}"`);
    run(`git push origin ${tagName} --force`);

    console.log(`\n==================================================`);
    console.log(`✨ RELEASE ARCHIVING COMPLETE ✨`);
    console.log(`  📦 Bundle:  ${finalAabPath}`);
    console.log(`  🌿 Branch:  ${versionBranch} (pushed to origin)`);
    console.log(`  🏷️ Tag:     ${tagName} (pushed to origin)`);
    console.log(`  🔀 Active:  ${currentBranch}`);
    console.log(`==================================================\n`);
  } catch (gitErr) {
    console.error(`⚠️ Git archiving step error:`, gitErr.message);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

