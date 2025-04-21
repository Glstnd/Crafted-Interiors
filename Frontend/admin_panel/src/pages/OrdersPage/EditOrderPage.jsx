import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import orderService from '../../services/OrderService';
import catalogService from '../../services/CatalogService';
import categoryService from '../../services/CategoryService';
import productService from '../../services/ProductService';
import './EditOrderPage.css';

const EditOrderPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        status: 'pending',
        items: [{ product_id: '', quantity: 1 }],
    });
    const [userInfo, setUserInfo] = useState(null);
    const [productsInfo, setProductsInfo] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateError, setUpdateError] = useState(null);
    const [updateSuccess, setUpdateSuccess] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [catalogs, setCatalogs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCatalogTag, setSelectedCatalogTag] = useState(null);
    const [selectedCategoryTag, setSelectedCategoryTag] = useState(null);
    const [modalStep, setModalStep] = useState('catalog');

    const calculateTotalAmount = () => {
        return formData.items.reduce((total, item) => {
            const quantity = parseInt(item.quantity) || 0;
            const price = parseFloat(productsInfo[item.product_id]?.price) || 0;
            return total + quantity * price;
        }, 0).toFixed(2);
    };

    useEffect(() => {
        const fetchOrderAndRelatedData = async () => {
            setLoading(true);
            setError(null);
            try {
                const fetchedOrder = await orderService.getOrderById(orderId);
                setFormData({
                    status: fetchedOrder.status,
                    items: fetchedOrder.items.map(item => ({
                        product_id: item.product_id.toString(),
                        quantity: item.quantity,
                    })),
                });

                const fetchedUserInfo = await orderService.getUserInfo(fetchedOrder.user_id);
                setUserInfo(fetchedUserInfo);

                const productRequests = fetchedOrder.items.map(async (item) => {
                    try {
                        const productInfo = await orderService.getProductInfo(item.product_id);
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
                setError(err.message || 'Не удалось загрузить данные');
            } finally {
                setLoading(false);
            }
        };
        fetchOrderAndRelatedData();
    }, [orderId]);

    const handleAddItem = () => {
        setIsModalOpen(true);
        setModalStep('catalog');
        catalogService.getCatalogs()
            .then(data => setCatalogs(data))
            .catch(err => {
                console.error('Ошибка загрузки каталогов:', err);
                setCatalogs([]);
            });
    };

    const handleRemoveItem = (index) => {
        if (formData.items.length === 1) return;
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedCatalogTag(null);
        setSelectedCategoryTag(null);
        setModalStep('catalog');
        setCatalogs([]);
        setCategories([]);
        setProducts([]);
    };

    const handleCatalogSelect = (catalogTag) => {
        setSelectedCatalogTag(catalogTag);
        setModalStep('category');
        categoryService.getCategories(catalogTag)
            .then(data => setCategories(data))
            .catch(err => {
                console.error('Ошибка загрузки категорий:', err);
                setCategories([]);
            });
    };

    const handleCategorySelect = (categoryTag) => {
        setSelectedCategoryTag(categoryTag);
        setModalStep('product');
        productService.getProducts(selectedCatalogTag, categoryTag)
            .then(data => setProducts(data))
            .catch(err => {
                console.error('Ошибка загрузки товаров:', err);
                setProducts([]);
            });
    };

    const handleProductSelect = async (productTag) => {
        try {
            const productInfo = await productService.getProductByTag(selectedCatalogTag, selectedCategoryTag, productTag);
            setProductsInfo(prev => ({
                ...prev,
                [productInfo.id]: productInfo,
            }));
            setFormData({
                ...formData,
                items: [...formData.items, { product_id: productInfo.id.toString(), quantity: 1 }],
            });
            handleModalClose();
        } catch (err) {
            console.error(`Ошибка загрузки товара ${productTag}:`, err);
            setProductsInfo(prev => ({
                ...prev,
                [productTag]: { name: `Товар ${productTag}`, price: 0, tag: 'Неизвестно' },
            }));
            setFormData({
                ...formData,
                items: [...formData.items, { product_id: productTag.toString(), quantity: 1 }],
            });
            handleModalClose();
        }
    };

    const handleUpdateOrder = async () => {
        setUpdateLoading(true);
        setUpdateError(null);
        setUpdateSuccess(false);

        try {
            // Проверяем наличие public_id
            if (!userInfo?.public_id) {
                throw new Error('Идентификатор пользователя отсутствует');
            }

            const orderData = {
                user_id: userInfo.public_id,
                total_amount: parseFloat(calculateTotalAmount()),
                status: formData.status,
                items: formData.items.map(item => ({
                    product_id: parseInt(item.product_id),
                    quantity: parseInt(item.quantity),
                    unit_price: parseFloat(productsInfo[item.product_id]?.price) || 0,
                })),
            };

            await orderService.updateOrder(orderId, orderData);
            setUpdateSuccess(true);
            setTimeout(() => {
                setUpdateSuccess(false);
                navigate(`/orders/${orderId}`);
            }, 3000);
        } catch (err) {
            setUpdateError(err.message || 'Не удалось обновить заказ');
            setTimeout(() => setUpdateError(null), 5000);
        } finally {
            setUpdateLoading(false);
        }
    };

    if (loading) {
        return <div className="edit-order-loading">Загрузка...</div>;
    }

    if (error) {
        return <div className="edit-order-error">{error}</div>;
    }

    return (
        <div className="edit-order-page">
            <h1>Редактировать заказ #{orderId}</h1>

            <div className="edit-form">
                <div className="form-field">
                    <label>Заказчик:</label>
                    {userInfo ? (
                        <div className="customer-info">
                            {userInfo.fname} {userInfo.lname}
                        </div>
                    ) : (
                        <div className="customer-info">Данные заказчика отсутствуют</div>
                    )}
                </div>
                <div className="form-field">
                    <label>Итоговая сумма (₽):</label>
                    <div className="total-amount">{calculateTotalAmount()} ₽</div>
                </div>
                <div className="form-field">
                    <label>Статус:</label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                        <option value="pending">Рассматривается</option>
                        <option value="processing">Изготавливается</option>
                        <option value="shipped">В доставке</option>
                        <option value="completed">Завершён</option>
                    </select>
                </div>
                <h3>Товары</h3>
                {formData.items.map((item, index) => (
                    <div key={index} className="item-form">
                        <div className="form-field">
                            <label>Название товара:</label>
                            <div className="product-name">
                                {productsInfo[item.product_id]?.name || `Товар ${item.product_id}`}
                            </div>
                        </div>
                        <div className="form-field">
                            <label>Уникальный тег:</label>
                            <div className="product-tag">
                                {productsInfo[item.product_id]?.tag || 'Неизвестно'}
                            </div>
                        </div>
                        <div className="form-field">
                            <label>Цена за единицу (₽):</label>
                            <div className="unit-price">
                                {(parseFloat(productsInfo[item.product_id]?.price) || 0).toFixed(2)} ₽
                            </div>
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
                        <button
                            className="remove-item-button"
                            onClick={() => handleRemoveItem(index)}
                            disabled={formData.items.length === 1}
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
                    onClick={handleUpdateOrder}
                    disabled={updateLoading}
                >
                    {updateLoading ? 'Обновление...' : 'Обновить заказ'}
                </button>
            </div>

            {updateSuccess && (
                <div className="update-success-message">
                    Заказ успешно обновлён!
                </div>
            )}

            {updateError && (
                <div className="update-error-message">
                    {updateError}
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Выбор товара</h2>
                        {modalStep === 'catalog' && (
                            <div className="modal-step">
                                <h3>Выберите каталог</h3>
                                {catalogs.length > 0 ? (
                                    <div className="modal-list">
                                        {catalogs.map(catalog => (
                                            <button
                                                key={catalog.tag}
                                                className="modal-item"
                                                onClick={() => handleCatalogSelect(catalog.tag)}
                                            >
                                                {catalog.name}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p>Каталоги отсутствуют</p>
                                )}
                            </div>
                        )}
                        {modalStep === 'category' && (
                            <div className="modal-step">
                                <h3>Выберите категорию</h3>
                                {categories.length > 0 ? (
                                    <div className="modal-list">
                                        {categories.map(category => (
                                            <button
                                                key={category.tag}
                                                className="modal-item"
                                                onClick={() => handleCategorySelect(category.tag)}
                                            >
                                                {category.name}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p>Категории отсутствуют</p>
                                )}
                                <button
                                    className="modal-back-button"
                                    onClick={() => setModalStep('catalog')}
                                >
                                    Назад
                                </button>
                            </div>
                        )}
                        {modalStep === 'product' && (
                            <div className="modal-step">
                                <h3>Выберите товар</h3>
                                {products.length > 0 ? (
                                    <div className="modal-list">
                                        {products.map(product => (
                                            <button
                                                key={product.tag}
                                                className="modal-item"
                                                onClick={() => handleProductSelect(product.tag)}
                                            >
                                                {product.name} (Цена: {product.price} ₽, Тег: {product.tag})
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p>Товары отсутствуют</p>
                                )}
                                <button
                                    className="modal-back-button"
                                    onClick={() => setModalStep('category')}
                                >
                                    Назад
                                </button>
                            </div>
                        )}
                        <button className="modal-close-button" onClick={handleModalClose}>
                            Закрыть
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditOrderPage;