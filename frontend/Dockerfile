# -----------------------------
# Stage 1: Build the Next.js app
# -----------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Build-time envs (baked into bundle)
ENV NODE_ENV=production \
    NEXT_PUBLIC_API_BASE_URL=https://backend.courtlyeasy.app \
    NEXT_DISABLE_ESLINT_PLUGIN=true \
    NEXT_SKIP_TYPECHECK=true

# Install dependencies (copy only package.json + lock file first for caching)
COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.ts ./
COPY eslint.config.mjs ./
COPY postcss.config.mjs ./
COPY tailwind.config.js ./

RUN npm ci

# Copy the rest of the frontend source code
COPY . .

# Build the Next.js app
# Disable ESLint + TypeScript strictness during build
ENV NEXT_DISABLE_ESLINT_PLUGIN=true
ENV NEXT_SKIP_TYPECHECK=true
RUN npm run build

# -----------------------------
# Stage 2: Run the Next.js app
# -----------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
# Ensure Next.js runs in production mode
ENV NEXT_TELEMETRY_DISABLED=1

# Copy only the built app and production deps
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Expose Next.js default port
EXPOSE 3000

# Start Next.js
CMD ["npm", "start"]