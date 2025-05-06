# Используем официальный образ Node.js
FROM node:20-alpine

ARG VITE_ADMIN_API_URL
ARG VITE_CATALOG_API_URL
ARG VITE_MINIO_URL

ENV VITE_ADMIN_API_URL=$VITE_ADMIN_API_URL
ENV VITE_CATALOG_API_URL=$VITE_CATALOG_API_URL
ENV VITE_MINIO_URL=$VITE_MINIO_URL

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json (или yarn.lock)
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь проект
COPY . .

RUN npm run build

RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "5173"]