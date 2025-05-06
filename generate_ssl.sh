#!/bin/bash

# Конфигурация
DOMAIN="craftedinteriors.store"
EMAIL="31rombo@craftedinteriors.store"
CERT_DIR="/certbot/conf"
WEBROOT="/certbot/www"

# Проверка, что скрипт запущен от root
if [ "$(id -u)" != "0" ]; then
    echo "Этот скрипт должен быть запущен от имени root" 1>&2
    exit 1
fi

# Создание директорий
mkdir -p "$CERT_DIR"
mkdir -p "$WEBROOT"

# Проверка наличия сертификатов
if [ -f "$CERT_DIR/fullchain.pem" ] && [ -f "$CERT_DIR/privkey.pem" ]; then
    echo "Сертификаты уже существуют в $CERT_DIR, пропускаем генерацию."
    exit 0
fi

# Установка Certbot, если не установлен
if ! command -v certbot &> /dev/null; then
    echo "Certbot не установлен, устанавливаем..."
    apt-get update
    apt-get install -y certbot
fi

# Создание временной конфигурации Nginx
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
    -v "$WEBROOT:/var/www/certbot:ro" \
    -v "$TEMP_NGINX_CONF:/etc/nginx/nginx.conf:ro" \
    -p 80:80 \
    nginx:latest

# Генерация сертификатов
echo "Генерируем SSL-сертификаты для $DOMAIN..."
certbot certonly --webroot \
    -w "$WEBROOT" \
    --cert-path "$CERT_DIR" \
    --key-path "$CERT_DIR" \
    --fullchain-path "$CERT_DIR" \
    --email "$EMAIL" \
    -d "$DOMAIN" -d "www.$DOMAIN" -d "admin.$DOMAIN" \
    --agree-tos --non-interactive

# Проверка результата
if [ -f "$CERT_DIR/fullchain.pem" ] && [ -f "$CERT_DIR/privkey.pem" ]; then
    chmod -R 755 "$CERT_DIR"
    echo "Сертификаты успешно сгенерированы в $CERT_DIR"
else
    echo "Ошибка: сертификаты не были сгенерированы."
    docker rm -f temp-nginx-certbot
    rm -f "$TEMP_NGINX_CONF"
    exit 1
fi

# Остановка и удаление временного контейнера
docker rm -f temp-nginx-certbot
rm -f "$TEMP_NGINX_CONF"

exit 0