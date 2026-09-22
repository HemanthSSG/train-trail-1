FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY src ./src
COPY railway_prakasam.db ./railway_prakasam.db
COPY sql ./sql
EXPOSE 8080
CMD ["node","src/server.js"]
