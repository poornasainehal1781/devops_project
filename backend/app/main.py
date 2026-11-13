import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import engine, Base
import app.models  # Ensures all models are registered with Base.metadata
from app.seed import seed_database
from app.routers import (
    auth,
    users,
    doctors,
    patients,
    appointments,
    medical_records,
    reports,
    stats
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables if not exist
    Base.metadata.create_all(bind=engine)
    # Seed initial test data
    try:
        seed_database()
    except Exception as e:
        print(f"Seed info: {e}")
    yield

app = FastAPI(
    title="Online Hospital Appointment and Patient Management System API",
    description="Enterprise-grade REST API powering multi-role hospital management, scheduling, electronic medical records, and reporting.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local dev & frontend deployments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    # Keep standard FastAPI HTTPExceptions default, catch unexpected exceptions
    from fastapi.exceptions import RequestValidationError, HTTPException
    if isinstance(exc, (HTTPException, RequestValidationError)):
        raise exc
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected server error occurred.", "error": str(exc)}
    )

# Include Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(doctors.router)
app.include_router(patients.router)
app.include_router(appointments.router)
app.include_router(medical_records.router)
app.include_router(reports.router)
app.include_router(stats.router)

@app.get("/", tags=["Health Check"])
def root():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "environment": settings.ENV,
        "docs_url": "/docs",
        "openapi_url": "/openapi.json"
    }

@app.get("/api/health", tags=["Health Check"])
def health_check():
    return {"status": "ok", "timestamp": str(os.getenv("SERVER_TIME", "2026-11-02"))}

