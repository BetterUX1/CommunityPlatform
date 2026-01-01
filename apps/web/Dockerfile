# ---- build ----
FROM node:20-bookworm-slim AS build
WORKDIR /app
RUN corepack enable

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# workspace files (ligger i repo-root)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# web app files (ligger under apps/web)
COPY apps/web/package.json apps/web/
COPY apps/web/index.html apps/web/
COPY apps/web/vite.config.* apps/web/
COPY apps/web/tsconfig*.json apps/web/
COPY apps/web/src apps/web/src
COPY apps/web/public apps/web/public

# install deps (workspace) + build bara web
RUN pnpm install --frozen-lockfile
RUN pnpm --filter ./apps/web... build

# ---- runtime ----
FROM nginx:alpine
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80