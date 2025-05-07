import "./CategoryPage.css";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import CategoryService from "../../services/CategoryService.js";
import ProductService from "../../services/ProductService.js";
import placeholderImage from "../../assets/not_found_picture.jpg";

const CategoryPage = () => {
    const { catalog_tag, category_tag } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [viewMode, setViewMode] = useState("list");
    const [resetMessage, setResetMessage] = useState(false);

    const [filters, setFilters] = useState({
        minPrice: "",
        maxPrice: "",
        hasPhoto: false,
        hasDescription: false,
    });

    const [sort, setSort] = useState({
        field: null,
        direction: null,
    });

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        setFilters({
            minPrice: searchParams.get("min_price") || "",
            maxPrice: searchParams.get("max_price") || "",
            hasPhoto: searchParams.get("has_photo") === "true",
            hasDescription: searchParams.get("has_description") === "true",
        });
        setSort({
            field: searchParams.get("sort_field") || null,
            direction: searchParams.get("sort_direction") || null,
        });
    }, [location.search]);

    useEffect(() => {
        CategoryService.getCategoryByTag(catalog_tag, category_tag)
            .then(setCategory)
            .catch((error) => {
                console.log("Ошибка при загрузке категории:", error);
                setCategory(null);
            });
    }, [catalog_tag, category_tag]);

    useEffect(() => {
        const params = new URLSearchParams();

        if (filters.minPrice) params.set("min_price", filters.minPrice);
        if (filters.maxPrice) params.set("max_price", filters.maxPrice);
        if (filters.hasPhoto) params.set("has_photo", "true");
        if (filters.hasDescription) params.set("has_description", "true");

        if (sort.field) params.set("sort_field", sort.field);
        if (sort.direction) params.set("sort_direction", sort.direction);

        navigate(`${location.pathname}?${params.toString()}`, { replace: true });

        ProductService.getProducts(catalog_tag, category_tag, Object.fromEntries(params))
            .then(setProducts)
            .catch((error) => {
                console.log("Ошибка при загрузке продуктов:", error);
                setProducts([]);
            });
    }, [catalog_tag, category_tag, filters, sort, navigate, location.pathname]);

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSort = (field, direction) => {
        setSort({ field, direction });
    };

    const handleReset = () => {
        setFilters({
            minPrice: "",
            maxPrice: "",
            hasPhoto: false,
            hasDescription: false,
        });
        setSort({
            field: null,
            direction: null,
        });
        navigate(`${location.pathname}`, { replace: true });

        setResetMessage(true);
        setTimeout(() => {
            setResetMessage(false);
        }, 5000);
    };

    const handleDelete = (productTag) => {
        if (window.confirm("Вы уверены, что хотите удалить этот продукт?")) {
            ProductService.deleteProduct(catalog_tag, category_tag, productTag)
                .then(() => {
                    setProducts(products.filter((product) => product.tag !== productTag));
                })
                .catch((error) => {
                    console.log("Ошибка при удалении продукта:", error);
                });
        }
    };

    if (!category) return <div className="category-loading">Загрузка категории...</div>;

    return (
        <div className="catalog-page category-page-scope" key={category_tag}>
            {resetMessage && (
                <div className="reset-message">
                    Настройки фильтрации и сортировки сброшены
                </div>
            )}
            <div className="category-container fade-in">
                <img
                    src={
                        category.image_path
                            ? `${import.meta.env.VITE_MINIO_URL}/${category.image_path}`
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
                    <h3 className="filter-title">Фильтры</h3>
                    <p className="filter-count">Найдено: {products.length} записей</p>
                    <div className="filter-section price-section">
                        <label>Цена</label>
                        <input
                            type="number"
                            name="minPrice"
                            placeholder="Мин. цена"
                            className="price-input"
                            min="0"
                            step="100"
                            value={filters.minPrice}
                            onChange={handleFilterChange}
                        />
                        <input
                            type="number"
                            name="maxPrice"
                            placeholder="Макс. цена"
                            className="price-input"
                            min="0"
                            step="100"
                            value={filters.maxPrice}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <div className="filter-section">
                        <label>
                            <input
                                type="checkbox"
                                name="hasPhoto"
                                checked={filters.hasPhoto}
                                onChange={handleFilterChange}
                            /> Наличие фото
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                name="hasDescription"
                                checked={filters.hasDescription}
                                onChange={handleFilterChange}
                            /> Наличие описания
                        </label>
                    </div>
                    <button className="reset-filter-button" onClick={handleReset}>
                        Сбросить
                    </button>
                </div>

                <div className="products-section">
                    <div className="sort-card fade-in">
                        <span className="sort-title">Сортировка:</span>
                        <span className="sort-label">Название</span>
                        <button
                            className="sort-button"
                            onClick={() => handleSort("name", "asc")}
                        >
                            По возрастанию ↑
                        </button>
                        <button
                            className="sort-button"
                            onClick={() => handleSort("name", "desc")}
                        >
                            По убыванию ↓
                        </button>
                        <span className="sort-label">Цена</span>
                        <button
                            className="sort-button"
                            onClick={() => handleSort("price", "asc")}
                        >
                            По возрастанию ↑
                        </button>
                        <button
                            className="sort-button"
                            onClick={() => handleSort("price", "desc")}
                        >
                            По убыванию ↓
                        </button>
                    </div>

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
                            <div
                                key={product.tag}
                                className={`product-card fade-in ${viewMode === "list" ? "list-view" : ""}`}
                                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                            >
                                <Link
                                    to={`/catalog/${catalog_tag}/${category_tag}/${product.tag}`}
                                    className="product-link"
                                >
                                    <img
                                        src={
                                            product.image_path
                                                ? `${import.meta.env.VITE_MINIO_URL}/${product.image_path}`
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
                                        </div>
                                    </div>
                                </Link>
                                <div className="product-actions">
                                    <Link
                                        to={`/catalog/${catalog_tag}/${category_tag}/product/edit/${product.tag}`}
                                        className="edit-button"
                                    >
                                        Редактировать
                                    </Link>
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDelete(product.tag)}
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </div>
                        ))}
                        <Link
                            to={`/catalog/${catalog_tag}/${category_tag}/product/new`}
                            className={`product-card create-card fade-in ${viewMode === "list" ? "list-view" : ""}`}
                            style={{ animationDelay: `${(products.length + 1) * 0.1}s` }}
                        >
                            <div className="create-card-content">
                                <span className="create-icon">+</span>
                                <h2 className="product-name">Создать новый продукт</h2>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;