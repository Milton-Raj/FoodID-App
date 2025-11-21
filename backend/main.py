from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import os
from database import engine, Base
from routers import auth, scan

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FoodID API", version="0.1.0")

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(scan.router, prefix="/scan", tags=["scan"])

# Create uploads directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)

# Mount uploads directory to serve static files
app.mount("/static", StaticFiles(directory="uploads"), name="static")

@app.get("/")
def read_root():
    return {"message": "Welcome to FoodID API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
