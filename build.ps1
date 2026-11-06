$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

bun run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$version = (Get-Content manifest.json -Raw | ConvertFrom-Json).version
$zip = "dist\quick-ask-for-gemini-$version.zip"
if (Test-Path $zip) { Remove-Item $zip }

Compress-Archive -Path dist\extension\* -DestinationPath $zip
Write-Output "Built $zip"
