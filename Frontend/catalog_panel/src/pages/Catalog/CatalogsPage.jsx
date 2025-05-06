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
                    <Link to={`/catalog/${catalog.tag}`} key={catalog.tag} className="catalog-card">
                        <img
                            src={catalog.image_path
                                ? `${import.meta.env.VITE_MINIO_URL}/${catalog.image_path}`
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
                ))}
            </div>
        </div>
    );
};

export default CatalogsPage;