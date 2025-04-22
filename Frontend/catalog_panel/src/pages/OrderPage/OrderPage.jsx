import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import orderService from '../../services/OrderService';
import productService from '../../services/ProductService';
import './OrderPage.css';

const OrderPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [productsInfo, setProductsInfo] = useState({});

    // Загружаем данные заказа и информацию о товарах
    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true);
            setError(null);
            try {
                // Загружаем заказ
                const fetchedOrder = await orderService.getOrderById(orderId);

                // Загружаем информацию о товарах
                const productRequests = fetchedOrder.items.map(async (item) => {
                    try {
                        const productInfo = await productService.getProductInfo(item.product_id);
                        return { product_id: item.product_id, ...productInfo };
                    } catch (err) {
                        console.error(`Ошибка загрузки товара ${item.product_id}:`, err);
                        return {
                            product_id: item.product_id,
                            name: `Товар ${item.product_id}`,
                            price: 0,
                            tag: 'Неизвестно',
                        };
                    }
                });

                const products = await Promise.all(productRequests);
                const productsMap = products.reduce((acc, product) => {
                    acc[product.product_id] = product;
                    return acc;
                }, {});
                setProductsInfo(productsMap);
                setOrder(fetchedOrder);
            } catch (err) {
                setError(err.message || 'Не удалось загрузить заказ');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    // Перевод статусов
    const translateStatus = (status) => {
        const statusMap = {
            pending: 'Рассматривается',
            processing: 'Изготавливается',
            shipped: 'В доставке',
            completed: 'Завершён',
        };
        return statusMap[status] || status;
    };

    // Форматирование даты
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Обработчик возврата на страницу профиля
    const handleBack = () => {
        navigate('/profile');
    };

    if (loading) {
        return <div className="order-loading">Загрузка...</div>;
    }

    if (error) {
        return <div className="order-error">{error}</div>;
    }

    if (!order) {
        return <div className="order-not-found">Заказ не найден</div>;
    }

    return (
        <div className="order-container">
            <h2>Заказ #{order.id}</h2>
            <div className="order-details">
                <div className="order-field">
                    <span className="order-label">Дата создания:</span>
                    <span className="order-value">{formatDate(order.created_at)}</span>
                </div>
                {order.updated_at && (
                    <div className="order-field">
                        <span className="order-label">Дата обновления:</span>
                        <span className="order-value">{formatDate(order.updated_at)}</span>
                    </div>
                )}
                <div className="order-field">
                    <span className="order-label">Статус:</span>
                    <span className="order-value">{translateStatus(order.status)}</span>
                </div>
                <div className="order-field">
                    <span className="order-label">Итоговая сумма:</span>
                    <span className="order-value">{order.total_amount} ₽</span>
                </div>
                <div className="order-field">
                    <span className="order-label">Публичный ID пользователя:</span>
                    <span className="order-value">{order.public_id}</span>
                </div>
            </div>

            <div className="order-items-section">
                <h3>Товары в заказе</h3>
                {order.items.length === 0 ? (
                    <div className="order-items-empty">Товары отсутствуют</div>
                ) : (
                    order.items.map((item, index) => (
                        <div key={item.id || index} className="order-item-card">
                            <div className="order-item-field">
                                <span className="order-item-label">Наименование:</span>
                                <span className="order-item-value">
                                    {productsInfo[item.product_id]?.name || `Товар ${item.product_id}`}
                                </span>
                            </div>
                            <div className="order-item-field">
                                <span className="order-item-label">Количество:</span>
                                <span className="order-item-value">{item.quantity}</span>
                            </div>
                            <div className="order-item-field">
                                <span className="order-item-label">Цена за единицу:</span>
                                <span className="order-item-value">{item.unit_price} ₽</span>
                            </div>
                            <div className="order-item-field">
                                <span className="order-item-label">Общая стоимость:</span>
                                <span className="order-item-value">{(item.quantity * item.unit_price).toFixed(2)} ₽</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <button className="back-button" onClick={handleBack}>
                Назад к профилю
            </button>
        </div>
    );
};

export default OrderPage;