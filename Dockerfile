FROM node:20-alpine

RUN apk add --no-cache curl

# mkdir /app
WORKDIR  /app

COPY package.json .

RUN npm install

COPY server.js .

ENV PORT=5000

EXPOSE 5000

CMD ["node", "server.js"]
