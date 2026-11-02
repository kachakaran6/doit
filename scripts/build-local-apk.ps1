$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path "D:\gradle_cache" | Out-Null
New-Item -ItemType Directory -Force -Path "D:\temp" | Out-Null
$env:JAVA_HOME = "D:\jdk-17"
$env:PATH = "D:\jdk-17\bin;$env:PATH"
$env:GRADLE_USER_HOME = "D:\gradle_cache"
$env:TEMP = "C:\Users\karan\AppData\Local\Temp"
$env:TMP = "C:\Users\karan\AppData\Local\Temp"
$env:ANDROID_HOME = "C:\Users\karan\AppData\Local\Android\Sdk"
$env:EXPO_PUBLIC_API_URL = "https://doit.samyukt.pro/api/v1"
$env:EXPO_PUBLIC_ENV = "production"

Set-Location -Path "K:\Doit\apps\mobile\android"
.\gradlew.bat :react-native-gesture-handler:generateCodegenArtifactsFromSchema :react-native-screens:generateCodegenArtifactsFromSchema assembleRelease
