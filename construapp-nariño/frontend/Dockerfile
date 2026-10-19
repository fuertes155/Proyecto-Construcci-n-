# Frontend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar manifiestos del monorepo (npm workspaces)
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
COPY mobile/package.json ./mobile/package.json

# Instalar dependencias del workspace frontend
RUN npm ci --workspace=construapp-frontend --include-workspace-root

# Copiar código y generar build de producción
COPY frontend/ ./frontend/
RUN npm run build --workspace=construapp-frontend

# ---- Imagen de runtime ----
FROM node:20-alpine

WORKDIR /app
RUN npm install -g serve@14

COPY --from=builder /app/frontend/dist ./dist

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
