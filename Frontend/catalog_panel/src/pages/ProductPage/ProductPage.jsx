import "./ProductPage.css";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductService from "../../services/ProductService.js";
import placeholderImage from "../../assets/not_found_picture.jpg";

const ProductPage = () => {
    const { catalog_tag, category_tag, product_tag } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    // Загрузка данных о товаре
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

    // Обработчик кнопки "В корзину" (заглушка)
    const handleAddToCart = () => {
        console.log(`Товар ${product.name} добавлен в корзину`);
        // Здесь можно добавить реальную логику добавления в корзину
    };

    if (loading) {
        return <div className="product-loading">Загрузка товара...</div>;
    }

    if (!product) {
        return <div className="product-not-found">Товар не найден</div>;
    }

    return (
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
    );
};

export default ProductPage;