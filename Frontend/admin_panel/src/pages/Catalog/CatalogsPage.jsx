import "./CatalogsPage.css";
import { useEffect, useState } from "react";
import CatalogService from "../../services/CatalogService.js";
import { Link } from "react-router-dom";
import {
    ListBulletIcon,
    Squares2X2Icon,
    TrashIcon,
} from "@heroicons/react/24/outline";
import placeholderImage from "../../assets/not_found_picture.jpg";

const CatalogsPage = () => {
    const [catalogs, setCatalogs] = useState([]);
    const [viewMode, setViewMode] = useState("cards");
    const [selectedCatalogs, setSelectedCatalogs] = useState(new Set());

    useEffect(() => {
        CatalogService.getCatalogs()
            .then(setCatalogs)
            .catch(() => setCatalogs([]));
    }, []);

    const toggleSelectCatalog = (tag) => {
        setSelectedCatalogs((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(tag)) {
                newSet.delete(tag);
            } else {
                newSet.add(tag);
            }
            return newSet;
        });
    };

    const handleDeleteSelected = () => {
        setCatalogs(catalogs.filter((catalog) => !selectedCatalogs.has(catalog.tag)));
        setSelectedCatalogs(new Set());
    };

    const handleDeleteCatalog = (tag) => {
        setCatalogs(catalogs.filter((catalog) => catalog.tag !== tag));
        setSelectedCatalogs((prev) => {
            const newSet = new Set(prev);
            newSet.delete(tag);
            return newSet;
        });
    };

    return (
        <div className="catalogs-container">
            <div className="header fade-in">
                <h1 className="catalogs-title">Наши Каталоги</h1>
                <div className="view-toggle">
                    <button
                        className={`view-button ${viewMode === "cards" ? "active" : ""}`}
                        onClick={() => setViewMode("cards")}
                        title="Вид карточек"
                    >
                        <Squares2X2Icon className="view-icon" />
                    </button>
                    <button
                        className={`view-button ${viewMode === "list" ? "active" : ""}`}
                        onClick={() => setViewMode("list")}
                        title="Вид списка"
                    >
                        <ListBulletIcon className="view-icon" />
                    </button>
                </div>
            </div>
            <div className={`catalogs-grid ${viewMode}`}>
                {catalogs.map((catalog) => (
                    <div key={catalog.tag} className={`catalog-card ${viewMode} fade-in`}>
                        <Link to={`/catalog/${catalog.tag}`} className="catalog-link">
                            <img
                                src={
                                    catalog.image_path
                                        ? `http://localhost:9000/catalog-images/${catalog.image_path}`
                                        : placeholderImage
                                }
                                alt={catalog.name}
                                className="catalog-image"
                            />
                            <div className="catalog-card-content">
                                <h2 className="catalog-name">{catalog.name}</h2>
                                <p className="catalog-description">{catalog.description}</p>
                                <span className="catalog-tag">#{catalog.tag}</span>
                            </div>
                        </Link>
                        <input
                            type="checkbox"
                            checked={selectedCatalogs.has(catalog.tag)}
                            onChange={() => toggleSelectCatalog(catalog.tag)}
                            className="catalog-checkbox"
                        />
                        <div className="catalog-actions">
                            <Link to={`/catalog/edit/${catalog.tag}`} className="edit-button">
                                Редактировать
                            </Link>
                            <button
                                className="delete-button"
                                onClick={() => handleDeleteCatalog(catalog.tag)}
                            >
                                Удалить
                            </button>
                        </div>
                    </div>
                ))}
                <Link to="/catalog/new" className={`catalog-card create-card ${viewMode} fade-in`}>
                    <div className="create-card-content">
                        <span className="create-icon">+</span>
                        <h2 className="catalog-name">Создать новый каталог</h2>
                    </div>
                </Link>
            </div>
            {selectedCatalogs.size > 0 && (
                <div className="selected-actions fade-in">
                    <p>Выбрано каталогов: {selectedCatalogs.size}</p>
                    <button
                        className="delete-selected-button"
                        onClick={handleDeleteSelected}
                    >
                        <TrashIcon className="delete-icon" />
                        Удалить выбранных
                    </button>
                </div>
            )}
        </div>
    );
};

export default CatalogsPage;