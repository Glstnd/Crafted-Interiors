import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../../services/OrderService';
import './OrdersPage.css';

const OrdersPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            setError(null);
            try {
                const fetchedOrders = await orderService.getOrders();
                setOrders(fetchedOrders);
            } catch (err) {
                setError(err.message || 'Не удалось загрузить заказы');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

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

    const handleEdit = (orderId) => {
        navigate(`/admin/orders/${orderId}`);
    };

    if (loading) {
        return <div className="orders-loading">Загрузка...</div>;
    }

    if (error) {
        return <div className="orders-error">{error}</div>;
    }

    return (
        <div className="orders-page">
            <h1>Все заказы</h1>
            {orders.length === 0 ? (
                <p className="orders-empty">Заказы отсутствуют</p>
            ) : (
                <div className="orders-list">
                    {orders.map((order) => (
                        <div key={order.id} className="order-card">
                            <div className="order-field">
                                <span className="order-label">Номер заказа:</span>
                                <span className="order-value">{order.id}</span>
                            </div>
                            <div className="order-field">
                                <span className="order-label">Дата создания:</span>
                                <span className="order-value">{formatDate(order.created_at)}</span>
                            </div>
                            <div className="order-field">
                                <span className="order-label">Статус:</span>
                                <span className="order-value">{translateStatus(order.status)}</span>
                            </div>
                            <div className="order-field">
                                <span className="order-label">Итоговая сумма:</span>
                                <span className="order-value">{order.total_amount} ₽</span>
                            </div>
                            <div className="order-field">
                                <span className="order-label">Пользователь:</span>
                                <span className="order-value">{order.user_id}</span>
                            </div>
                            <button
                                className="edit-button"
                                onClick={() => handleEdit(order.id)}
                            >
                                Редактировать
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrdersPage;