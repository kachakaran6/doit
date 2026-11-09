$ErrorActionPreference = "Stop"
$env:ANDROID_HOME = "C:\Users\karan\AppData\Local\Android\Sdk"
$env:EXPO_PUBLIC_API_URL = "https://doit.samyukt.pro/api/v1"
$env:EXPO_PUBLIC_ENV = "production"
$env:NODE_OPTIONS = "--max-old-space-size=4096"

Set-Location -Path "K:\Doit\apps\mobile\android"
Write-Host "Building Google Play Store Android App Bundle (.aab)..."
.\gradlew.bat bundleRelease --console=plain --no-daemon

$SourceAab = "K:\Doit\apps\mobile\android\app\build\outputs\bundle\release\app-release.aab"
$TargetDir = "K:\Doit\release-builds"
$TargetAab = "$TargetDir\DoIt-v0.2.7-build27.aab"

if (Test-Path $SourceAab) {
    if (-not (Test-Path $TargetDir)) {
        New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
    }
    Copy-Item -Path $SourceAab -Destination $TargetAab -Force
    Write-Host "✔ Google Play Bundle successfully copied to: $TargetAab"
} else {
    Write-Error "AAB file not found at $SourceAab"
}
