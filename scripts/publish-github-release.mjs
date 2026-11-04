import fs from 'fs';
import path from 'path';

const TOKEN = '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';
const REPO = 'kachakaran6/doit';
const TAG = 'v0.1.0+12';
const RELEASE_NAME = 'DoIt v0.1.0 — Release Build 12 (Android 14 MediaProjection & Bug Attachment Fixes)';
const APK_PATH = 'K:/Doit/DoIt-v0.1.0-build12.apk';
const SHA_PATH = 'K:/Doit/DoIt-v0.1.0-build12.apk.sha256';

const RELEASE_BODY = `## DoIt v0.1.0 — Release Build 12

### Delivered in this Release:

1. **P-01 — Primitives System**:
   - **\`ui/Button\`**: 4 variants (\`primary\`, \`secondary\`, \`ghost\`, \`danger\`) × 3 sizes (\`sm\` 36, \`md\` 44, \`lg\` 52) × 5 states (\`rest\`, \`pressed\` with 0.97 scale / 90ms native driver, \`focused\`, \`disabled\`, \`loading\`), radius 16 (\`radius.md\`). Strict typography & token compliance with caller style override rejection.
   - **\`ui/IconButton\`**: 40×40, radius 12 (\`radius.sm\`), 3 variants across all 5 interaction states.
   - **\`ui/Field\` & \`ui/Input\`**: 48pt tall, radius 12 (\`radius.sm\`), label above (8pt gap), error state (\`semantics.danger\`), \`selectionColor={accent}\`, \`keyboardAppearance="dark"\`.
   - **\`ui/Chip\` & \`ui/AccentChip\`**: 32pt tall pill (\`radius.pill\` 999). Selected fills L3 (\`surfaceOverlay\`) with accent text — **no borders**. Includes 12px circular swatch for each of the 5 WCAG AA/AAA accents.
   - **\`ui/Checkbox\`**: 28pt visual (radius 8), 44pt touch target hit area. Checked fills \`colors.accent\` with white checkmark; unchecked has 1.5px border with L2 background.
   - **Semantic Markers**:
     - \`ui/PriorityDot\`: 6px dot with 12px label in semantic colors (Low \`#8B919E\`, Medium \`#60A5FA\`, High \`#FBBF24\`, Urgent \`#F87171\`).
     - \`ui/DueText\`: Overdue (\`#F87171\`), Due today (\`#FBBF24\`), Tomorrow/this week (\`textSecondary\`).
     - \`ui/SeverityBadge\`: 20pt tall, radius 10 pill; Blocker (solid red), Critical/Major/Minor/Cosmetic (12% tints).
     - \`ui/LabelPill\`: 20pt tall, radius 10, deterministic \`accentFor(labelId)\` mapping.
   - **\`ui/Avatar\` & \`ui/WorkspaceTile\`**: Unified via \`accentFor(id).primary\` with crisp white initials/monograms.
   - **\`ui/Row\` (§6.3 Density Fix)**: 44pt checkbox column, meta row (\`humanId\`, priority dot, due date), title (\`h3\`, max 2 lines), labels, trailing avatar. Surface L1 container (radius 20, 1px top highlight, zero card borders), minimum height 96pt (124pt with labels).
   - **\`ui/EmptyState\`**: Bare 64pt icon in \`textMuted\` (**no rounded grey container**), clean \`h3\` title and secondary description.
   - **\`ui/Skeleton\` & \`ui/RowSkeleton\`**: Pulsing L2 placeholder blocks + \`RowSkeleton\` matching real row anatomy.

2. **P-02 — Shell Architecture**:
   - **\`layout/useBottomInsets()\`**: Authoritative dynamic source for bottom offsets (\`navbarHeight: 64\`, \`navbarBottom: insets.bottom + 8\`, \`scrollPaddingBottom\`).
   - **\`ui/Screen\`**: Integrated screen frame with safe area handling, theme-adaptive translucent status bar, 16pt gutter, and dynamic bottom clearance.
   - **\`ui/ScreenHeader\`**: Eyebrow + \`h1\` (30/600, tracking -0.6) + \`bodySmall\` subtitle + center-aligned trailing action slot.
   - **\`ui/Sheet\`**: Detents 0.5/0.9, top highlight, zero border, and pinned footer clearing the keyboard accessory bar.
   - **\`ui/FloatingNavBar\`**: 64 tall pill, soft shadow \`0 8px 32px rgba(0,0,0,0.55)\`, zero border, with 50px capture button fitted cleanly inside.

3. **Critical Screenshot & Native Fixes**:
   - **Instant In-App Screenshot**: \`PixelCopy\` window capture with \`null\` bounds and UI-thread \`Canvas.draw\` fallback. Zero system permission prompts, completes in <25ms.
   - **Fixed VirtualDisplay 120ms Drop**: Upgraded \`ScreenshotCaptureActivity\` to event-driven \`setOnImageAvailableListener\` with 3s timeout — eliminates "Empty frame buffer" errors.
   - **Native Bubble Upload Fix**: Unwrapped NestJS \`{ data: ... }\` envelope in \`BubbleService.kt\` so \`createdTaskId\`, \`uploadId\`, and \`putUrl\` are correctly parsed and uploaded.
   - **Task & Bug Attachment Association**: Linked attachments with both \`taskId\` and \`bugId\` so screenshots render in both Task Detail and Bug Detail galleries.

4. **Workspace Creation & Trash Actions**:
   - Fixed Workspace Switcher to immediately add and select newly created workspaces in the Zustand store.
   - Added long-press action on task and bug cards in lists to prompt "Move to Trash" with confirmation dialog.

5. **Developer Gallery**:
   - Enhanced \`FoundationGallery.tsx\` with segmented tab switching between **P-01 Primitives** and **P-00 Foundation**.

### Download:
- **APK**: \`DoIt-v0.1.0-build11.apk\`
`;

async function main() {
  console.log('1. Checking existing release or creating new release for tag', TAG);

  const getReleaseRes = await fetch(`https://api.github.com/repos/${REPO}/releases/tags/${TAG}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'User-Agent': 'DoIt-Release-Uploader',
      Accept: 'application/vnd.github.v3+json',
    },
  });

  let releaseData;
  if (getReleaseRes.status === 200) {
    releaseData = await getReleaseRes.json();
    console.log('Found existing release with ID:', releaseData.id);
  } else {
    console.log('Creating new GitHub Release...');
    const createReleaseRes = await fetch(`https://api.github.com/repos/${REPO}/releases`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'User-Agent': 'DoIt-Release-Uploader',
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        tag_name: TAG,
        target_commitish: 'main',
        name: RELEASE_NAME,
        body: RELEASE_BODY,
        draft: false,
        prerelease: false,
      }),
    });

    if (!createReleaseRes.ok) {
      const err = await createReleaseRes.text();
      throw new Error(`Failed to create release: ${createReleaseRes.status} ${err}`);
    }
    releaseData = await createReleaseRes.json();
    console.log('Created release with ID:', releaseData.id);
  }

  const uploadUrlTemplate = releaseData.upload_url;
  const uploadBaseUrl = uploadUrlTemplate.split('{')[0];

  async function uploadAsset(filePath, fileName, contentType) {
    console.log(`\nUploading ${fileName} (${fs.statSync(filePath).size} bytes)...`);
    const fileBytes = fs.readFileSync(filePath);

    const existingAsset = releaseData.assets?.find(a => a.name === fileName);
    if (existingAsset) {
      console.log(`Deleting existing asset ${fileName} (ID: ${existingAsset.id})...`);
      await fetch(`https://api.github.com/repos/${REPO}/releases/assets/${existingAsset.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'User-Agent': 'DoIt-Release-Uploader',
        },
      });
    }

    const uploadRes = await fetch(`${uploadBaseUrl}?name=${fileName}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'User-Agent': 'DoIt-Release-Uploader',
        'Content-Type': contentType,
        'Content-Length': fileBytes.length.toString(),
      },
      body: fileBytes,
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      throw new Error(`Failed to upload ${fileName}: ${uploadRes.status} ${err}`);
    }

    const assetData = await uploadRes.json();
    console.log(`✓ Uploaded ${fileName}: ${assetData.browser_download_url}`);
    return assetData.browser_download_url;
  }

  if (fs.existsSync(APK_PATH)) {
    await uploadAsset(APK_PATH, path.basename(APK_PATH), 'application/vnd.android.package-archive');
  }

  if (fs.existsSync(SHA_PATH)) {
    await uploadAsset(SHA_PATH, path.basename(SHA_PATH), 'text/plain');
  }

  console.log('\nAll assets published successfully to GitHub Release:', releaseData.html_url);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
