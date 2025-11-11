# Use Debian-based image to avoid Prisma + OpenSSL issues on Alpine
FROM node:20-bullseye-slim

# Optional: keep image small & up-to-date
RUN apt-get update -y && apt-get install -y --no-install-recommends ca-certificates openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1) Package manifests first
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# 2) Prisma schema BEFORE install (postinstall runs prisma generate)
COPY prisma ./prisma

# 3) Install deps (falls back if no lockfile)
RUN npm ci || npm i

# 4) Explicit generate (harmless if postinstall already ran)
RUN npx prisma generate

# 5) App code & tools
COPY src ./src
COPY tools ./tools

ENV PORT=8080
EXPOSE 8080

CMD [ "npm", "run", "start" ]


