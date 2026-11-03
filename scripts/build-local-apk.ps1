$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path "D:\gradle_cache" | Out-Null
New-Item -ItemType Directory -Force -Path "D:\temp" | Out-Null
$env:GRADLE_USER_HOME = "D:\gradle_cache"
$env:TEMP = "D:\temp"
$env:TMP = "D:\temp"
$env:ANDROID_HOME = "C:\Users\karan\AppData\Local\Android\Sdk"
$env:EXPO_PUBLIC_API_URL = "https://doit.samyukt.pro/api/v1"
$env:EXPO_PUBLIC_ENV = "production"

Set-Location -Path "K:\Doit\apps\mobile\android"
.\gradlew.bat assembleRelease
