# ==========================================
# 🪔 Diwali Shop Manager - Frontend Dockerfile
# Multi-stage build for React 18 + Vite + Nginx
# ==========================================

# Stage 1: Build Vite React SPA
FROM node:20-alpine AS builder
WORKDIR /app

# Cache package dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .

# Pass optional backend URL during build time
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Production Nginx Server
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
