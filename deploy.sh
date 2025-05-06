# Конфигурация
DOMAIN="craftedinteriors.store"

# Проверка, что скрипт запущен от root
if [ "$(id -u)" != "0" ]; then
    echo "Этот скрипт должен быть запущен от имени root" 1>&2
    exit 1
fi

apt-get update

# Создание директории для Certbot (для .well-known)
mkdir -p certbot/www

# Генерация SSL-сертификатов
echo "Проверка и генерация SSL-сертификатов..."
if [ ! -f "./generate_ssl.sh" ]; then
    echo "Ошибка: скрипт generate_ssl.sh не найден в текущей директории."
    exit 1
fi
bash ./generate_ssl.sh
if [ $? -ne 0 ]; then
    echo "Ошибка при генерации SSL-сертификатов."
    exit 1
fi

# Сборка и запуск контейнеров
echo "Сборка и запуск контейнеров..."
docker compose -f docker-compose.prod.yml up -d --build

echo "Деплой успешно завершен!"