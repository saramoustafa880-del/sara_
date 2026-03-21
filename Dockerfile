# ============================================================
# Sara Go — Multi-Stage Docker Build (Backend)
# NestJS Production Image
# ============================================================

# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production=false

# Generate Prisma client
RUN npx prisma generate

# Copy source and build
COPY . .
RUN npm run build

# ─────────────────────────────────────────────────────────────

# Stage 2: Production Runner
FROM node:20-alpine AS runner

# Security: run as non-root user
RUN addgroup --system --gid 1001 sara-go && \
    adduser --system --uid 1001 --ingroup sara-go sara-user

WORKDIR /app

# Install production deps only
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma/
RUN npm ci --only=production && npm cache clean --force

# Copy built artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create logs directory
RUN mkdir -p logs && chown sara-user:sara-go logs

# Switch to non-root user
USER sara-user

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3001/api/v1/health || exit 1

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
