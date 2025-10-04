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

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the frontend source code
COPY . .

# Build the Next.js app
RUN npm run build

# -----------------------------
# Stage 2: Run the Next.js app
# -----------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built app and only what’s needed to run
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 3000

CMD ["npm", "start"]