# Étape 1: Construction de l'application
FROM node:14 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --production
RUN npm install typescript --save-dev

COPY . .

RUN npm run build

# Étape 2: Exécution de l'application
FROM node:14

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./

CMD ["node", "dist/server.js"]
