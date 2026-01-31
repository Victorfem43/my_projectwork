# API-only deployment for Railway (repo root = /app, no frontend build)
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY backend ./backend
COPY server-api-only.js ./

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "server-api-only.js"]
