import "./CatalogPage.css";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import CatalogService from "../../services/CatalogService.js";
import CategoryService from "../../services/CategoryService.js";
import placeholderImage from "../../assets/not_found_picture.jpg";
import { Link } from "react-router-dom";

const CatalogPage = () => {
    const { catalog_tag } = useParams();

    const [catalog, setCatalog] = useState(null);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        CatalogService.getCatalogByTag(catalog_tag)
            .then(setCatalog)
            .catch(() => setCatalog(null));
    }, [catalog_tag]);

    useEffect(() => {
        CategoryService.getCategories(catalog_tag)
            .then(setCategories)
            .catch(() => setCategories([]));
    }, [catalog_tag]);

    if (!catalog) return <div className="catalog-loading">Загрузка каталога...</div>;

    return (
        <div className="catalog-page" key={catalog_tag}>
            <div className="catalog-info fade-in">
                <img
                    src={
                        catalog.image_path
                            ? `http://localhost:9000/catalog-images/${catalog.image_path}`
                            : placeholderImage
                    }
                    alt={catalog.name}
                    className="catalog-cover"
                />
                <div className="catalog-text">
                    <h1 className="catalog-title">{catalog.name}</h1>
                    <p className="catalog-description">{catalog.description}</p>
                </div>
            </div>

            <div className="category-grid fade-in">
                {categories.map((category, index) => (
                    <div key={category.tag} className={`category-card fade-in`} style={{ animationDelay: `${(index + 1) * 0.1}s` }}>
                        <Link to={`/catalog/${catalog.tag}/${category.tag}`} className="category-link">
                            <img
                                src={
                                    category.image_path
                                        ? `http://localhost:9000/catalog-images/${category.image_path}`
                                        : placeholderImage
                                }
                                alt={category.name}
                                className="category-image"
                            />
                            <div className="category-content">
                                <h2 className="category-name">{category.name}</h2>
                                <p className="category-description">{category.description}</p>
                                <span className="category-tag">#{category.tag}</span>
                            </div>
                        </Link>
                        <Link to={`/catalog/${catalog.tag}/category/edit/${category.tag}`} className="edit-button">
                            Редактировать
                        </Link>
                    </div>
                ))}
                <Link to={`/catalog/${catalog.tag}/category/new`} className="category-card create-card">
                    <div className="create-card-content">
                        <span className="create-icon">+</span>
                        <h2 className="category-name">Создать новую категорию</h2>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default CatalogPage;