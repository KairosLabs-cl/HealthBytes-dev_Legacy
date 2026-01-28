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
    # Try to use Python 3.14 specifically (required for HealthBytes)
    if (Get-Command py -ErrorAction SilentlyContinue) {
        try {
            Write-Host "Creating virtualenv with Python 3.14..." -ForegroundColor Yellow
            py -3.14 -m venv .venv
            return
        } catch {
            Write-Host "Python 3.14 not found, trying latest Python 3.x..." -ForegroundColor Yellow
        }
    }
    # Fallback to 'python' in PATH
    if (Get-Command python -ErrorAction SilentlyContinue) {
        Write-Host "Creating virtualenv with 'python'..." -ForegroundColor Yellow
        python -m venv .venv
        return
    }
    Write-Host "Error: Could not find Python 3.14+ to create virtualenv." -ForegroundColor Red
    Write-Host "Please install Python 3.14 from python.org" -ForegroundColor Red
    exit 1
}

function Test-VenvValid {
    $pythonPath = Join-Path ".venv" "Scripts\python.exe"
    if (-not (Test-Path $pythonPath)) {
        return $false
    }
    # Try to run python to verify it works
    try {
        $null = & $pythonPath --version 2>&1
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

# 1) Ensure virtualenv exists and is valid
if (-not (Test-Path ".venv")) {
    Write-Host "Virtualenv not found. Creating new one..." -ForegroundColor Yellow
    New-Venv
} elseif (-not (Test-VenvValid)) {
    Write-Host "Virtualenv exists but appears corrupted or has incorrect paths." -ForegroundColor Yellow
    Write-Host "Removing old virtualenv and creating a new one..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force ".venv"
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
