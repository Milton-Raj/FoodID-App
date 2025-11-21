# Project Run Walkthrough

I have successfully started both the backend and the mobile application. Here are the details:

## Backend
- **Status**: Running on `http://localhost:8000`
- **Health Check**: `http://localhost:8000/health` returned `{"status":"healthy"}`
- **Fixes Applied**:
    - Fixed relative imports in `backend/main.py`, `backend/models.py`, and `backend/routers/scan.py` to allow running from the `backend` directory.
    - Rewrote `backend/routers/auth.py` to include missing imports (`datetime`, `fastapi`, `jose`, `passlib`, `sqlalchemy`, `pydantic`) and definitions (`Token`, `UserCreate`, `create_access_token`, `pwd_context`, `router`).

## Mobile
- **Status**: Running with Expo
- **URL**: `exp://192.168.225.120:8081`
- **Web**: `http://localhost:8081`
- **Instructions**: Scan the QR code in the terminal (or use the URL above) with the Expo Go app on your phone.

## How to Run (Future Reference)
### Backend
```bash
cd backend
# Ensure dependencies are installed
python3 -m pip install -r requirements.txt
# Run server
python3 -m uvicorn main:app --reload
```

### Mobile
```bash
cd mobile
# Ensure dependencies are installed
npm install
# Run app
npx expo start
```
