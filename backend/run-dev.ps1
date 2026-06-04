# Load backend/.env and start Spring Boot (Windows PowerShell)
$envFile = Join-Path $PSScriptRoot ".env"
if (-not (Test-Path $envFile)) {
    Write-Error "Missing $envFile - copy .env.example to .env and set MONGODB_URI."
    exit 1
}

Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        Set-Item -Path "env:$name" -Value $value
    }
}

Set-Location $PSScriptRoot
mvn spring-boot:run @args
