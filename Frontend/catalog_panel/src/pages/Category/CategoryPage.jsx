import "./CategoryPage.css";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import CategoryService from "../../services/CategoryService.js";
import ProductService from "../../services/ProductService.js";
import placeholderImage from "../../assets/not_found_picture.jpg";

const CategoryPage = () => {
    const { catalog_tag, category_tag } = useParams();
    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [viewMode, setViewMode] = useState("grid");

    useEffect(() => {
        CategoryService.getCategoryByTag(catalog_tag, category_tag)
            .then((data) => {
                console.log("Полученные данные категории:", data);
                setCategory(data);
            })
            .catch((error) => {
                console.log("Ошибка при загрузке категории:", error);
                setCategory([]);
            });
    }, [catalog_tag, category_tag]);

    useEffect(() => {
        ProductService.getProducts(catalog_tag, category_tag)
            .then((data) => {
                console.log("Полученные данные продуктов:", data);
                setProducts(data);
            })
            .catch((error) => {
                console.log("Ошибка при загрузке продуктов:", error);
                setProducts([]);
            });
    }, [catalog_tag, category_tag]);

    if (!category) return <div className="category-loading">Загрузка категории...</div>;

    console.log("Image path для категории:", category.image_path);

    return (
        <div className="catalog-page" key={category_tag}>
            <div className="category-container fade-in">
                <img
                    src={
                        category.image_path
                            ? `http://localhost:9000/catalog-images/${category.image_path}`
                            : placeholderImage
                    }
                    alt={category.name}
                    className="category-image"
                />
                <div className="category-text">
                    <h1 className="category-title">{category.name}</h1>
                    <p className="category-description">{category.description}</p>
                </div>
            </div>

            <div className="content-wrapper">
                <div className="filter-card fade-in">
                    {/* Карточка фильтрации будет прилипать под navbar */}
                    <h3 className="filter-title">Фильтры</h3>
                    <div className="filter-section price-section">
                        <label>Цена</label>
                        <input
                            type="number"
                            placeholder="Мин. цена"
                            className="price-input"
                            min="0"
                            step="100"
                        />
                        <input
                            type="number"
                            placeholder="Макс. цена"
                            className="price-input"
                            min="0"
                            step="100"
                        />
                    </div>
                    <div className="filter-section">
                        <label>Условия</label>
                        <label>
                            <input type="checkbox" /> Наличие фото
                        </label>
                        <label>
                            <input type="checkbox" /> Наличие описания
                        </label>
                    </div>
                    <button className="apply-filter-button">Применить</button>
                </div>

                <div className="products-section">
                    <div className="view-controls fade-in">
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

                    <div className={`product-container ${viewMode === "grid" ? "product-grid" : "product-list"} fade-in`}>
                        {products.map((product, index) => (
                            <Link
                                to={`/catalog/${catalog_tag}/${category_tag}/${product.tag}`}
                                key={product.tag}
                                className={`product-card fade-in ${viewMode === "list" ? "list-view" : ""}`}
                                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                            >
                                <img
                                    src={
                                        product.image_path
                                            ? `http://localhost:9000/catalog-images/${product.image_path}`
                                            : placeholderImage
                                    }
                                    alt={product.name}
                                    className="product-image"
                                />
                                <div className="product-content">
                                    <div className="product-info">
                                        <h2 className="product-name">{product.name}</h2>
                                        <p className="product-description">{product.description}</p>
                                        <span className="product-tag">#{product.tag}</span>
                                    </div>
                                    <div className="product-footer">
                                        <p className="product-price">
                                            {product.price !== null ? `${product.price} руб.` : "Цена не указана"}
                                        </p>
                                        <button className="add-to-cart-button">В корзину</button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;