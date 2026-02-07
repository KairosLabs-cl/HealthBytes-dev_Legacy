param(
    [switch]$NoInstall
)

$ErrorActionPreference = "Stop"

# ============================================================================
# HEALTH CHECK SUMMARY FUNCTION
# ============================================================================
function Show-HealthSummary {
    param([array]$Logs)
    
    # Count metrics
    $warningCount = ($Logs | Select-String "WARNING|warning|deprecated" -ErrorAction SilentlyContinue).Count
    $errorCount = ($Logs | Select-String "ERROR|error|failed|Failed" -ErrorAction SilentlyContinue).Count
    $pkgCount = ($Logs | Select-String "Successfully installed" -ErrorAction SilentlyContinue).Count
    
    # Overall status
    $status = "[OK]"
    if ($errorCount -gt 0) { $status = "[ERROR]" }
    elseif ($warningCount -gt 5) { $status = "[WARN]" }
    
    Write-Host ""
    Write-Host "=== $status Health Check: " -NoNewline -ForegroundColor Cyan
    Write-Host "$pkgCount deps  |  " -NoNewline -ForegroundColor White
    Write-Host "$warningCount warnings  |  " -NoNewline -ForegroundColor Yellow
    Write-Host "$errorCount errors" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Green" })
}

# ============================================================================
# VERIFY PYTHON 3.13.1 IS AVAILABLE (from .python-version specification)
# ============================================================================
Write-Host "Checking Python version requirements..." -ForegroundColor Cyan
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "[WARNING] Python not found in PATH!" -ForegroundColor Yellow
} else {
    $pythonVersion = python --version 2>&1
    Write-Host "[OK] Using: $pythonVersion" -ForegroundColor Green
}

# Move to script directory (fastapi-service)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host " HealthBytes FastAPI - Windows Starter" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

function New-Venv {
    # Priority: pyenv local -> python command -> py launcher
    if (Get-Command python -ErrorAction SilentlyContinue) {
        $v = python --version
        Write-Host "Creating virtualenv with '$v'..." -ForegroundColor Yellow
        python -m venv .venv
        return
    }
    # Last resort: 'py' launcher
    if (Get-Command py -ErrorAction SilentlyContinue) {
        Write-Host "Creating virtualenv with 'py -3.13'..." -ForegroundColor Yellow
        py -3.13 -m venv .venv
        return
    }
    Write-Host "Error: Could not find Python 3.13.1 to create virtualenv." -ForegroundColor Red
    Write-Host "Please ensure Python 3.13.1 is installed and in PATH (via pyenv)." -ForegroundColor Red
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
$installLog = @()
if (-not $NoInstall) {
    Write-Host "Upgrading pip/setuptools/wheel..." -ForegroundColor Yellow
    $pipUpgradeOutput = python -m pip install --upgrade pip setuptools wheel 2>&1
    $installLog += $pipUpgradeOutput

    Write-Host "Installing requirements..." -ForegroundColor Yellow
    $reqOutput = python -m pip install -r requirements.txt 2>&1
    $installLog += $reqOutput
    
    # Show health summary after installation
    Write-Host ""
    Show-HealthSummary -Logs $installLog
}

# 4) Start server via run_server.py (configured reload excludes)
Write-Host ""
Write-Host "Starting FastAPI server on http://127.0.0.1:3001 ..." -ForegroundColor Green
Write-Host "Press CTRL+C to stop." -ForegroundColor Green
Write-Host ""

python run_server.py
