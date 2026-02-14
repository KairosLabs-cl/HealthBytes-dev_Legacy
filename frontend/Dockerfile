# Multi-stage build for React Native (Expo)

# Stage 1: Builder
FROM node:22-alpine as builder

WORKDIR /build

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Prebuild Expo app (optional - for static export if needed)
# Note: Expo apps are primarily run in dev mode via `pnpm start`
RUN pnpm run build 2>/dev/null || echo "Build script not configured, skipping"

# Stage 2: Runtime
FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy node_modules and source from builder
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build .

# Set environment
ENV NODE_ENV=development \
    EXPO_PUBLIC_API_URL=http://backend:3001 \
    PORT=8081

# Expose dev port
EXPOSE 8081

# Start Expo dev server
CMD ["pnpm", "start"]
