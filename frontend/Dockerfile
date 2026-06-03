# Build stage
FROM node:20-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN rm -f package-lock.json
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Production stage
FROM node:20-slim AS production
WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN rm -f package-lock.json
RUN npm install --omit=dev --legacy-peer-deps && \
  npm cache clean --force

COPY --from=builder /app/.next ./.next

EXPOSE 3003

HEALTHCHECK --interval=30s --timeout=3s --start-period=30s \
  CMD wget --quiet --tries=1 --spider http://localhost:3003 || exit 1

CMD ["npm", "start"]