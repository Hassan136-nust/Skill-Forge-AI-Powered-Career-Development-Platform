#!/bin/bash
# ==============================================================================
# SkillForge — Full-Stack Health & Connectivity Verifier
# Tests Express Gateway (Port 3001), Python AI Service (Port 8000), & Vite Frontend
# ==============================================================================

set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}   🪐 SKILLFORGE — AUTOMATED SERVICE HEALTH AUDIT  ${NC}"
echo -e "${CYAN}====================================================${NC}"

# 1. Test Node.js Express Gateway
echo -ne "Testing Express Backend Gateway (http://localhost:3001/health)... "
if curl -s -f http://localhost:3001/health > /dev/null; then
    echo -e "${GREEN}[OK] Online${NC}"
else
    echo -e "${RED}[FAIL] Not reachable on port 3001${NC}"
fi

# 2. Test Python AI Microservice
echo -ne "Testing Python FastAPI Microservice (http://localhost:8000/health)... "
if curl -s -f http://localhost:8000/health > /dev/null; then
    echo -e "${GREEN}[OK] Online${NC}"
else
    echo -e "${YELLOW}[WARN] Python service offline (Express auto-fallback will handle Groq AI)${NC}"
fi

# 3. Test Frontend Dev Server
echo -ne "Testing React + Vite Frontend (http://localhost:5173/)... "
if curl -s -f http://localhost:5173/ > /dev/null; then
    echo -e "${GREEN}[OK] Online${NC}"
else
    echo -e "${YELLOW}[INFO] Frontend dev server not active${NC}"
fi

echo -e "${CYAN}====================================================${NC}"
echo -e "${GREEN}✦ Audit Complete.${NC}"
