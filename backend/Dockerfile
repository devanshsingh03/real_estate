FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

RUN mkdir -p /data

ENV NODE_ENV=production
ENV DB_PATH=/data/real_estate.db
ENV UPLOADS_DIR=/data/uploads

EXPOSE 4000

CMD ["sh", "-c", "node --no-warnings src/db/seed.js || true; node --no-warnings src/server.js"]
