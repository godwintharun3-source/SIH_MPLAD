# ==============================================================================
# Multi-Stage Production Dockerfile for MPLAD AI Risk & Anomaly Intelligence System
# Builds React frontend and serves everything via FastAPI on port 8000
# ==============================================================================

# --- Stage 1: Build Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# --- Stage 2: Python Backend & Static Server ---
FROM python:3.11-slim AS production
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Install system dependencies (curl for health check, sqlite3)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend, data, and models
COPY backend/ ./backend/
COPY data/ ./data/
COPY ml_models/ ./ml_models/

# Copy built frontend assets from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Decompress sqlite database if needed
RUN python3 -c 'from backend.app.database import DB_PATH; print(f"Database verified at {DB_PATH}")'

EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Start FastAPI application
CMD uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT}
