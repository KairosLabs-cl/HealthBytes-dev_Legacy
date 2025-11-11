param(
    [switch]$NoInstall
)

$ErrorActionPreference = "Stop"

# Move to script directory (fastapi-service)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host " HealthBytes FastAPI - Windows Starter" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

function New-Venv {
    if (Get-Command py -ErrorAction SilentlyContinue) {
        try {
            Write-Host "Creating virtualenv with 'py -3.14'..." -ForegroundColor Yellow
            py -3.14 -m venv .venv
            return
        } catch {
            Write-Host "'py -3.14' failed, trying 'py -3'..." -ForegroundColor Yellow
            try { py -3 -m venv .venv; return } catch {}
        }
    }
    Write-Host "Using system Python to create virtualenv..." -ForegroundColor Yellow
    python -m venv .venv
}

# 1) Ensure virtualenv exists
if (-not (Test-Path ".venv")) {
    New-Venv
}

# 2) Activate virtualenv
$activate = Join-Path ".venv" "Scripts/Activate.ps1"
if (-not (Test-Path $activate)) {
    throw "Virtualenv looks broken. Expected '$activate' to exist."
}
. $activate

# 3) Install/update deps (unless --NoInstall)
if (-not $NoInstall) {
    Write-Host "Upgrading pip/setuptools/wheel..." -ForegroundColor Yellow
    python -m pip install --upgrade pip setuptools wheel | Out-Host

    Write-Host "Installing requirements..." -ForegroundColor Yellow
    python -m pip install -r requirements.txt | Out-Host
}

# 4) Start server via run_server.py (configured reload excludes)
Write-Host "Starting FastAPI server on http://127.0.0.1:3001 ..." -ForegroundColor Green
Write-Host "Press CTRL+C to stop." -ForegroundColor Green
python run_server.py
