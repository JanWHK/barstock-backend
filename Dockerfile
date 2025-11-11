FROM node:20-alpine

WORKDIR /app

# 1) Package manifests
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# 2) Prisma schema must be present BEFORE install (postinstall runs prisma generate)
COPY prisma ./prisma

# 3) Install deps (falls back if no lockfile)
RUN npm ci || npm i

# 4) (Optional) Explicit generate — harmless if postinstall already ran
RUN npx prisma generate

# 5) App code & tools
COPY src ./src
COPY tools ./tools

ENV PORT=8080
EXPOSE 8080

CMD [ "sh", "-lc", "npm run migrate && npm run start" ]
