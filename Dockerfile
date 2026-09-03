# ==============================================================================
# SkillForge — MERN Stack Backend API Service Dockerfile
# ==============================================================================
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Set node environment
ENV NODE_ENV=production

# Install production dependencies first (optimized layer caching)
COPY package*.json ./
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Expose backend API port
EXPOSE 3001

# Healthcheck for container orchestrators
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3001/api/health || exit 1

# Start the Express server
CMD ["node", "server/server.js"]
