from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
from database import engine, Base
from routers import auth, scan, profile, notifications, referrals, coins

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
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(scan.router, prefix="/scan", tags=["scan"])
app.include_router(profile.router, prefix="/api", tags=["profile"])
app.include_router(notifications.router, prefix="/api", tags=["notifications"])
app.include_router(referrals.router, prefix="/api", tags=["referrals"])
app.include_router(coins.router, prefix="/api", tags=["coins"])

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
