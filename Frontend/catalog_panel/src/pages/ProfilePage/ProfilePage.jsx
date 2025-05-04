import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { verifyToken, logout, updateUser, clearUpdateStatus } from '../../store/authSlice';
import orderService from '../../services/OrderService';
import './ProfilePage.css';

const ProfilePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading: authLoading, error: authError, updateLoading, updateError, updateSuccess } = useSelector((state) => state.auth);

    // Состояние для заказов
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersError, setOrdersError] = useState(null);

    // Состояние для формы редактирования
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        fname: '',
        lname: '',
        phone: '',
    });
    const [validationError, setValidationError] = useState(null);

    // Проверяем токен при загрузке страницы
    useEffect(() => {
        if (!isAuthenticated) {
            dispatch(verifyToken());
        }
    }, [dispatch, isAuthenticated]);

    // Инициализируем форму данными пользователя
    useEffect(() => {
        if (user) {
            setFormData({
                fname: user.fname || '',
                lname: user.lname || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

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

    // Очистка сообщений об успехе/ошибке
    useEffect(() => {
        if (updateSuccess || updateError || validationError) {
            const timer = setTimeout(() => {
                dispatch(clearUpdateStatus());
                setValidationError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [updateSuccess, updateError, validationError, dispatch]);

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

    // Обработчик изменения формы
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Обработчик отправки формы
    const handleUpdateProfile = () => {
        setValidationError(null);
        try {
            dispatch(updateUser(formData)).unwrap();
            setEditMode(false);
        } catch (error) {
            try {
                const parsedErrors = JSON.parse(error.message);
                const errorMessage = Object.values(parsedErrors).join('; ');
                setValidationError(errorMessage);
            } catch (e) {
                setValidationError(error.message);
            }
        }
    };

    // Обработчик перехода на страницу заказа
    const handleViewOrder = (orderId) => {
        navigate(`/orders/${orderId}`);
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
                <>
                    {!editMode ? (
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
                                <span className="profile-label">Имя:</span>
                                <span className="profile-value">{user.fname || 'Не указано'}</span>
                            </div>
                            <div className="profile-field">
                                <span className="profile-label">Фамилия:</span>
                                <span className="profile-value">{user.lname || 'Не указано'}</span>
                            </div>
                            <div className="profile-field">
                                <span className="profile-label">Номер телефона:</span>
                                <span className="profile-value">{user.phone || 'Не указано'}</span>
                            </div>
                            <div className="profile-field">
                                <span className="profile-label">Публичный ID:</span>
                                <span className="profile-value">{user.public_id}</span>
                            </div>
                            <button
                                className="edit-profile-button"
                                onClick={() => setEditMode(true)}
                            >
                                Редактировать профиль
                            </button>
                        </div>
                    ) : (
                        <div className="profile-edit-form">
                            <h3>Редактировать профиль</h3>
                            <div className="form-field">
                                <label>Имя:</label>
                                <input
                                    type="text"
                                    name="fname"
                                    value={formData.fname}
                                    onChange={handleInputChange}
                                    placeholder="Введите имя"
                                />
                            </div>
                            <div className="form-field">
                                <label>Фамилия:</label>
                                <input
                                    type="text"
                                    name="lname"
                                    value={formData.lname}
                                    onChange={handleInputChange}
                                    placeholder="Введите фамилию"
                                />
                            </div>
                            <div className="form-field">
                                <label>Номер телефона:</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="Введите номер телефона (например, +12025550123)"
                                />
                            </div>
                            <div className="form-buttons">
                                <button
                                    className="save-profile-button"
                                    onClick={handleUpdateProfile}
                                    disabled={updateLoading}
                                >
                                    {updateLoading ? 'Сохранение...' : 'Сохранить'}
                                </button>
                                <button
                                    className="cancel-profile-button"
                                    onClick={() => setEditMode(false)}
                                    disabled={updateLoading}
                                >
                                    Отмена
                                </button>
                            </div>
                        </div>
                    )}
                </>
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
                    <div key={order.id} className="order-card" onClick={() => handleViewOrder(order.id)}>
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

            {updateSuccess && (
                <div className="update-success-message">
                    Профиль успешно обновлён!
                </div>
            )}

            {updateError && (
                <div className="update-error-message">
                    {updateError}
                </div>
            )}

            {validationError && (
                <div className="validation-error-message">
                    {validationError}
                </div>
            )}
        </div>
    );
};

export default ProfilePage;