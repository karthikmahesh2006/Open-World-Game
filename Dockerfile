# ============================================================================
# Stage 1: Build the React + Vite + Three.js Frontend
# ============================================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --no-audit --no-fund

COPY frontend/ ./
RUN npm run build

# ============================================================================
# Stage 2: Lightweight Production Node.js + Express + Multiplayer Server
# ============================================================================
FROM node:20-alpine AS production-server

ENV NODE_ENV=production
WORKDIR /app

COPY package.json ./
COPY backend/package*.json ./backend/
RUN npm --prefix backend install --omit=dev --no-audit --no-fund

COPY backend/ ./backend/
COPY database/ ./database/
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 5000

CMD ["node", "backend/src/server.js"]
