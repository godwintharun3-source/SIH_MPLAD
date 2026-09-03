"""
Main FastAPI Application Entrypoint
MPLAD AI Risk & Anomaly Intelligence System (SIH26102 - MoSPI)
"""

import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.app.api.endpoints import router as api_router

app = FastAPI(
    title="MPLAD AI Risk & Anomaly Intelligence System",
    description="AI-assisted project monitoring, anomaly intelligence, and decision-support for MPLAD Scheme implementation (MoSPI)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for React frontend development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app.include_router(api_router)

DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))

if os.path.exists(DIST_DIR) and os.path.isfile(os.path.join(DIST_DIR, "index.html")):
    assets_dir = os.path.join(DIST_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        if full_path.startswith("api/") or full_path in ["api", "docs", "redoc", "openapi.json"]:
            return JSONResponse(status_code=404, content={"detail": "Not found"})
        target = os.path.join(DIST_DIR, full_path)
        if os.path.isfile(target):
            return FileResponse(target)
        return FileResponse(os.path.join(DIST_DIR, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "title": "MPLAD AI Risk & Anomaly Intelligence System",
            "description": "AI-assisted monitoring and prioritization of development works",
            "ministry": "Ministry of Statistics and Programme Implementation (MoSPI)",
            "api_docs": "/docs",
            "version": "1.0.0",
            "mode": "PROTOTYPE / DEMO ANALYSIS"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
