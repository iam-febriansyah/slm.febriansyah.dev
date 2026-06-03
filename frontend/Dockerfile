# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Tambahkan libc6-compat yang dibutuhkan oleh native binding Tailwind (Oxide) di Alpine Linux
RUN apk add --no-cache libc6-compat

COPY package*.json ./
# Gunakan npm install alih-alih npm ci untuk memaksa unduhan optional dependencies sesuai OS/Arsitektur saat ini
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache libc6-compat

COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY package*.json ./

# Expose port
EXPOSE 3003

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s \
  CMD wget --quiet --tries=1 --spider http://localhost:3003 || exit 1

# Start application
CMD ["npm", "start"]