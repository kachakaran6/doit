$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path "D:\temp" | Out-Null
$env:TEMP = "D:\temp"
$env:TMP = "D:\temp"
Set-Location -Path "K:\Doit\apps\mobile"
npx eas-cli build -p android --profile production --non-interactive

