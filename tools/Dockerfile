FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm ci || npm i
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src
COPY tools ./tools
ENV PORT=8080
EXPOSE 8080
CMD [ "sh", "-lc", "npm run migrate && npm run start" ]
