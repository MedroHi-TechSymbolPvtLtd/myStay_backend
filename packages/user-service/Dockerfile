FROM node:18-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* .npmrc* ./ || true
RUN npm install

COPY packages/user-service ./packages/user-service

WORKDIR /usr/src/app/packages/user-service

EXPOSE 3002

ENV NODE_ENV=development

CMD ["npm", "run", "dev"]

