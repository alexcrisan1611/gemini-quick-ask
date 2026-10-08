# Builds the Chrome Web Store package: dist\quick-ask-for-gemini-<version>.zip
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$version = (Get-Content manifest.json -Raw | ConvertFrom-Json).version
$files = @(
  "manifest.json",
  "background.js", "content.js", "settings.js", "ui.js", "ui.css",
  "popup.html", "popup.js", "options.html", "options.js",
  "icon16.png", "icon32.png", "icon48.png", "icon128.png"
)

New-Item -ItemType Directory -Force dist | Out-Null
$zip = "dist\quick-ask-for-gemini-$version.zip"
if (Test-Path $zip) { Remove-Item $zip }

Compress-Archive -Path $files -DestinationPath $zip
Write-Output "Built $zip"
