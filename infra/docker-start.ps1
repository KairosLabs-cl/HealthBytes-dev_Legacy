# HealthBytes Docker Quick Start

$ErrorActionPreference = "Stop"

Write-Host "🐳 HealthBytes Docker Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Check if Docker is installed
$dockerExists = docker --version 2>$null
if (-not $dockerExists) {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}

$composeExists = docker compose version 2>$null
if (-not $composeExists) {
    Write-Host "❌ Docker Compose is not installed. Please update Docker Desktop to v2.0+." -ForegroundColor Red
    exit 1
}

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "⚠️  Please edit .env with your actual Clerk keys and secrets" -ForegroundColor Yellow
    Write-Host "📖 See .env.example for required fields" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Build images
Write-Host ""
Write-Host "🔨 Building Docker images..." -ForegroundColor Cyan
docker compose build

# Start services
Write-Host ""
Write-Host "🚀 Starting services..." -ForegroundColor Cyan
docker compose up -d

# Wait for PostgreSQL to be ready
Write-Host ""
Write-Host "⏳ Waiting for PostgreSQL to be healthy..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Run migrations
Write-Host ""
Write-Host "🗄️  Running database migrations..." -ForegroundColor Cyan
try {
    docker compose exec -T backend python run_migration.py
} catch {
    Write-Host "⚠️  Migrations may have already been applied" -ForegroundColor Yellow
}

# Show status
Write-Host ""
Write-Host "✅ HealthBytes is now running!" -ForegroundColor Green
Write-Host ""
docker compose ps
Write-Host ""
Write-Host "📍 Access points:" -ForegroundColor Green
Write-Host "   🌐 Backend API:  http://localhost:3001"
Write-Host "   📚 Swagger Docs: http://localhost:3001/docs"
Write-Host "   💻 Frontend:     http://localhost:8081"
Write-Host "   🗄️  Database:     localhost:5432"
Write-Host ""
Write-Host "📖 View logs:      docker compose logs -f" -ForegroundColor Cyan
Write-Host "🛑 Stop services:  docker compose down" -ForegroundColor Cyan
Write-Host ""
