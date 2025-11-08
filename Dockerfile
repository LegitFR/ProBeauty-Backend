# Multi-stage Dockerfile for ProBeauty Backend
# Stage 1: Build dependencies and generate Prisma client
FROM oven/bun:1.1.40-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies (including dev dependencies for build stage)
RUN bun install --frozen-lockfile

# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN bunx prisma generate

# Copy source code
COPY . .

# Build TypeScript (if needed for production)
RUN bun run build

# Stage 2: Production runtime
FROM oven/bun:1.1.40-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY package.json bun.lockb ./

# Install production dependencies only (skip prepare script that requires husky)
RUN bun install --frozen-lockfile --production --ignore-scripts

# Copy built artifacts and prisma files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Copy source files (needed for tsx runtime)
COPY --from=builder /app/src ./src

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD bun run -e "fetch('http://localhost:5000/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["bun", "run", "start"]

# Stage 3: Development runtime (includes dev dependencies)
FROM oven/bun:1.1.40-alpine AS development

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files
COPY package.json bun.lockb ./

# Install ALL dependencies (including dev dependencies)
RUN bun install --frozen-lockfile

# Copy prisma files
COPY prisma ./prisma

# Generate Prisma Client
RUN bunx prisma generate

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application in dev mode using Bun's native watch mode
CMD ["bun", "--watch", "src/index.ts"]
