# Pre-commit Hooks Setup Script
# Run this after cloning the repo to enable git hooks

Write-Host "🔧 Setting up pre-commit hooks for HealthBytes..." -ForegroundColor Cyan

# Check if Python is available
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Python not found. Please install Python 3.14+" -ForegroundColor Red
    exit 1
}

# Check if in backend directory
$currentPath = Get-Location
if ($currentPath.Path -notlike "*backend*") {
    Write-Host "📂 Navigating to backend directory..." -ForegroundColor Yellow
    Set-Location backend
}

# Install pre-commit
Write-Host "📦 Installing pre-commit..." -ForegroundColor Yellow
pip install pre-commit

# Install hooks
Write-Host "🪝 Installing git hooks..." -ForegroundColor Yellow
pre-commit install

# Optionally run on all files
$runOnAll = Read-Host "Would you like to run pre-commit on all files now? (y/N)"
if ($runOnAll -eq 'y' -or $runOnAll -eq 'Y') {
    Write-Host "🔍 Running pre-commit on all files..." -ForegroundColor Yellow
    pre-commit run --all-files
}

Write-Host ""
Write-Host "✅ Pre-commit hooks installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 What happens now:" -ForegroundColor Cyan
Write-Host "  - Before each commit, your code will be automatically formatted" -ForegroundColor Gray
Write-Host "  - Black will format Python code" -ForegroundColor Gray
Write-Host "  - Flake8 will check for code issues" -ForegroundColor Gray
Write-Host "  - Security checks with Bandit" -ForegroundColor Gray
Write-Host ""
Write-Host "🔧 To skip hooks temporarily: git commit --no-verify" -ForegroundColor Yellow
Write-Host "🔄 To run hooks manually: pre-commit run --all-files" -ForegroundColor Yellow
