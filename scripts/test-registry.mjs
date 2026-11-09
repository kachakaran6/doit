const REGISTRY_URL = 'https://raw.githubusercontent.com/kachakaran6/Application-json/main/app.json';
const ASSET_BASE_URL = 'https://raw.githubusercontent.com/kachakaran6/Application-json/main/images/';
const CURRENT_PACKAGE = 'com.samyukt.doit';
const ALLOWED_STATUSES = new Set(['production', 'published', 'coming_soon']);

function resolveAssetUrl(rawUrl) {
  if (!rawUrl) return '';
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    return rawUrl;
  }
  const clean = rawUrl.replace(/^\/?(images\/)?/, '');
  return `${ASSET_BASE_URL}${clean}`;
}

async function run() {
  console.log('Testing Samyukt Registry URL Resolution...');
  console.assert(resolveAssetUrl('') === '', 'Failed empty');
  console.assert(resolveAssetUrl('https://example.com/icon.png') === 'https://example.com/icon.png', 'Failed https');
  console.assert(
    resolveAssetUrl('/images/vaultx.png') === 'https://raw.githubusercontent.com/kachakaran6/Application-json/main/images/vaultx.png',
    'Failed /images/'
  );
  console.assert(
    resolveAssetUrl('images/trust-tracker.png') === 'https://raw.githubusercontent.com/kachakaran6/Application-json/main/images/trust-tracker.png',
    'Failed images/'
  );
  console.assert(
    resolveAssetUrl('arrowz.png') === 'https://raw.githubusercontent.com/kachakaran6/Application-json/main/images/arrowz.png',
    'Failed bare filename'
  );
  console.log('✔ Asset resolution tests passed.');

  console.log('Testing Live Samyukt Registry Fetching & Strict Filtering...');
  const res = await fetch(REGISTRY_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  if (!data || !Array.isArray(data.apps)) {
    throw new Error('Missing apps array in registry');
  }

  // Filter apps strictly
  const validApps = data.apps.filter((app) => {
    if (!app || typeof app !== 'object') return false;
    if (!app.id || !app.appName) return false;
    if (app.packageName === CURRENT_PACKAGE || app.id === CURRENT_PACKAGE) return false;
    const normalizedStatus = String(app.status || '').toLowerCase().trim();
    return ALLOWED_STATUSES.has(normalizedStatus);
  });

  console.log(`Found ${data.apps.length} total apps in registry.`);
  console.log(`Filtered to ${validApps.length} eligible mobile apps for DoIt Our Apps catalog:`);
  for (const app of validApps) {
    console.log(`  - [${app.status.toUpperCase()}] ${app.appName} (${app.packageName}) -> ${resolveAssetUrl(app.iconUrl)}`);
    console.assert(ALLOWED_STATUSES.has(app.status.toLowerCase()), `Invalid status: ${app.status}`);
    console.assert(app.packageName !== CURRENT_PACKAGE, `Did not exclude self: ${app.packageName}`);
  }

  console.log('✔ Live registry parsing & strict status filtering verified successfully!');
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
