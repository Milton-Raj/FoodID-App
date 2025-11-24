#!/usr/bin/env bash
# ------------------------------------------------------------
# install_python.sh – ensure Python is installed (via Homebrew)
# ------------------------------------------------------------

set -euo pipefail

log() {
  echo -e "\033[1;34m[install_python]\033[0m $*"
}

# Check for existing python3
if command -v python3 >/dev/null 2>&1; then
  PYTHON_BIN=$(command -v python3)
  log "✅ Python already installed at: $PYTHON_BIN"
else
  log "⚠️  python3 not found – attempting Homebrew install"

  # Verify Homebrew is present
  if ! command -v brew >/dev/null 2>&1; then
    log "❌ Homebrew (brew) is not installed. Please install it first:"
    log "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    exit 1
  fi

  # Install Python via Homebrew
  log "🔧 Installing Python with Homebrew..."
  brew update
  brew install python   # installs the latest stable python3

  # Verify installation succeeded
  if ! command -v python3 >/dev/null 2>&1; then
    echo "❌ Homebrew reported success but python3 is still missing."
    exit 1
  fi
  PYTHON_BIN=$(command -v python3)
  log "✅ Python installed at: $PYTHON_BIN"
fi

# (Optional) create a virtual environment
VENV_DIR="venv"
if [ ! -d "$VENV_DIR" ]; then
  log "🛠️  Creating virtual environment in ./$VENV_DIR"
  "$PYTHON_BIN" -m venv "$VENV_DIR"
else
  log "ℹ️  Virtual environment already exists at ./$VENV_DIR"
fi

# Activate venv and install backend deps
log "📦 Installing backend requirements"
# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"
pip install --upgrade pip
pip install -r backend/requirements.txt

log "✅ All set! Activate the venv with: source $VENV_DIR/bin/activate"
log "🚀 Then start the FastAPI server:"
log "   uvicorn backend.main:app --host 0.0.0.0 --port 8000"
