# 1) Build
FROM node:20-bullseye-slim as build
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm i
COPY . .
# Vite reads this at build time
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# 2) Serve with Nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/ /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"]


