'use client';

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../../services/OrderService';
import pdfMake from '../../assets/vfs_fonts';
import logoSvg from '../../assets/logo.svg?raw';
import './OrdersPage.css';
import UserService from '../../services/UserService.js';
import CurrencyService from '../../services/CurrencyService';

const OrdersPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
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
    const [reportPeriod, setReportPeriod] = useState({
        type: 'all',
        startDate: '',
        endDate: '',
    });
    const [userMap, setUserMap] = useState({});
    const [selectedCurrency, setSelectedCurrency] = useState('RUB');
    const [convertedAmounts, setConvertedAmounts] = useState({});

    const fetchUsersForOrders = async (orders) => {
        const uniqueUserIds = [...new Set(orders.map((order) => order.user_id))];
        const userMapTemp = {};

        for (const id of uniqueUserIds) {
            try {
                const user = await UserService.getUserInfo(id);
                userMapTemp[id] = `${user.fname} ${user.lname}`;
            } catch (e) {
                userMapTemp[id] = 'Неизвестный пользователь';
            }
        }

        setUserMap(userMapTemp);
    };

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            setError(null);
            try {
                const fetchedOrders = await orderService.getOrders();
                setOrders(fetchedOrders);
                await fetchUsersForOrders(fetchedOrders);
            } catch (err) {
                setError(err.message || 'Не удалось загрузить заказы');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    useEffect(() => {
        const convertAllAmounts = async () => {
            const newConvertedAmounts = {};
            for (const order of orders) {
                try {
                    const converted = await CurrencyService.convert(order.total_amount, selectedCurrency);
                    newConvertedAmounts[order.id] = `${converted} ${CurrencyService.getCurrencySymbol(selectedCurrency)}`;
                } catch (error) {
                    newConvertedAmounts[order.id] = `${order.total_amount} руб.`;
                }
            }
            setConvertedAmounts(newConvertedAmounts);
        };
        convertAllAmounts();
    }, [orders, selectedCurrency]);

    const translateStatus = (status) => {
        const statusMap = {
            pending: 'Рассматривается',
            processing: 'Изготавливается',
            shipped: 'В доставке',
            completed: 'Завершён',
            delivered: 'Доставлен',
        };
        return statusMap[status] || status;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}.${month}.${year} в ${hours}:${minutes}`;
    };

    const handleEdit = (orderId) => {
        navigate(`/orders/${orderId}/edit`);
    };

    const handleCardClick = (orderId) => {
        navigate(`/orders/${orderId}`);
    };

    const handleAddItem = () => {
        setCreateForm({
            ...createForm,
            items: [...createForm.items, { product_tag: '', quantity: 1, unit_price: '' }],
        });
    };

    const handleRemoveItem = (index) => {
        if (createForm.items.length === 1) return;
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
            if (!createForm.total_amount || isNaN(parseFloat(createForm.total_amount))) {
                throw new Error('Итоговая сумма должна быть числом');
            }
            if (createForm.items.some((item) => !item.unit_price || isNaN(parseFloat(item.unit_price)))) {
                throw new Error('Цена за единицу должна быть числом для всех товаров');
            }

            const totalAmountInRUB = selectedCurrency === 'RUB'
                ? parseFloat(createForm.total_amount)
                : parseFloat(await CurrencyService.convert(
                    parseFloat(createForm.total_amount),
                    'RUB'
                ));
            const itemsInRUB = await Promise.all(
                createForm.items.map(async (item) => ({
                    product_tag: item.product_tag,
                    quantity: parseInt(item.quantity),
                    unit_price: selectedCurrency === 'RUB'
                        ? parseFloat(item.unit_price)
                        : parseFloat(await CurrencyService.convert(
                            parseFloat(item.unit_price),
                            'RUB'
                        )),
                }))
            );

            const orderData = {
                public_id: createForm.public_id,
                total_amount: totalAmountInRUB,
                status: createForm.status,
                items: itemsInRUB,
            };

            const newOrder = await orderService.createOrder(orderData);
            setOrders([newOrder, ...orders]);
            await fetchUsersForOrders([newOrder, ...orders]);
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

    const filterOrdersByPeriod = () => {
        const now = new Date();
        let startDate, endDate;

        if (reportPeriod.type === 'all') {
            return orders;
        } else if (reportPeriod.type === 'week') {
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            endDate = now;
        } else if (reportPeriod.type === 'custom') {
            if (!reportPeriod.startDate || !reportPeriod.endDate) return [];
            startDate = new Date(reportPeriod.startDate);
            endDate = new Date(reportPeriod.endDate);
            endDate.setHours(23, 59, 59, 999);
        }

        return orders.filter((order) => {
            const orderDate = new Date(order.created_at);
            return orderDate >= startDate && orderDate <= endDate;
        });
    };

    const generateReport = async () => {
        const filteredOrders = filterOrdersByPeriod();

        if (filteredOrders.length === 0) {
            alert('Нет заказов за выбранный период.');
            return;
        }

        const convertedOrders = await Promise.all(
            filteredOrders.map(async (order) => ({
                ...order,
                total_amount: await CurrencyService.convert(order.total_amount, selectedCurrency),
            }))
        );

        const totalOrders = convertedOrders.length;
        const totalSales = convertedOrders
            .reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0)
            .toFixed(2);
        const averageOrderValue = totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : 0;
        const currencySymbol = CurrencyService.getCurrencySymbol(selectedCurrency);

        const docDefinition = {
            pageMargins: [40, 10, 40, 40],
            content: [
                {
                    columns: [
                        {
                            svg: logoSvg,
                            width: 150,
                        },
                        {
                            text: 'Furniture.CraftedInteriors',
                            style: 'company',
                            margin: [0, 32, 100, 0],
                        },
                    ],
                    columnGap: 0,
                    alignment: 'center',
                    margin: [0, 5, 0, 5],
                },
                { text: 'Отчёт по заказам предприятия', style: 'header', alignment: 'center', margin: [0, 5, 0, 5] },
                { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1 }], margin: [0, 0, 0, 5] },
                {
                    text: (() => {
                        if (reportPeriod.type === 'all') {
                            const dates = orders.map((o) => new Date(o.created_at));
                            const minDate = new Date(Math.min(...dates));
                            const maxDate = new Date(Math.max(...dates));
                            return `Период: Всё время (${formatDate(minDate)} - ${formatDate(maxDate)})`;
                        }
                        if (reportPeriod.type === 'week') {
                            const now = new Date();
                            const weekAgo = new Date(now);
                            weekAgo.setDate(now.getDate() - 7);
                            return `Период: Последняя неделя (${formatDate(weekAgo)} - ${formatDate(now)})`;
                        }
                        return `Период: ${formatDate(reportPeriod.startDate)} - ${formatDate(reportPeriod.endDate)}`;
                    })(),
                    style: 'subheader',
                    margin: [0, 5, 0, 10],
                },
                {
                    table: {
                        headerRows: 1,
                        widths: [50, 130, 100, 85, 140], // Заказчик уменьшен до 140 для отступа 10px от края
                        body: [
                            [
                                { text: '№ заказа', style: 'tableHeader' },
                                { text: 'Дата создания', style: 'tableHeader' },
                                { text: 'Статус', style: 'tableHeader' },
                                { text: `Сумма (${currencySymbol})`, style: 'tableHeader' },
                                { text: 'Заказчик', style: 'tableHeader' },
                            ],
                            ...convertedOrders.map((order) => [
                                order.id,
                                formatDate(order.created_at),
                                translateStatus(order.status),
                                order.total_amount,
                                userMap[order.user_id] || 'Неизвестный пользователь',
                            ]),
                        ],
                    },
                    margin: [0, 0, 0, 10],
                },
                { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1 }], margin: [0, 0, 0, 10] },
                { text: 'Статистика', style: 'subheader', margin: [0, 5, 0, 5] },
                { text: `Общее количество заказов: ${totalOrders}`, margin: [20, 2, 0, 0] },
                { text: `Общая сумма продаж: ${totalSales} ${currencySymbol}`, margin: [20, 2, 0, 0] },
                { text: `Средний чек: ${averageOrderValue} ${currencySymbol}`, margin: [20, 2, 0, 0] },
            ],
            styles: {
                company: { fontSize: 20, bold: true },
                header: { fontSize: 24, bold: true },
                subheader: { fontSize: 16, bold: true },
                tableHeader: { bold: true, fontSize: 14, fillColor: '#f0f0f0', alignment: 'center' },
            },
            defaultStyle: {
                font: 'Roboto',
                fontSize: 12,
            },
        };

        const currentDate = new Date().toISOString().split('T')[0];
        pdfMake.createPdf(docDefinition).download(`enterprise-report-${currentDate}.pdf`);
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
                        className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                    >
                        <span className="icon-grid">🗇</span> Сетка
                    </button>
                    <button
                        className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                    >
                        <span className="icon-list">≡</span> Список
                    </button>
                    <select
                        value={selectedCurrency}
                        onChange={(e) => setSelectedCurrency(e.target.value)}
                        className="currency-selector"
                    >
                        <option value="RUB">RUB (руб.)</option>
                        <option value="USD">USD ($)</option>
                        <option value="BYN">BYN (Br)</option>
                    </select>
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
                        <label>Итоговая сумма ({CurrencyService.getCurrencySymbol(selectedCurrency)}):</label>
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
                            <option value="delivered">Доставлен</option>
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
                                <label>Цена за единицу ({CurrencyService.getCurrencySymbol(selectedCurrency)}):</label>
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

            <div className="report-section">
                <h3>Сформировать отчёт</h3>
                <div className="report-controls">
                    <div className="form-field">
                        <label>Период:</label>
                        <select
                            value={reportPeriod.type}
                            onChange={(e) => setReportPeriod({ ...reportPeriod, type: e.target.value })}
                        >
                            <option value="all">Всё время</option>
                            <option value="week">Последняя неделя</option>
                            <option value="custom">Выбрать даты</option>
                        </select>
                    </div>
                    {reportPeriod.type === 'custom' && (
                        <>
                            <div className="form-field">
                                <label>Начальная дата:</label>
                                <input
                                    type="date"
                                    value={reportPeriod.startDate}
                                    onChange={(e) => setReportPeriod({ ...reportPeriod, startDate: e.target.value })}
                                />
                            </div>
                            <div className="form-field">
                                <label>Конечная дата:</label>
                                <input
                                    type="date"
                                    value={reportPeriod.endDate}
                                    onChange={(e) => setReportPeriod({ ...reportPeriod, endDate: e.target.value })}
                                />
                            </div>
                        </>
                    )}
                    <button className="report-button" onClick={generateReport}>
                        Сформировать отчёт
                    </button>
                </div>
            </div>

            {orders.length === 0 ? (
                <p className="orders-empty">Заказы отсутствуют</p>
            ) : (
                <div className={`orders-list ${viewMode === 'grid' ? 'grid-view' : 'list-view'}`}>
                    {viewMode === 'grid' ? (
                        orders.map((order) => (
                            <div
                                key={order.id}
                                className="order-card"
                                onClick={() => handleCardClick(order.id)}
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
                                    <span className="order-value">
                                        {convertedAmounts[order.id] || `${order.total_amount} руб.`}
                                    </span>
                                </div>
                                <div className="order-field">
                                    <span className="order-label">Заказчик:</span>
                                    <span className="order-value">
                                        {userMap[order.user_id] || 'Неизвестный пользователь'}
                                    </span>
                                </div>
                                <button
                                    className="edit-button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEdit(order.id);
                                    }}
                                >
                                    Редактировать
                                </button>
                            </div>
                        ))
                    ) : (
                        <table className="orders-table">
                            <thead>
                            <tr>
                                <th>№ заказа</th>
                                <th>Дата создания</th>
                                <th>Статус</th>
                                <th>Итоговая сумма</th>
                                <th>Заказчик</th>
                                <th>Действия</th>
                            </tr>
                            </thead>
                            <tbody>
                            {orders.map((order) => (
                                <tr
                                    key={order.id}
                                    className="order-row"
                                    onClick={() => handleCardClick(order.id)}
                                >
                                    <td className="order-value">{order.id}</td>
                                    <td className="order-value">{formatDate(order.created_at)}</td>
                                    <td className={`order-value status-${order.status}`}>
                                        {translateStatus(order.status)}
                                    </td>
                                    <td className="order-value">
                                        {convertedAmounts[order.id] || `${order.total_amount} руб.`}
                                    </td>
                                    <td className="order-value">
                                        {userMap[order.user_id] || 'Неизвестный пользователь'}
                                    </td>
                                    <td>
                                        <button
                                            className="edit-button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(order.id);
                                            }}
                                        >
                                            Редактировать
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {createSuccess && (
                <div className="create-success-message">Заказ успешно создан!</div>
            )}

            {createError && (
                <div className="create-error-message">{createError}</div>
            )}
        </div>
    );
};

export default OrdersPage;