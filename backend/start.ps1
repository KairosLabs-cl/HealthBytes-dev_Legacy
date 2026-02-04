param(
    [switch]$NoInstall
)

$ErrorActionPreference = "Stop"

# ============================================================================
# VERIFY PYTHON 3.14.2 IS AVAILABLE (from .python-version specification)
# ============================================================================
Write-Host "Checking Python version requirements..." -ForegroundColor Cyan
if (-not (Get-Command python3.14 -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️  WARNING: Python 3.14.2 not found in PATH!" -ForegroundColor Yellow
    Write-Host "   The project requires Python 3.14.2 as specified in .python-version" -ForegroundColor Yellow
    Write-Host "   Current Python version:" -ForegroundColor Yellow
    if (Get-Command python -ErrorAction SilentlyContinue) {
        python --version
    } else {
        Write-Host "   No Python found in PATH" -ForegroundColor Red
    }
    Write-Host "   Please install Python 3.14.2 from https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host "   Or add it to your PATH." -ForegroundColor Yellow
} else {
    $pythonVersion = python3.14 --version 2>&1
    Write-Host "✅ Using: $pythonVersion" -ForegroundColor Green
}

# Move to script directory (fastapi-service)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host " HealthBytes FastAPI - Windows Starter" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

function New-Venv {
    # Priority: Python 3.14.2 (from .python-version spec) -> python command -> py launcher
    if (Get-Command python3.14 -ErrorAction SilentlyContinue) {
        Write-Host "Creating virtualenv with 'python3.14' (Python 3.14.2)..." -ForegroundColor Yellow
        python3.14 -m venv .venv
        return
    }
    # Fallback to generic 'python' if python3.14 not found
    if (Get-Command python -ErrorAction SilentlyContinue) {
        Write-Host "Creating virtualenv with 'python'..." -ForegroundColor Yellow
        python -m venv .venv
        return
    }
    # Last resort: 'py' launcher if python is not in PATH
    if (Get-Command py -ErrorAction SilentlyContinue) {
        try {
            Write-Host "Creating virtualenv with 'py -3.14'..." -ForegroundColor Yellow
            py -3.14 -m venv .venv
            return
        } catch {
            Write-Host "Python 3.14 not available via 'py' launcher, trying 'py -3'..." -ForegroundColor Yellow
            py -3 -m venv .venv
            return
        }
    }
    Write-Host "Error: Could not find Python 3.14.2 to create virtualenv." -ForegroundColor Red
    Write-Host "Please ensure Python 3.14.2 is installed and in PATH." -ForegroundColor Red
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
