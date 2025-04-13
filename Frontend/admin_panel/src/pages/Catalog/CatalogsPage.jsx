import "./CatalogsPage.css";
import { useEffect, useState } from "react";
import CatalogService from "../../services/CatalogService.js";
import { Link } from "react-router-dom";
import placeholderImage from "../../assets/not_found_picture.jpg";

const CatalogsPage = () => {
    const [catalogs, setCatalogs] = useState([]);

    useEffect(() => {
        CatalogService.getCatalogs()
            .then(setCatalogs)
            .catch(() => setCatalogs([]));
    }, []);

    return (
        <div className="catalogs-container">
            <h1 className="catalogs-title">Наши Каталоги</h1>
            <div className="catalogs-grid">
                {catalogs.map((catalog) => (
                    <div key={catalog.tag} className="catalog-card">
                        <Link to={`/catalog/${catalog.tag}`} className="catalog-link">
                            <img
                                src={catalog.image_path
                                    ? `http://localhost:9000/catalog-images/${catalog.image_path}`
                                    : placeholderImage}
                                alt={catalog.name}
                                className="catalog-image"
                            />
                            <div className="catalog-card-content">
                                <h2 className="catalog-name">{catalog.name}</h2>
                                <p className="catalog-description">{catalog.description}</p>
                                <span className="catalog-tag">#{catalog.tag}</span>
                            </div>
                        </Link>
                        <Link to={`/catalog/edit/${catalog.tag}`} className="edit-button">
                            Редактировать
                        </Link>
                    </div>
                ))}
                <Link to="/catalog/new" className="catalog-card create-card">
                    <div className="create-card-content">
                        <span className="create-icon">+</span>
                        <h2 className="catalog-name">Создать новый каталог</h2>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default CatalogsPage;