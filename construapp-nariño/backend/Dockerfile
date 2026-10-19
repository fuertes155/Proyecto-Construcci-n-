# Backend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar manifiestos del monorepo (npm workspaces)
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
COPY mobile/package.json ./mobile/package.json

# Instalar dependencias del workspace backend
RUN npm ci --workspace=construapp-backend --include-workspace-root

# Copiar código y compilar TypeScript
COPY backend/ ./backend/
RUN npm run build --workspace=construapp-backend

# ---- Imagen de runtime ----
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
COPY mobile/package.json ./mobile/package.json

RUN npm ci --omit=dev --workspace=construapp-backend --include-workspace-root

COPY --from=builder /app/backend/dist ./backend/dist

WORKDIR /app/backend
EXPOSE 5000
CMD ["node", "dist/index.js"]
