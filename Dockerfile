FROM node:22-alpine

WORKDIR /app

COPY build build/
COPY package*.json .
COPY node_modules node_modules/
COPY drizzle drizzle/

EXPOSE 3000

ENV NODE_ENV=production

CMD [ "node", "build" ]
