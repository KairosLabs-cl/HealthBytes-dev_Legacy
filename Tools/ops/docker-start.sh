#!/bin/bash
# HealthBytes Docker Quick Start

set -e

echo "🐳 HealthBytes Docker Setup"
echo "================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose v2.0+."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your actual Clerk keys and secrets"
    echo "📖 See .env.example for required fields"
else
    echo "✅ .env file already exists"
fi

# Build images
echo ""
echo "🔨 Building Docker images..."
docker compose build

# Start services
echo ""
echo "🚀 Starting services..."
docker compose up -d

# Wait for PostgreSQL to be ready
echo ""
echo "⏳ Waiting for PostgreSQL to be healthy..."
sleep 10

# Run migrations
echo ""
echo "🗄️  Running database migrations..."
docker compose exec -T backend python run_migration.py || echo "⚠️  Migrations may have already been applied"

# Show status
echo ""
echo "✅ HealthBytes is now running!"
echo ""
docker compose ps
echo ""
echo "📍 Access points:"
echo "   🌐 Backend API:  http://localhost:3001"
echo "   📚 Swagger Docs: http://localhost:3001/docs"
echo "   💻 Frontend:     http://localhost:8081"
echo "   🗄️  Database:     localhost:5432"
echo ""
echo "📖 View logs:      docker compose logs -f"
echo "🛑 Stop services:  docker compose down"
echo ""
