import { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import StoreService from "../../../services/StoreService";
import "./StorePage.css";

const StorePage = () => {
    const { id } = useParams(); // Получаем id из URL
    const navigate = useNavigate();
    const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated || false);

    const [store, setStore] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        latitude: "",
        longitude: "",
    });
    const [changedFields, setChangedFields] = useState(new Set()); // Отслеживаем измененные поля

    // Защита: перенаправление на /login, если не авторизован
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    useEffect(() => {
        const fetchStore = async () => {
            try {
                console.error("Ошибка загрузки магазина:", id);
                const data = await StoreService.getStore(id);
                setStore(data);
                setFormData({
                    name: data.name,
                    address: data.address,
                    latitude: data.latitude.toString(), // Преобразуем в строку для инпута
                    longitude: data.longitude.toString(),
                });
            } catch (error) {
                console.error("Ошибка загрузки магазина:", error);
            }
        };
        fetchStore();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Проверяем, изменилось ли поле относительно исходных данных
        if (store && value !== store[name].toString()) {
            setChangedFields((prev) => new Set(prev).add(name));
        } else {
            setChangedFields((prev) => {
                const newSet = new Set(prev);
                newSet.delete(name);
                return newSet;
            });
        }
    };

    const handleSave = async () => {
        try {
            const updatedData = {
                name: formData.name,
                address: formData.address,
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
            };
            await StoreService.updateStore(id, updatedData);
            setStore(updatedData); // Обновляем исходные данные
            setChangedFields(new Set()); // Сбрасываем индикаторы изменений
            alert("Магазин успешно сохранен!");
        } catch (error) {
            console.error("Ошибка сохранения:", error);
            alert("Ошибка при сохранении магазина");
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Вы уверены, что хотите удалить этот магазин?")) {
            try {
                await StoreService.deleteStore(id);
                navigate("/stores"); // Перенаправляем на список магазинов после удаления
            } catch (error) {
                console.error("Ошибка удаления:", error);
                alert("Ошибка при удалении магазина");
            }
        }
    };

    if (!store) {
        return <div className="store-page">Загрузка...</div>;
    }

    return (
        <div className="store-page fade-in">
            <h1 className="store-title">
                <ShoppingBagIcon className="store-title-icon" />
                Редактирование магазина (ID: {id})
            </h1>

            <div className="store-form">
                <div className="form-group">
                    <label htmlFor="name">Название</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                    {changedFields.has("name") && <span className="changed-label">Изменен</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="address">Адрес</label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                    />
                    {changedFields.has("address") && <span className="changed-label">Изменен</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="latitude">Широта</label>
                    <input
                        type="number"
                        id="latitude"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleChange}
                        step="any" // Позволяет вводить дробные числа
                    />
                    {changedFields.has("latitude") && <span className="changed-label">Изменен</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="longitude">Долгота</label>
                    <input
                        type="number"
                        id="longitude"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleChange}
                        step="any"
                    />
                    {changedFields.has("longitude") && <span className="changed-label">Изменен</span>}
                </div>

                <div className="form-actions">
                    <button className="save-button" onClick={handleSave}>
                        Сохранить
                    </button>
                    <button className="delete-button" onClick={handleDelete}>
                        Удалить
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StorePage;