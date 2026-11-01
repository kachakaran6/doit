# DoIt Installation & Deployment Guide

This guide covers two setup pathways:
1. Installing the standalone Android APK on a physical Android device.
2. Self-hosting the backend infrastructure via Docker Compose or Coolify.

---

## 1. Android Mobile Installation

### 1.1 Requirements
- Android 9.0 (API Level 28) or higher
- Device architecture: `arm64-v8a`, `armeabi-v7a`, `x86`, or `x86_64`
- ~50 MB free storage

### 1.2 Direct APK Installation
1. Go to the latest [GitHub Release](https://github.com/kachakaran6/doit/releases) on your phone's browser.
2. Download `DoIt-v0.1.0-build1.apk`.
3. Open your device **Downloads** or File Manager and tap the downloaded `.apk`.
4. When prompted by Android:
   - Tap **Settings** -> enable **Allow from this source**.
   - Tap **Install**.
5. Launch **DoIt** from your app launcher.

### 1.3 Verifying File Integrity
Verify the SHA-256 checksum before installation:
```bash
# Windows PowerShell
Get-FileHash -Algorithm SHA256 .\DoIt-v0.1.0-build1.apk

# Compare with DoIt-v0.1.0-build1.apk.sha256
```

### 1.4 Permissions Explained
| Permission | Why DoIt Needs It |
| :--- | :--- |
| `POST_NOTIFICATIONS` | Task reminders, due date alerts, and sync notifications |
| `RECORD_AUDIO` | Quick voice notes and audio task transcription |
| `SYSTEM_ALERT_WINDOW` | Optional floating Quick-Capture overlay bubble |
| `FOREGROUND_SERVICE` | Reliable background audio processing and offline sync |

---

## 2. Backend Self-Hosting (Docker Compose)

For running your own private instance:

### 2.1 Prerequisites
- Docker Engine 24+ and Docker Compose v2+
- Port 3000 (API) and Port 5432 (PostgreSQL) available

### 2.2 Quick Start
```bash
# Clone the repository
git clone https://github.com/kachakaran6/doit.git
cd doit

# Copy production environment template
cp apps/api/.env.example apps/api/.env

# Launch the production compose stack
docker compose -f docker-compose.coolify.yml up -d
```

### 2.3 Verification
Check that the service is operational:
```bash
curl -i http://localhost:3000/api/v1/health
```
Expected output:
```json
{"status":"ok","db":"up","version":"0.1.0"}
```
