import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import orderService from '../../services/OrderService';
import pdfMake from '../../assets/vfs_fonts'; // Импортируем pdfMake с настроенными шрифтами
import './OrderPage.css';

const OrderPage = () => {
    const { orderId } = useParams(); // Получаем order_id из URL
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [userInfo, setUserInfo] = useState(null); // Состояние для данных пользователя
    const [productsInfo, setProductsInfo] = useState({}); // Состояние для данных о товарах
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderAndRelatedData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Загружаем данные заказа
                const fetchedOrder = await orderService.getOrderById(orderId);
                setOrder(fetchedOrder);

                // Загружаем данные пользователя по public_id
                const fetchedUserInfo = await orderService.getUserInfo(fetchedOrder.user_id);
                setUserInfo(fetchedUserInfo);

                // Загружаем данные о товарах
                const productRequests = fetchedOrder.items.map(async (item) => {
                    try {
                        const productInfo = await orderService.getProductInfo(item.product_id);
                        return { product_id: item.product_id, ...productInfo };
                    } catch (err) {
                        console.error(`Ошибка загрузки товара ${item.product_id}:`, err);
                        return { product_id: item.product_id, name: `Товар ${item.product_id}` }; // Запасное название
                    }
                });

                const products = await Promise.all(productRequests);
                const productsMap = products.reduce((acc, product) => {
                    acc[product.product_id] = product;
                    return acc;
                }, {});
                setProductsInfo(productsMap);
            } catch (err) {
                setError(err.message || 'Не удалось загрузить данные');
            } finally {
                setLoading(false);
            }
        };
        fetchOrderAndRelatedData();
    }, [orderId]);

    const translateStatus = (status) => {
        const statusMap = {
            pending: 'Рассматривается',
            processing: 'Изготавливается',
            shipped: 'В доставке',
            completed: 'Завершён',
        };
        return statusMap[status] || status;
    };

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

    const handleEdit = () => {
        navigate(`/orders/${orderId}/edit`);
    };

    // Генерация и скачивание PDF-отчёта с pdfMake
    const generateReport = () => {
        if (!order) return;

        const docDefinition = {
            content: [
                { text: `Отчёт по заказу #${order.id}`, style: 'header', alignment: 'center' },
                { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1 }] },
                { text: 'Основная информация', style: 'subheader', margin: [0, 10, 0, 0] },
                { text: `ID: ${order.id}`, margin: [20, 2, 0, 0] },
                { text: `Дата создания: ${formatDate(order.created_at)}`, margin: [20, 2, 0, 0] },
                { text: `Статус: ${translateStatus(order.status)}`, margin: [20, 2, 0, 0] },
                { text: `Итоговая сумма: ${order.total_amount} ₽`, margin: [20, 2, 0, 0] },
                { text: `Пользователь (ID): ${order.user_id}`, margin: [20, 2, 0, 0] },
                ...(userInfo
                    ? [
                        { text: 'Данные пользователя', style: 'subheader', margin: [0, 10, 0, 0] },
                        { text: `Имя: ${userInfo.fname}`, margin: [20, 2, 0, 0] },
                        { text: `Фамилия: ${userInfo.lname}`, margin: [20, 2, 0, 0] },
                        { text: `Телефон: ${userInfo.phone}`, margin: [20, 2, 0, 10] },
                    ]
                    : []),
                { text: 'Товары', style: 'subheader', margin: [0, 10, 0, 0] },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto', 'auto', 'auto'],
                        body: [
                            ['Название товара', 'Количество', 'Цена за единицу', 'Общая стоимость'], // Заменяем "ID товара" на "Название товара"
                            ...order.items.map(item => [
                                productsInfo[item.product_id]?.name || `Товар ${item.product_id}`, // Отображаем название товара
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
                font: 'Roboto', // Указываем шрифт
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
        return <div className="order-empty">Заказ не найден</div>;
    }

    return (
        <div className="order-page">
            <h1>Заказ #{order.id}</h1>

            <div className="order-actions">
                <button className="edit-button" onClick={handleEdit}>
                    Редактировать заказ
                </button>
                <button className="report-button" onClick={generateReport}>
                    Сформировать отчёт
                </button>
            </div>

            <div className="order-details">
                <h2>Основная информация</h2>
                <div className="order-field">
                    <span className="order-label">ID:</span>
                    <span className="order-value">{order.id}</span>
                </div>
                <div className="order-field">
                    <span className="order-label">Дата создания:</span>
                    <span className="order-value">{formatDate(order.created_at)}</span>
                </div>
                <div className="order-field">
                    <span className="order-label">Статус:</span>
                    <span className={`order-value status-${order.status}`}>
                        {translateStatus(order.status)}
                    </span>
                </div>
                <div className="order-field">
                    <span className="order-label">Итоговая сумма:</span>
                    <span className="order-value">{order.total_amount} ₽</span>
                </div>
                <div className="order-field">
                    <span className="order-label">Пользователь (ID):</span>
                    <span className="order-value">{order.user_id}</span>
                </div>
            </div>

            <div className="user-details">
                <h2>Данные пользователя</h2>
                {userInfo ? (
                    <>
                        <div className="user-field">
                            <span className="user-label">Имя:</span>
                            <span className="user-value">{userInfo.fname}</span>
                        </div>
                        <div className="user-field">
                            <span className="user-label">Фамилия:</span>
                            <span className="user-value">{userInfo.lname}</span>
                        </div>
                        <div className="user-field">
                            <span className="user-label">Телефон:</span>
                            <span className="user-value">{userInfo.phone}</span>
                        </div>
                    </>
                ) : (
                    <p className="user-empty">Данные пользователя отсутствуют</p>
                )}
            </div>

            <div className="order-items">
                <h2>Товары</h2>
                {order.items.length === 0 ? (
                    <p className="items-empty">Товары отсутствуют</p>
                ) : (
                    <div className="items-list">
                        {order.items.map((item, index) => (
                            <div key={index} className="item-card">
                                <div className="item-field">
                                    <span className="item-label">Название товара:</span> {/* Заменяем "ID товара" на "Название товара" */}
                                    <span className="item-value">
                                        {productsInfo[item.product_id]?.name || `Товар ${item.product_id}`} {/* Отображаем название товара */}
                                    </span>
                                </div>
                                <div className="item-field">
                                    <span className="item-label">Количество:</span>
                                    <span className="item-value">{item.quantity}</span>
                                </div>
                                <div className="item-field">
                                    <span className="item-label">Цена за единицу:</span>
                                    <span className="item-value">{item.unit_price} ₽</span>
                                </div>
                                <div className="item-field">
                                    <span className="item-label">Общая стоимость:</span>
                                    <span className="item-value">{(item.quantity * item.unit_price).toFixed(2)} ₽</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderPage;