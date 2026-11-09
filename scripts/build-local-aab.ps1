$ErrorActionPreference = "Stop"
$env:ANDROID_HOME = "C:\Users\karan\AppData\Local\Android\Sdk"
$env:EXPO_PUBLIC_API_URL = "https://doit.samyukt.pro/api/v1"
$env:EXPO_PUBLIC_ENV = "production"
$env:NODE_OPTIONS = "--max-old-space-size=4096"

Set-Location -Path "K:\Doit\apps\mobile\android"
Write-Host "Building Google Play Store Android App Bundle (.aab)..."
.\gradlew.bat bundleRelease --console=plain --no-daemon

$gradleFile = "K:\Doit\apps\mobile\android\app\build.gradle"
$versionName = "0.2.8"
$versionCode = "28"
if (Test-Path $gradleFile) {
    $content = Get-Content $gradleFile -Raw
    if ($content -match 'versionCode\s+(\d+)') {
        $versionCode = $matches[1]
    }
    if ($content -match 'versionName\s+["'']([^"'']+)["'']') {
        $versionName = $matches[1]
    }
}

$SourceAab = "K:\Doit\apps\mobile\android\app\build\outputs\bundle\release\app-release.aab"
$TargetDir = "K:\Doit\release-builds"
$TargetAab = "$TargetDir\DoIt-v$versionName-build$versionCode.aab"

if (Test-Path $SourceAab) {
    if (-not (Test-Path $TargetDir)) {
        New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
    }
    Copy-Item -Path $SourceAab -Destination $TargetAab -Force
    Write-Host "✔ Google Play Signed Release Bundle copied to: $TargetAab"
} else {
    Write-Error "AAB file not found at $SourceAab"
}

