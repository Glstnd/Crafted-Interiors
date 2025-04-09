// src/components/CartPage.js
import "./CartPage.css";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { removeFromCart, updateQuantity } from "../../store/cartSlice";
import placeholderImage from "../../assets/not_found_picture.jpg";

const CartPage = () => {
    const cartItems = useSelector((state) => state.cart.items);
    const dispatch = useDispatch();
    const [viewMode, setViewMode] = useState("grid");
    const [showRemoveMessage, setShowRemoveMessage] = useState(false);
    const [showQuantityMessage, setShowQuantityMessage] = useState(false);

    const handleCheckout = () => {
        console.log("Оформление заказа:", cartItems);
    };

    const handleRemoveFromCart = (productTag) => {
        dispatch(removeFromCart(productTag));
        setShowRemoveMessage(true);
        setTimeout(() => setShowRemoveMessage(false), 5000);
    };

    const handleQuantityChange = (productTag, newQuantity) => {
        const quantity = Math.max(1, newQuantity);
        dispatch(updateQuantity({ productTag, quantity }));
        setShowQuantityMessage(true);
        setTimeout(() => setShowQuantityMessage(false), 5000);
    };

    // Вычисление итоговой суммы для каждого товара и общей суммы
    const calculateItemTotal = (item) => {
        return item.product.price !== null ? item.product.price * item.quantity : 0;
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + calculateItemTotal(item), 0);
    };

    if (cartItems.length === 0) {
        return (
            <div className="cart-page fade-in">
                <h1 className="cart-title">Корзина</h1>
                <p className="cart-empty">Ваша корзина пуста</p>
            </div>
        );
    }

    return (
        <>
            <div className="cart-page fade-in">
                <h1 className="cart-title">Корзина</h1>

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

                <div className={`cart-items-container ${viewMode === "grid" ? "grid-view" : "list-view"}`}>
                    {cartItems.map((item, index) => (
                        <div
                            key={item.product.tag}
                            className={`cart-item fade-in ${viewMode === "list" ? "list-item" : ""}`}
                            style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                        >
                            <img
                                src={
                                    item.product.image_path
                                        ? `http://localhost:9000/catalog-images/${item.product.image_path}`
                                        : placeholderImage
                                }
                                alt={item.product.name}
                                className="cart-item-image"
                            />
                            <div className="cart-item-details">
                                <h2 className="cart-item-name">{item.product.name}</h2>
                                <p className="cart-item-tag">#{item.product.tag}</p>
                                <p className="cart-item-price">
                                    {item.product.price !== null
                                        ? `${item.product.price} руб.`
                                        : "Цена не указана"}
                                </p>
                                <p className="cart-item-total">
                                    Итого: {calculateItemTotal(item)} руб.
                                </p>
                                {viewMode === "grid" && (
                                    <div className="cart-item-actions">
                                        <div className="cart-item-quantity-control">
                                            <button
                                                className="quantity-button"
                                                onClick={() => handleQuantityChange(item.product.tag, item.quantity - 1)}
                                            >
                                                −
                                            </button>
                                            <span className="quantity-display">{item.quantity}</span>
                                            <button
                                                className="quantity-button"
                                                onClick={() => handleQuantityChange(item.product.tag, item.quantity + 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            className="remove-button"
                                            onClick={() => handleRemoveFromCart(item.product.tag)}
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                )}
                            </div>
                            {viewMode === "list" && (
                                <div className="cart-item-actions list-actions">
                                    <div className="cart-item-quantity-control">
                                        <button
                                            className="quantity-button"
                                            onClick={() => handleQuantityChange(item.product.tag, item.quantity - 1)}
                                        >
                                            −
                                        </button>
                                        <span className="quantity-display">{item.quantity}</span>
                                        <button
                                            className="quantity-button"
                                            onClick={() => handleQuantityChange(item.product.tag, item.quantity + 1)}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button
                                        className="remove-button"
                                        onClick={() => handleRemoveFromCart(item.product.tag)}
                                    >
                                        Удалить
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="checkout-section">
                    <div className="total-price">
                        Итого: {calculateTotal()} руб.
                    </div>
                    <button className="checkout-button" onClick={handleCheckout}>
                        Оформить заказ
                    </button>
                </div>
            </div>

            {showRemoveMessage && (
                <div className="remove-from-cart-message">
                    Товар удалён из корзины
                </div>
            )}

            {showQuantityMessage && (
                <div className="quantity-changed-message">
                    Количество товара изменено
                </div>
            )}
        </>
    );
};

export default CartPage;