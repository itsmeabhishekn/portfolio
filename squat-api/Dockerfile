# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM deps AS builder
WORKDIR /app
COPY prisma ./prisma
RUN npx --no-install prisma generate
COPY . .
RUN npm run build

# Keeps devDependencies so the Prisma CLI pinned in package-lock.json is present
# in the image. Without this stage `npx prisma` downloads the CLI at run time.
FROM deps AS migrator
WORKDIR /app
COPY prisma ./prisma
CMD ["npx", "--no-install", "prisma", "migrate", "deploy"]

# Host has no Node. Import runs in this image with the host .env injected by Compose.
FROM deps AS importer
WORKDIR /app
COPY prisma ./prisma
RUN npx --no-install prisma generate
COPY src/common ./src/common
COPY src/programs/import-program.ts ./src/programs/import-program.ts
COPY src/programs/program-catalog.ts ./src/programs/program-catalog.ts
COPY scripts/import-program.ts ./scripts/import-program.ts
COPY data/programs ./data/programs
ENTRYPOINT ["npx", "--no-install", "tsx", "scripts/import-program.ts"]

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

USER node

EXPOSE 3001

CMD ["node", "dist/main.js"]
