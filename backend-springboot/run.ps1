# Load .env file and run Spring Boot
# Usage: .\run.ps1

if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        if ($_ -and $_.Contains('=')) {
            $key, $value = $_.Split('=', 2)
            [Environment]::SetEnvironmentVariable($key, $value, 'Process')
        }
    }
    Write-Host "Loaded environment variables from .env" -ForegroundColor Green
} else {
    Write-Host "Warning: .env file not found. Copy .env.example to .env and fill in your values." -ForegroundColor Yellow
}

.\mvnw spring-boot:run
