# DoIt Release Engineering & Versioning Guide

## 1. Versioning Strategy (`VERSION+BUILD`)

DoIt follows strict Semantic Versioning (`SemVer 2.0`) combined with an incremental build number convention:

$$\text{Version String} = \text{MAJOR}.\text{MINOR}.\text{PATCH} + \text{BUILD\_NUMBER}$$

### Production Release Progression

- **First Production Release**: `0.1.0+1`
  - `expo.version`: `0.1.0`
  - `android.versionCode`: `1`
- **Subsequent Patches & Builds**:
  - `0.1.0+2` (Hotfix / maintenance build 2)
  - `0.1.0+3` (Maintenance build 3)
  - `0.1.1+4` (Patch release 4)
  - `0.2.0+5` (Minor feature release 5)
  - `1.0.0+6` (Major production milestone 6)

### Rules & Invariants
1. **Never Reuse `versionCode`**: The Android operating system and package installer strictly require monotonically increasing integer values for `versionCode`.
2. **Synchronized Build Metadata**: In `apps/mobile/app.config.ts`, `expo.version` must match the SemVer string and `android.versionCode` must match the build number suffix after the `+`.
3. **Local Version Source**: `apps/mobile/eas.json` specifies `"appVersionSource": "local"` to ensure that code control via Git is the single source of truth.

---

## 2. Android Build Architecture (EAS Build)

The Android release artifact is generated via Expo Application Services (EAS):

```bash
# Build standalone production APK
cd apps/mobile
npx eas build -p android --profile production --non-interactive
```

### Profile Configuration (`apps/mobile/eas.json`):
```json
{
  "production": {
    "distribution": "internal",
    "android": {
      "buildType": "apk"
    },
    "env": {
      "EXPO_PUBLIC_API_URL": "https://doit-api.kachakaran.me/api/v1",
      "EXPO_PUBLIC_ENV": "production"
    }
  }
}
```

---

## 3. GitHub Release Packaging & Asset Checksums

Every production release published to GitHub must contain:
1. `DoIt-v<VERSION>-build<BUILD>.apk` (Signed, standalone Android application package)
2. `DoIt-v<VERSION>-build<BUILD>.apk.sha256` (Cryptographic verification checksum)
3. Full release notes describing features, fixes, and ecosystem changes.

### Checksum Generation (Windows / Linux)
```powershell
# Windows
CertUtil -hashfile "DoIt-v0.1.0-build1.apk" SHA256 > "DoIt-v0.1.0-build1.apk.sha256"

# Linux / macOS
sha256sum DoIt-v0.1.0-build1.apk > DoIt-v0.1.0-build1.apk.sha256
```
