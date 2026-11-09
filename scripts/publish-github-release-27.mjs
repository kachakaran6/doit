import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

let TOKEN = process.env.GITHUB_TOKEN;
if (!TOKEN) {
  try {
    TOKEN = execSync('gh auth token').toString().trim();
  } catch (e) {
    console.error('No GITHUB_TOKEN set and gh auth token failed');
    process.exit(1);
  }
}

const REPO = 'kachakaran6/doit';
const TAG = 'v0.2.7+27';
const RELEASE_NAME = 'DoIt v0.2.7 — Build 27 (Play Store Readiness: Native In-App Updates, Reviews, Samyukt Registry, App Sharing & Attribution)';
const APK_SOURCE = 'K:/Doit/apps/mobile/android/app/build/outputs/apk/release/app-release.apk';
const APK_TARGET = 'K:/Doit/release-builds/DoIt-v0.2.7-build27.apk';
const SHA_TARGET = 'K:/Doit/release-builds/DoIt-v0.2.7-build27.apk.sha256';
const AAB_SOURCE = 'K:/Doit/apps/mobile/android/app/build/outputs/bundle/release/app-release.aab';
const AAB_TARGET = 'K:/Doit/release-builds/DoIt-v0.2.7-build27.aab';

const RELEASE_BODY = `## DoIt v0.2.7 — Release Build 27 (Samyukt Android Ecosystem & Play Store Ready)

### Highlights & Deliverables in Build 27:

1. **Native Google Play In-App Updates (\`AppUpdateManager\`)**:
   - Integrated official Google Play Core libraries (\`com.google.android.play:app-update:2.1.0\`).
   - Lifecycle-safe update detection on startup and app resumption (\`AppState === 'active'\`).
   - Priority-based flow: Immediate update flow for mandatory/critical releases (\`priority >= 4\`), flexible update flow with background download tracking for standard releases.
   - Handled download progress (\`InstallStatus.DOWNLOADING\`), download completion (\`InstallStatus.DOWNLOADED\`), user restart prompts, and app resumption recovery without duplicate prompts.
   - Never imitates Play Store UI; uses Google's native system dialogs exclusively.

2. **Native Google Play In-App Review (\`ReviewManager\`)**:
   - Integrated official Google Play Review API (\`com.google.android.play:review:2.0.2\`).
   - Enforced strict **15-day cooldown** persisted in secure on-device storage.
   - Evaluates engagement threshold (minimum 3 meaningful user actions across task creation/completion, bug triaging).
   - "Rate Now" action opening the official Play Store listing (\`market://details?id=com.samyukt.doit\` with fallback).

3. **Centralized "Our Apps" Catalog Powered by Samyukt GitHub Registry**:
   - Single source of truth: \`https://raw.githubusercontent.com/kachakaran6/Application-json/main/app.json\` and \`images/\` base.
   - Strict filtering: strictly includes only eligible mobile apps (\`apps[]\`, never websites), with statuses \`production\`, \`published\`, or \`coming_soon\`. Excludes drafts and self.
   - Beautiful, responsive catalog screen (\`OurAppsScreen.tsx\`) with search, filter chips, tech stack tags, status badges, and direct Play Store navigation.
   - Offline resilience with persistent local caching.

4. **Dynamic Application Sharing & Verified Package Metadata**:
   - Native Android Sharesheet via \`Intent.ACTION_SEND\` with dynamic application name, description, and listing URL.
   - Dynamic version resolution: displays real installed version code and name (\`Version 0.2.7 (Build 27)\`).

5. **Standardized Samyukt Attribution**:
   - Seamless "Made with care by Samyukt" attribution linking to https://samyukt.pro across Settings, Account Sheet, and Catalog.

### Production Deployments:
- **Web App**: Live at https://doit-web.samyukt.pro
- **API Backend**: Live at https://doit.samyukt.pro/api/v1
- **Release APK**: \`DoIt-v0.2.7-build27.apk\` (attached below with SHA256 checksum)
`;

async function main() {
  console.log('1. Checking release APK artifact...');
  if (!fs.existsSync(APK_SOURCE)) {
    console.error('APK source does not exist yet at:', APK_SOURCE);
    process.exit(1);
  }

  // Ensure release-builds dir exists
  fs.mkdirSync('K:/Doit/release-builds', { recursive: true });

  console.log('2. Copying APK to release-builds/DoIt-v0.2.7-build27.apk...');
  fs.copyFileSync(APK_SOURCE, APK_TARGET);

  console.log('3. Computing SHA256 checksum...');
  const apkBuffer = fs.readFileSync(APK_TARGET);
  const hash = crypto.createHash('sha256').update(apkBuffer).digest('hex');
  fs.writeFileSync(SHA_TARGET, `${hash}  DoIt-v0.2.7-build27.apk\n`, 'utf-8');
  console.log('SHA256:', hash);

  const releaseAssets = [`"${APK_TARGET}"`, `"${SHA_TARGET}"`];
  if (fs.existsSync(AAB_SOURCE)) {
    console.log('Copying AAB bundle...');
    fs.copyFileSync(AAB_SOURCE, AAB_TARGET);
    releaseAssets.push(`"${AAB_TARGET}"`);
  } else if (fs.existsSync(AAB_TARGET)) {
    releaseAssets.push(`"${AAB_TARGET}"`);
  }

  console.log('4. Creating GitHub Release via gh CLI...');
  const tempNotesFile = 'K:/Doit/release-notes-27.md';
  fs.writeFileSync(tempNotesFile, RELEASE_BODY, 'utf-8');

  try {
    const assetsStr = releaseAssets.join(' ');
    const cmd = `gh release create "${TAG}" ${assetsStr} --title "${RELEASE_NAME}" --notes-file "${tempNotesFile}" --target main --latest`;
    console.log('Executing:', cmd);
    const out = execSync(cmd, { stdio: 'pipe' }).toString();
    console.log('Release created successfully:\n', out);
  } catch (err) {
    console.error('gh release create failed:', err.message, err.stderr?.toString());
    process.exit(1);
  } finally {
    if (fs.existsSync(tempNotesFile)) {
      fs.unlinkSync(tempNotesFile);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

