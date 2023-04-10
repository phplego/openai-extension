#!/bin/bash

# Создание каталога для проекта прокси-сервера
mkdir simple-cors-proxy
cd simple-cors-proxy

# Создание package.json и установка зависимостей
echo '{
  "name": "simple-cors-proxy",
  "version": "1.0.0",
  "description": "Simple CORS proxy server",
  "main": "app.js",
  "scripts": {
    "start": "node app.js"
  },
  "dependencies": {
    "express": "^4.17.1",
    "http-proxy-middleware": "^2.0.1"
  }
}' > package.json
npm install

# Создание app.js
echo "const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  next();
});

app.use('/', createProxyMiddleware({
  target: 'https://api.openai.com',
  changeOrigin: true,
  pathRewrite: {
    '^/': '/',
  },
}));

app.listen(port, () => {
  console.log(\`CORS proxy server listening at http://localhost:\${port}\`);
});" > app.js

# Создание Dockerfile
echo "FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD [ \"node\", \"app.js\" ]" > Dockerfile

# Сборка Docker-образа и запуск контейнера
docker build -t simple-cors-proxy .
docker run -d -p 3000:3000 simple-cors-proxy
