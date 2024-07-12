ARG NODE_VERSION=node:21.6.2

FROM $NODE_VERSION AS dependency-base

RUN mkdir -p /app

WORKDIR /app

COPY package.json .

COPY package-lock.json .

FROM dependency-base AS production-base

RUN npm ci

COPY . .

RUN npm run build \
  && npm prune --production

FROM production-base as production

# Copy production build
COPY --from=production-base /app/dist/ ./dist/

EXPOSE 3000