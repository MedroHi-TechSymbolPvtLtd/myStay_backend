FROM node:18-alpine AS base

WORKDIR /usr/src/app

# Copy root package files for workspace install
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* .npmrc* ./ || true

# Install dependencies (workspace-aware)
RUN npm install

# Copy auth-service source
COPY packages/auth-service ./packages/auth-service

WORKDIR /usr/src/app/packages/auth-service

EXPOSE 3001

ENV NODE_ENV=development

CMD ["npm", "run", "dev"]

