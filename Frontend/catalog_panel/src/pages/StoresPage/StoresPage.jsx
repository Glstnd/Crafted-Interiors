import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import StoreService from '../../services/StoreService';
import './StoresPage.css';

const StoresPage = () => {
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markers = useRef(new Map()); // Храним маркеры по ID магазина

    // Инициализация карты
    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        console.log('Инициализация карты...');
        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://api.maptiler.com/maps/streets/style.json?key=E4sx9Q4Gzt4dZXM7XIjR ', // Замените на ваш ключ
            center: [37.618423, 55.751244], // Москва как пример
            zoom: 10,
        });

        map.current.on('load', () => {
            console.log('Карта загружена');
        });

        map.current.on('error', (e) => {
            console.error('Ошибка загрузки карты:', e);
        });

        return () => {
            if (map.current) {
                console.log('Очистка карты');
                map.current.remove();
            }
        };
    }, []);

    // Загрузка магазинов и добавление маркеров
    useEffect(() => {
        const fetchStores = async () => {
            try {
                const data = await StoreService.getStores();
                console.log('Данные магазинов:', data);
                setStores(data);

                if (data.length > 0 && map.current) {
                    const firstStore = data[0];
                    map.current.setCenter([firstStore.longitude, firstStore.latitude]);

                    if (map.current.isStyleLoaded()) {
                        addMarkers(data);
                    } else {
                        map.current.on('load', () => {
                            addMarkers(data);
                        });
                    }
                }
            } catch (error) {
                console.error('Ошибка при загрузке магазинов:', error);
                setStores([]);
            }
        };

        const addMarkers = (storesData) => {
            console.log('Добавление маркеров для:', storesData);
            // Очищаем существующие маркеры
            markers.current.forEach((marker) => marker.remove());
            markers.current.clear();

            storesData.forEach((store) => {
                const marker = new maplibregl.Marker({
                    color: selectedStore && selectedStore.id === store.id ? '#ff4444' : '#007bff',
                })
                    .setLngLat([store.longitude, store.latitude])
                    .addTo(map.current);

                marker.getElement().dataset.storeId = store.id;
                marker.getElement().addEventListener('click', () => handleStoreClick(store));
                markers.current.set(store.id, marker); // Сохраняем маркер по ID магазина
            });
        };

        fetchStores();
    }, []); // Маркеры создаются один раз

    // Обновление выбранного магазина
    useEffect(() => {
        if (!map.current) return;

        if (selectedStore) {
            // Центрируем карту на выбранном магазине
            map.current.setCenter([selectedStore.longitude, selectedStore.latitude]);
            map.current.setZoom(14);

            // Показываем только маркер выбранного магазина
            markers.current.forEach((marker, storeId) => {
                const isSelected = storeId === selectedStore.id;
                marker.getElement().style.display = isSelected ? 'block' : 'none'; // Скрываем остальные
                marker.getElement().style.color = isSelected ? '#ff4444' : '#007bff'; // Цвет только для выбранного
            });
        } else {
            // Показываем все маркеры, если ничего не выбрано
            map.current.setZoom(10); // Возвращаем масштаб
            markers.current.forEach((marker) => {
                marker.getElement().style.display = 'block';
                marker.getElement().style.color = '#007bff';
            });
        }
    }, [selectedStore]);

    // Обработчик клика по магазину
    const handleStoreClick = (store) => {
        setSelectedStore(store);
    };

    return (
        <div className="stores-page">
            {/* Информация о магазинах */}
            <div className="stores-list fade-in">
                <h1 className="stores-title">Магазины</h1>
                <div className="store-grid">
                    {stores.map((store, index) => (
                        <div
                            key={store.id}
                            className={`store-card fade-in ${selectedStore && selectedStore.id === store.id ? 'selected' : ''}`}
                            style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                            onClick={() => handleStoreClick(store)}
                        >
                            <div className="store-content">
                                <h2 className="store-name">{store.name}</h2>
                                <p className="store-address">{store.address}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Карта */}
            <div className="stores-map fade-in">
                <div ref={mapContainer} className="map-container" />
            </div>
        </div>
    );
};

export default StoresPage;