# ============================================================
# Dockerfile - Video Repository Service (Next.js + SQLite)
# ============================================================
# Build:   docker build -t video-repository .
# Run:     docker run -p 3002:3000 -v video-data:/app/data video-repository
# ============================================================

FROM node:20-alpine AS base

# better-sqlite3 needs build tools
RUN apk add --no-cache python3 make g++

# --- Build ---
FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .

# JWT secret must be available at build time for Edge middleware
ARG JWT_SECRET=video-repo-default-secret-change-me
ENV JWT_SECRET=${JWT_SECRET}
RUN npm run build

# --- Production ---
FROM node:20-alpine AS runner
WORKDIR /app

# better-sqlite3 runtime dependency
RUN apk add --no-cache libstdc++

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ARG JWT_SECRET=video-repo-default-secret-change-me
ENV JWT_SECRET=${JWT_SECRET}

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone build + public assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Create data directory for videos and database
RUN mkdir -p /app/data/videos && chown -R nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
