import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../../services/OrderService';
import './OrdersPage.css';

const OrdersPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState("grid");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createForm, setCreateForm] = useState({
        public_id: '',
        total_amount: '',
        status: 'pending',
        items: [{ product_tag: '', quantity: 1, unit_price: '' }],
    });
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState(null);
    const [createSuccess, setCreateSuccess] = useState(false);

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

    const handleAddItem = () => {
        setCreateForm({
            ...createForm,
            items: [...createForm.items, { product_tag: '', quantity: 1, unit_price: '' }],
        });
    };

    const handleRemoveItem = (index) => {
        if (createForm.items.length === 1) return; // Не удаляем последний элемент
        const newItems = createForm.items.filter((_, i) => i !== index);
        setCreateForm({ ...createForm, items: newItems });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...createForm.items];
        newItems[index][field] = value;
        setCreateForm({ ...createForm, items: newItems });
    };

    const handleCreateOrder = async () => {
        setCreateLoading(true);
        setCreateError(null);
        setCreateSuccess(false);

        try {
            const orderData = {
                public_id: createForm.public_id,
                total_amount: parseFloat(createForm.total_amount),
                status: createForm.status,
                items: createForm.items.map(item => ({
                    product_tag: item.product_tag,
                    quantity: parseInt(item.quantity),
                    unit_price: parseFloat(item.unit_price),
                })),
            };

            const newOrder = await orderService.createOrder(orderData);
            setOrders([newOrder, ...orders]);
            setCreateSuccess(true);
            setShowCreateForm(false);
            setCreateForm({
                public_id: '',
                total_amount: '',
                status: 'pending',
                items: [{ product_tag: '', quantity: 1, unit_price: '' }],
            });
            setTimeout(() => setCreateSuccess(false), 5000);
        } catch (err) {
            setCreateError(err.message || 'Не удалось создать заказ');
            setTimeout(() => setCreateError(null), 5000);
        } finally {
            setCreateLoading(false);
        }
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

            <div className="controls-section">
                <button
                    className="create-order-button"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                >
                    {showCreateForm ? 'Скрыть форму' : 'Создать заказ'}
                </button>

                <div className="view-controls">
                    <button
                        className={`view-button ${viewMode === "grid" ? "active" : ""}`}
                        onClick={() => setViewMode("grid")}
                    >
                        <span className="icon-grid">🗇</span> Сетка
                    </button>
                    <button
                        className={`view-button ${viewMode === "list" ? "active" : ""}`}
                        onClick={() => setViewMode("list")}
                    >
                        <span className="icon-list">≡</span> Список
                    </button>
                </div>
            </div>

            {showCreateForm && (
                <div className="create-form">
                    <h2>Создать новый заказ</h2>
                    <div className="form-field">
                        <label>Public ID пользователя:</label>
                        <input
                            type="text"
                            value={createForm.public_id}
                            onChange={(e) => setCreateForm({ ...createForm, public_id: e.target.value })}
                            placeholder="Введите UUID пользователя"
                        />
                    </div>
                    <div className="form-field">
                        <label>Итоговая сумма (₽):</label>
                        <input
                            type="number"
                            value={createForm.total_amount}
                            onChange={(e) => setCreateForm({ ...createForm, total_amount: e.target.value })}
                            placeholder="Введите сумму"
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div className="form-field">
                        <label>Статус:</label>
                        <select
                            value={createForm.status}
                            onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                        >
                            <option value="pending">Рассматривается</option>
                            <option value="processing">Изготавливается</option>
                            <option value="shipped">В доставке</option>
                            <option value="completed">Завершён</option>
                        </select>
                    </div>
                    <h3>Товары</h3>
                    {createForm.items.map((item, index) => (
                        <div key={index} className="item-form">
                            <div className="form-field">
                                <label>Тег товара:</label>
                                <input
                                    type="text"
                                    value={item.product_tag}
                                    onChange={(e) => handleItemChange(index, 'product_tag', e.target.value)}
                                    placeholder="Введите тег товара"
                                />
                            </div>
                            <div className="form-field">
                                <label>Количество:</label>
                                <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                    min="1"
                                />
                            </div>
                            <div className="form-field">
                                <label>Цена за единицу (₽):</label>
                                <input
                                    type="number"
                                    value={item.unit_price}
                                    onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                                    placeholder="Введите цену"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <button
                                className="remove-item-button"
                                onClick={() => handleRemoveItem(index)}
                                disabled={createForm.items.length === 1}
                            >
                                Удалить
                            </button>
                        </div>
                    ))}
                    <button className="add-item-button" onClick={handleAddItem}>
                        Добавить товар
                    </button>
                    <button
                        className="submit-order-button"
                        onClick={handleCreateOrder}
                        disabled={createLoading}
                    >
                        {createLoading ? 'Создание...' : 'Создать заказ'}
                    </button>
                </div>
            )}

            {orders.length === 0 ? (
                <p className="orders-empty">Заказы отсутствуют</p>
            ) : (
                <div className={`orders-list ${viewMode === "grid" ? "grid-view" : "list-view"}`}>
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className={`order-card ${viewMode === "list" ? "list-item" : ""}`}
                        >
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
                                <span className={`order-value status-${order.status}`}>
                                    {translateStatus(order.status)}
                                </span>
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

            {createSuccess && (
                <div className="create-success-message">
                    Заказ успешно создан!
                </div>
            )}

            {createError && (
                <div className="create-error-message">
                    {createError}
                </div>
            )}
        </div>
    );
};

export default OrdersPage;