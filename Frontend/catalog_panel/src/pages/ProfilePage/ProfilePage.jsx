import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { verifyToken, logout } from '../../store/authSlice';
import orderService from '../../services/OrderService'; // Импортируем OrderService
import './ProfilePage.css';

const ProfilePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading: authLoading, error: authError } = useSelector((state) => state.auth);

    // Состояние для заказов
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersError, setOrdersError] = useState(null);

    // Проверяем токен при загрузке страницы
    useEffect(() => {
        if (!isAuthenticated) {
            dispatch(verifyToken());
        }
    }, [dispatch, isAuthenticated]);

    // Загружаем заказы, если пользователь авторизован
    useEffect(() => {
        const fetchOrders = async () => {
            if (isAuthenticated) {
                setOrdersLoading(true);
                setOrdersError(null);
                try {
                    const fetchedOrders = await orderService.getOrders();
                    setOrders(fetchedOrders);
                } catch (error) {
                    setOrdersError(error.message || 'Не удалось загрузить заказы');
                } finally {
                    setOrdersLoading(false);
                }
            }
        };
        fetchOrders();
    }, [isAuthenticated]);

    // Если пользователь не авторизован, перенаправляем на логин
    useEffect(() => {
        if (!isAuthenticated && !authLoading) {
            navigate('/login');
        }
    }, [isAuthenticated, authLoading, navigate]);

    // Обработчик выхода
    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    // Перевод статусов заказов
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

    if (authLoading) {
        return <div className="profile-loading">Загрузка...</div>;
    }

    if (authError) {
        return <div className="profile-error">{authError}</div>;
    }

    return (
        <div className="profile-container">
            <h2>Профиль пользователя</h2>
            {user && (
                <div className="profile-info">
                    <div className="profile-field">
                        <span className="profile-label">Имя пользователя:</span>
                        <span className="profile-value">{user.username}</span>
                    </div>
                    <div className="profile-field">
                        <span className="profile-label">Email:</span>
                        <span className="profile-value">{user.email}</span>
                    </div>
                    <div className="profile-field">
                        <span className="profile-label">Публичный ID:</span>
                        <span className="profile-value">{user.public_id}</span>
                    </div>
                </div>
            )}
            <button className="logout-button" onClick={handleLogout}>
                Выйти
            </button>

            <div className="orders-section">
                <h2>Ваши заказы</h2>
                {ordersLoading && <div className="orders-loading">Загрузка заказов...</div>}
                {ordersError && <div className="orders-error">{ordersError}</div>}
                {!ordersLoading && !ordersError && orders.length === 0 && (
                    <div className="orders-empty">У вас пока нет заказов</div>
                )}
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
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProfilePage;