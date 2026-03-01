# Multi-stage build for FastAPI backend
#
# Python version policy:
#   - Image uses python:3.13-slim (latest stable with official Docker image).
#   - Local dev runs Python 3.14.2 (no stable Docker image yet as of 2026-02).
#   - pyproject.toml requires >=3.12, so 3.13 satisfies all constraints.
#   - When python:3.14-slim is stable, bump both stages and ci.yml together.

# Stage 1: Builder
FROM python:3.13-slim as builder

WORKDIR /build

# Install system dependencies for building
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Runtime
FROM python:3.13-slim

WORKDIR /app

# Install runtime dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy Python dependencies from builder
COPY --from=builder /root/.local /root/.local

# Copy application code + migrations
COPY app ./app
COPY alembic ./alembic
COPY alembic.ini ./alembic.ini

# Set environment variables
ENV PATH=/root/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Expose port
EXPOSE 3001

# Run the application
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3001"]
