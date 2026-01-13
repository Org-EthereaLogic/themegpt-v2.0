FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Prune workspace (optional but good practice, skipping for simplicity in small monorepo)
# We will manually copy only what we need.

FROM base AS builder
WORKDIR /app
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

# Copy root workspace configs
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy patches directory (required for pnpm install)
COPY patches ./patches

# Copy packages
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build shared package first
WORKDIR /app/packages/shared
RUN pnpm build

# Build web app
WORKDIR /app/apps/web
# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build-time environment variables (NEXT_PUBLIC_ vars are baked into the bundle)
ARG NEXT_PUBLIC_APP_URL=https://themegpt.app
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG STRIPE_SUBSCRIPTION_PRICE_ID
ARG STRIPE_LIFETIME_PRICE_ID
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV STRIPE_SUBSCRIPTION_PRICE_ID=$STRIPE_SUBSCRIPTION_PRICE_ID
ENV STRIPE_LIFETIME_PRICE_ID=$STRIPE_LIFETIME_PRICE_ID

RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/apps/web/public ./apps/web/public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

# Next.js standalone output moves everything to the root, 
# so the entrypoint corresponds to the path in standalone output.
# Usually it's apps/web/server.js if we built from root context? 
# Actually standalone output structure mimics the repo structure.
CMD ["node", "apps/web/server.js"]
