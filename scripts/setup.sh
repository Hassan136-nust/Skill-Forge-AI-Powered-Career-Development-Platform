#!/bin/bash
# ==============================================================================
# SkillForge — One-Command Full Stack Launcher (PRD Section 10.4)
# Starts React Frontend (Port 5173), Express API (Port 3001) & Python AI (Port 8000)
# ==============================================================================

set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}   🪐 SKILLFORGE — AI CAREER PLATFORM LAUNCHER     ${NC}"
echo -e "${CYAN}====================================================${NC}"

# Check .env file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}[!] .env file not found. Copying from .env.example...${NC}"
    cp .env.example .env
fi

# Ensure Python dependencies installed
echo -e "${MAGENTA}[1/3] Checking Python AI Microservice dependencies...${NC}"
python3 -m pip install -q fastapi uvicorn pydantic groq requests --break-system-packages 2>/dev/null || true

# Ensure Node dependencies installed
echo -e "${GREEN}[2/3] Checking Node.js dependencies...${NC}"
npm install --silent

echo -e "${CYAN}[3/3] Launching Full-Stack Services with Concurrently...${NC}"
echo -e "  ✦ Frontend:        ${GREEN}http://localhost:5173/${NC}"
echo -e "  ✦ Express Backend: ${GREEN}http://localhost:3001/${NC}"
echo -e "  ✦ Python FastAPI:  ${GREEN}http://localhost:8000/health${NC}"
echo -e "${CYAN}====================================================${NC}"

# Run everything in 1 command
npm run start:all
