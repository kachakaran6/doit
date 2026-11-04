$ErrorActionPreference = "Stop"
$env:ANDROID_HOME = "C:\Users\karan\AppData\Local\Android\Sdk"
$env:EXPO_PUBLIC_API_URL = "https://doit.samyukt.pro/api/v1"
$env:EXPO_PUBLIC_ENV = "production"
$env:NODE_OPTIONS = "--max-old-space-size=4096"

Set-Location -Path "K:\Doit\apps\mobile\android"
.\gradlew.bat assembleRelease --console=plain --no-daemon
