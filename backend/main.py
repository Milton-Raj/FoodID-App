from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
from backend.database import engine, Base
from backend.routers import (
    auth, scan, profile, 
    notifications as notif_router, 
    referrals, coins, admin, admin_management,
    admin_auth, settings, security, user_management
)

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FoodID API", version="0.2.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(scan.router, prefix="/api/scan", tags=["scan"])
app.include_router(profile.router, prefix="/api", tags=["profile"])
app.include_router(referrals.router, prefix="/api/admin", tags=["referrals"])
app.include_router(coins.router, prefix="/api", tags=["coins"])
app.include_router(notif_router.router, prefix="/api/admin", tags=["notifications"])
app.include_router(admin_management.router, prefix="/api/admin", tags=["admin-management"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

# New routers for advanced admin system
app.include_router(admin_auth.router, prefix="/api/admin", tags=["admin-auth"])
app.include_router(settings.router, prefix="/api/admin", tags=["settings"])
app.include_router(security.router, prefix="/api/admin", tags=["security"])
app.include_router(user_management.router, prefix="/api/admin", tags=["user-management"])

# Create directories if they don't exist
os.makedirs("uploads", exist_ok=True)
os.makedirs("uploads/profile_images", exist_ok=True)

# Mount uploads directory to serve static files
app.mount("/static", StaticFiles(directory="uploads"), name="static")

@app.get("/")
def read_root():
    return {"message": "Welcome to FoodID API v0.2.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
