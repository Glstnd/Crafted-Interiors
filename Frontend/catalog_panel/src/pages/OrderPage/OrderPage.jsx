import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import orderService from '../../services/OrderService';
import productService from '../../services/ProductService';
import pdfMake from '../../assets/vfs_fonts'; // Импортируем pdfMake с настроенными шрифтами
import './OrderPage.css';

const OrderPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [productsInfo, setProductsInfo] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Загружаем данные заказа и информацию о товарах
    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true);
            setError(null);
            try {
                // Загружаем заказ
                const fetchedOrder = await orderService.getOrderById(orderId);
                setOrder(fetchedOrder);

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

    // Генерация и скачивание PDF-отчёта
    const generateReport = () => {
        if (!order) return;

        const docDefinition = {
            content: [
                { text: `Отчёт по заказу #${order.id}`, style: 'header', alignment: 'center' },
                { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1 }] },
                { text: 'Основная информация', style: 'subheader', margin: [0, 10, 0, 0] },
                { text: `ID: ${order.id}`, margin: [20, 2, 0, 0] },
                { text: `Дата создания: ${formatDate(order.created_at)}`, margin: [20, 2, 0, 0] },
                ...(order.updated_at
                    ? [{ text: `Дата обновления: ${formatDate(order.updated_at)}`, margin: [20, 2, 0, 0] }]
                    : []),
                { text: `Статус: ${translateStatus(order.status)}`, margin: [20, 2, 0, 0] },
                { text: `Итоговая сумма: ${order.total_amount} ₽`, margin: [20, 2, 0, 0] },
                { text: 'Товары', style: 'subheader', margin: [0, 10, 0, 0] },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto', 'auto', 'auto'],
                        body: [
                            ['Наименование товара', 'Количество', 'Цена за единицу', 'Общая стоимость'],
                            ...order.items.map(item => [
                                productsInfo[item.product_id]?.name || `Товар ${item.product_id}`,
                                item.quantity,
                                `${item.unit_price} ₽`,
                                `${(item.quantity * item.unit_price).toFixed(2)} ₽`,
                            ]),
                        ],
                    },
                    margin: [0, 5, 0, 10],
                },
                { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1 }] },
                {
                    text: `Итоговая сумма: ${order.total_amount} ₽`,
                    style: 'total',
                    margin: [0, 10, 0, 0],
                },
            ],
            styles: {
                header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
                subheader: { fontSize: 14, bold: true },
                total: { fontSize: 14, bold: true },
            },
            defaultStyle: {
                font: 'Roboto',
            },
        };

        const currentDate = new Date().toISOString().split('T')[0];
        pdfMake.createPdf(docDefinition).download(`order-report-${order.id}-${currentDate}.pdf`);
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

            <div className="order-actions">
                <button className="report-button" onClick={generateReport}>
                    Скачать отчёт по заказу
                </button>
                <button className="back-button" onClick={handleBack}>
                    Назад к профилю
                </button>
            </div>
        </div>
    );
};

export default OrderPage;