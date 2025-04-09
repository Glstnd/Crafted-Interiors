// src/components/ProductPage.js
import "./ProductPage.css";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../store/cartSlice";
import ProductService from "../../services/ProductService.js";
import placeholderImage from "../../assets/not_found_picture.jpg";

const ProductPage = () => {
    const { catalog_tag, category_tag, product_tag } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cartItems = useSelector(state => state.cart.items);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [showAddMessage, setShowAddMessage] = useState(false); // Состояние для сообщения

    useEffect(() => {
        setLoading(true);
        ProductService.getProductByTag(catalog_tag, category_tag, product_tag)
            .then((data) => {
                setProduct(data);
                setLoading(false);
            })
            .catch((error) => {
                console.log("Ошибка при загрузке товара:", error);
                setProduct(null);
                setLoading(false);
            });
    }, [catalog_tag, category_tag, product_tag]);

    const handleAddToCart = () => {
        if (product) {
            dispatch(addToCart({ product }));
            console.log(`Товар ${product.name} добавлен в корзину. Текущая корзина:`, cartItems);
            // Показываем сообщение и скрываем через 5 секунд
            setShowAddMessage(true);
            setTimeout(() => {
                setShowAddMessage(false);
            }, 5000);
        }
    };

    const toggleImageModal = () => {
        setIsImageModalOpen(!isImageModalOpen);
    };

    if (loading) {
        return <div className="product-loading">Загрузка товара...</div>;
    }

    if (!product) {
        return <div className="product-not-found">Товар не найден</div>;
    }

    return (
        <>
            <div className="product-page fade-in">
                <div className="product-container">
                    <div className="product-image-wrapper">
                        <img
                            src={
                                product.image_path
                                    ? `http://localhost:9000/catalog-images/${product.image_path}`
                                    : placeholderImage
                            }
                            alt={product.name}
                            className="product-image"
                            onClick={toggleImageModal}
                            style={{ cursor: "pointer" }}
                        />
                    </div>
                    <div className="product-details">
                        <h1 className="product-title">{product.name}</h1>
                        <p className="product-tag">#{product.tag}</p>
                        <p className="product-description">{product.description || "Описание отсутствует"}</p>
                        <div className="product-footer">
                            <p className="product-price">
                                {product.price !== null ? `${product.price} руб.` : "Цена не указана"}
                            </p>
                            <button className="add-to-cart-button" onClick={handleAddToCart}>
                                В корзину
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Модальное окно для изображения */}
            {isImageModalOpen && (
                <div className="image-modal" onClick={toggleImageModal}>
                    <div className="image-modal-content">
                        <img
                            src={
                                product.image_path
                                    ? `http://localhost:9000/catalog-images/${product.image_path}`
                                    : placeholderImage
                            }
                            alt={product.name}
                            className="image-modal-fullscreen"
                        />
                        <button className="image-modal-close" onClick={toggleImageModal}>
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Сообщение о добавлении в корзину */}
            {showAddMessage && (
                <div className="add-to-cart-message">
                    Товар успешно добавлен в корзину!
                </div>
            )}
        </>
    );
};

export default ProductPage;