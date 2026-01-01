# ---- build ----
FROM node:20-bookworm-slim AS build

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN corepack enable

# workspace root
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# api sources
COPY apps/api/package.json apps/api/
COPY apps/api/tsconfig*.json apps/api/
COPY apps/api/src apps/api/src
COPY apps/api/prisma apps/api/prisma
COPY apps/api/prisma.config.ts apps/api/

RUN pnpm install --frozen-lockfile

# Prisma types/client + build (viktigt att generate körs före build i Prisma 7)
WORKDIR /app/apps/api
RUN pnpm prisma generate
RUN pnpm build


# ---- runtime ----
FROM node:20-bookworm-slim AS runtime

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable

# workspace root
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# api runtime files
COPY apps/api/package.json apps/api/
COPY apps/api/prisma apps/api/prisma
COPY apps/api/prisma.config.ts apps/api/

# Install deps in runtime (inkl prisma CLI för generate). Stabilast med pnpm + prisma7.
RUN pnpm install --frozen-lockfile --filter ./apps/api...

# Generate prisma client in runtime (så default.js hittar .prisma korrekt)
WORKDIR /app/apps/api
RUN pnpm prisma generate

# copy built JS
WORKDIR /app
COPY --from=build /app/apps/api/dist apps/api/dist

EXPOSE 3000
CMD ["node", "apps/api/dist/src/main.js"]