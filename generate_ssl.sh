#!/bin/bash

# Скрипт для генерации или копирования SSL-сертификатов для craftedinteriors.store
# Используется в deploy.sh для подготовки сертификатов перед запуском docker-compose

# Конфигурация
DOMAIN="craftedinteriors.store"
EMAIL="31rombo@craftedinteriors.store"
CERT_DIR="./certbot/conf"
WEBROOT="./certbot/www"
LETSENCRYPT_DIR="/etc/letsencrypt/live/$DOMAIN"

# Проверка, что скрипт запущен от root
if [ "$(id -u)" != "0" ]; then
    echo "Этот скрипт должен быть запущен от имени root" 1>&2
    exit 1
fi

# Создание директорий
mkdir -p "$CERT_DIR"
mkdir -p "$WEBROOT"

# Проверка наличия сертификатов в целевой директории
if [ -f "$CERT_DIR/fullchain.pem" ] && [ -f "$CERT_DIR/privkey.pem" ]; then
    echo "Сертификаты уже существуют в $CERT_DIR, пропускаем генерацию."
    exit 0
fi

# Проверка наличия сертификатов в /etc/letsencrypt
if [ -f "$LETSENCRYPT_DIR/fullchain.pem" ] && [ -f "$LETSENCRYPT_DIR/privkey.pem" ]; then
    echo "Сертификаты найдены в $LETSENCRYPT_DIR, копируем в $CERT_DIR..."
    cp "$LETSENCRYPT_DIR/fullchain.pem" "$CERT_DIR/fullchain.pem"
    cp "$LETSENCRYPT_DIR/privkey.pem" "$CERT_DIR/privkey.pem"
    chmod -R 755 "$CERT_DIR"
    echo "Сертификаты успешно скопированы в $CERT_DIR"
    exit 0
fi

# Установка Certbot, если не установлен
if ! command -v certbot &> /dev/null; then
    echo "Certbot не установлен, устанавливаем..."
    apt-get update
    apt-get install -y certbot
fi

# Создание временной конфигурации Nginx для проверки Certbot
TEMP_NGINX_CONF="/tmp/nginx-certbot.conf"
cat > "$TEMP_NGINX_CONF" << EOL
worker_processes 1;
events {
    worker_connections 1024;
}
http {
    server {
        listen 80;
        server_name $DOMAIN www.$DOMAIN admin.$DOMAIN;
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        location / {
            return 404;
        }
    }
}
EOL

# Запуск временного Nginx-контейнера
echo "Запускаем временный Nginx для проверки Certbot..."
docker run -d --name temp-nginx-certbot \
    -v "$(pwd)/$WEBROOT:/var/www/certbot:ro" \
    -v "$TEMP_NGINX_CONF:/etc/nginx/nginx.conf:ro" \
    -p 80:80 \
    nginx:latest

# Генерация сертификатов
echo "Генерируем SSL-сертификаты для $DOMAIN..."
certbot certonly --webroot \
    -w "$WEBROOT" \
    -d "$DOMAIN" -d "www.$DOMAIN" -d "admin.$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos --non-interactive

# Проверка результата
if [ -f "$LETSENCRYPT_DIR/fullchain.pem" ] && [ -f "$LETSENCRYPT_DIR/privkey.pem" ]; then
    echo "Сертификаты сгенерированы в $LETSENCRYPT_DIR, копируем в $CERT_DIR..."
    cp "$LETSENCRYPT_DIR/fullchain.pem" "$CERT_DIR/fullchain.pem"
    cp "$LETSENCRYPT_DIR/privkey.pem" "$CERT_DIR/privkey.pem"
    chmod -R 755 "$CERT_DIR"
    echo "Сертификаты успешно скопированы в $CERT_DIR"
else
    echo "Критическая ошибка: сертификаты не были сгенерированы."
    docker rm -f temp-nginx-certbot
    rm -f "$TEMP_NGINX_CONF"
    exit 1
fi

# Остановка и удаление временного контейнера
docker rm -f temp-nginx-certbot
rm -f "$TEMP_NGINX_CONF"

exit 0