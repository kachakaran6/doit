import fs from 'fs';
import path from 'path';

const TOKEN = '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';
const REPO = 'kachakaran6/doit';
const TAG = 'v0.1.0+20';
const RELEASE_NAME = 'DoIt v0.1.0 — Release Build 20 (Team Invitations, SMTP Config & Shareable Links)';
const APK_PATH = 'K:/Doit/release-builds/DoIt-v0.1.0-build20.apk';
const SHA_PATH = 'K:/Doit/release-builds/DoIt-v0.1.0-build20.apk.sha256';

const RELEASE_BODY = `## DoIt v0.1.0 — Release Build 20

### Key Highlights & Enhancements in Build 20:

1. **Team Invitations System (Dual Delivery Channels)**:
   - **Method A — Email Invitations**: Send workspace invitations directly to teammate emails with role assignment (OWNER, ADMIN, MEMBER, VIEWER, TESTER), configurable expiration, and custom invitation email template.
   - **Method B — Shareable Invitation Links**: Generate cryptographic single-use or multi-use invitation links (\`https://doit.kachakaran.tech/invite/{token}\`). Works 100% independently without any SMTP setup.
   - One-tap sharing to WhatsApp, Telegram, Android native share sheet, or system clipboard.

2. **Enterprise SMTP Configuration**:
   - Secure SMTP configuration (Host, Port, Username, Password, From Address, Sender Name, TLS/SSL).
   - Passwords encrypted at rest using AES-256-GCM.
   - Dynamic credentials testing with instant connectivity verification and test email dispatch.

3. **Complete Mobile & Web Team Management**:
   - **Mobile (\`apps/mobile\`)**: Native \`TeamMembersScreen\` with member roles, pending invitations badge, revoke/resend actions, and rich invitation sheet.
   - **Deep Linking**: Deep-link support for \`doit://invite/{token}\` and \`https://doit.kachakaran.tech/invite/{token}\` routing to \`InviteAcceptScreen\`.
   - **Web (\`apps/web\`)**: Full-featured \`TeamPage\` and public \`InviteAcceptPage\` with authenticated join and new-user registration workflows.

4. **Security & Cryptography**:
   - Raw tokens are never stored in the database. Only cryptographically secure SHA-256 token hashes are persisted.
   - Atomic transaction guarantees preventing race conditions, expired link reuse, or duplicate workspace memberships.

### Downloads:
- **APK**: \`DoIt-v0.1.0-build20.apk\` (35.9 MB)
`;

async function main() {
  console.log('1. Checking existing release or creating new release for tag', TAG);

  let releaseId;
  let uploadUrlTemplate;

  const getReleaseRes = await fetch(`https://api.github.com/repos/${REPO}/releases/tags/${TAG}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'node',
    },
  });

  if (getReleaseRes.ok) {
    const existing = await getReleaseRes.json();
    releaseId = existing.id;
    uploadUrlTemplate = existing.upload_url;
    console.log('Found existing release with ID:', releaseId);

    await fetch(`https://api.github.com/repos/${REPO}/releases/${releaseId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'node',
      },
      body: JSON.stringify({
        name: RELEASE_NAME,
        body: RELEASE_BODY,
        draft: false,
        prerelease: false,
      }),
    });
  } else {
    const createRes = await fetch(`https://api.github.com/repos/${REPO}/releases`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'node',
      },
      body: JSON.stringify({
        tag_name: TAG,
        name: RELEASE_NAME,
        body: RELEASE_BODY,
        draft: false,
        prerelease: false,
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error('Failed to create release:', createRes.status, errText);
      process.exit(1);
    }

    const created = await createRes.json();
    releaseId = created.id;
    uploadUrlTemplate = created.upload_url;
    console.log('Created release with ID:', releaseId);
  }

  async function uploadAsset(filePath, mimeType) {
    const fileName = path.basename(filePath);
    const fileBytes = fs.readFileSync(filePath);
    console.log(`\nUploading ${fileName} (${fileBytes.length} bytes)...`);

    const assetsRes = await fetch(`https://api.github.com/repos/${REPO}/releases/${releaseId}/assets`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'node',
      },
    });

    if (assetsRes.ok) {
      const assets = await assetsRes.json();
      const existingAsset = assets.find((a) => a.name === fileName);
      if (existingAsset) {
        console.log(`Asset ${fileName} already exists (ID: ${existingAsset.id}). Deleting old asset...`);
        await fetch(`https://api.github.com/repos/${REPO}/releases/assets/${existingAsset.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            Accept: 'application/vnd.github+json',
            'User-Agent': 'node',
          },
        });
      }
    }

    const uploadUrl = uploadUrlTemplate.replace(/\{(\?name,label)?\}/, `?name=${encodeURIComponent(fileName)}`);
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': mimeType,
        'Content-Length': fileBytes.length.toString(),
        'User-Agent': 'node',
      },
      body: fileBytes,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error(`Failed to upload ${fileName}:`, uploadRes.status, errText);
    } else {
      const data = await uploadRes.json();
      console.log(`✓ Uploaded ${fileName}: ${data.browser_download_url}`);
    }
  }

  await uploadAsset(APK_PATH, 'application/vnd.android.package-archive');
  await uploadAsset(SHA_PATH, 'text/plain');

  console.log(`\nAll assets published successfully to GitHub Release: https://github.com/kachakaran6/doit/releases/tag/${TAG}`);
}

main().catch((err) => {
  console.error('Script error:', err);
  process.exit(1);
});
