FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN apk add --no-cache python3 make g++ 

RUN npm install

COPY . .

EXPOSE 8080

CMD ["node", "server.js"]