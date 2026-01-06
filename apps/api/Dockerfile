# ---- build ----
FROM node:20-bookworm-slim AS build
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN corepack enable
ENV CI=true

COPY . .
#RUN pnpm install --frozen-lockfile
RUN pnpm install --frozen-lockfile --config.node-linker=hoisted

WORKDIR /app/apps/api
RUN pnpm exec prisma generate
RUN pnpm build

# ---- runtime ----
FROM node:20-bookworm-slim AS runtime
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/apps/api/prisma.config.ts /app/apps/api/prisma.config.ts
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/api/dist /app/apps/api/dist
COPY --from=build /app/apps/api/prisma /app/apps/api/prisma
COPY --from=build /app/apps/api/package.json /app/apps/api/package.json

EXPOSE 3000
CMD ["node", "apps/api/dist/src/main.js"]