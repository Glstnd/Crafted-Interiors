import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    ShoppingBagIcon,
    ListBulletIcon,
    Squares2X2Icon,
    TrashIcon,
} from "@heroicons/react/24/outline";
import storeService from "../../services/StoreService"; // Путь к вашему сервису
import "./StoresPage.css";

const StoresPage = () => {
    const [stores, setStores] = useState([]);
    const [viewMode, setViewMode] = useState("cards"); // "cards" или "list"
    const [selectedStores, setSelectedStores] = useState(new Set()); // Set для хранения ID выбранных магазинов
    const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated || false); // Проверка авторизации

    // Защита: перенаправление на /login, если не авторизован
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const data = await storeService.getStores();
                setStores(data);
            } catch (error) {
                console.error("Ошибка загрузки магазинов:", error);
            }
        };
        fetchStores();
    }, []);

    const toggleSelectStore = (id) => {
        setSelectedStores((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleDeleteSelected = () => {
        // Здесь можно добавить логику удаления через API
        console.log("Удалить магазины:", Array.from(selectedStores));
        setStores(stores.filter((store) => !selectedStores.has(store.id)));
        setSelectedStores(new Set());
    };

    return (
        <div className="stores-page">
            <div className="header fade-in">
                <h1 className="header-title">Список магазинов</h1>
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

            <div className={`stores-container ${viewMode}`}>
                {stores.map((store) => (
                    <div
                        key={store.id}
                        className={`store-item ${viewMode} fade-in`}
                    >
                        <input
                            type="checkbox"
                            checked={selectedStores.has(store.id)}
                            onChange={() => toggleSelectStore(store.id)}
                            className="store-checkbox"
                        />
                        <Link
                            to={`/stores/${store.id}`}
                            className="store-link"
                        >
                            <ShoppingBagIcon className="store-icon" />
                            <div className="store-details">
                                <h3 className="store-name">{store.name}</h3>
                                <p className="store-address">{store.address}</p>
                                <p className="store-coordinates">
                                    Широта: {store.latitude}, Долгота: {store.longitude}
                                </p>
                                <p className="store-id">ID: {store.id}</p>
                            </div>
                        </Link>
                    </div>
                ))}
                {/* Карточка для добавления нового магазина */}
                <div className={`store-item ${viewMode} add-store fade-in`}>
                    <Link to="/stores/new" className="store-link">
                        <ShoppingBagIcon className="store-icon" />
                        <div className="store-details">
                            <h3 className="store-name">Добавить магазин</h3>
                        </div>
                    </Link>
                </div>
            </div>

            {selectedStores.size > 0 && (
                <div className="selected-actions fade-in">
                    <p>Выбрано магазинов: {selectedStores.size}</p>
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

export default StoresPage;