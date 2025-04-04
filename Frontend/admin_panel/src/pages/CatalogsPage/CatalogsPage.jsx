import "./CatalogsPage.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import catalogServiceInstance from "../../services/CatalogService.js";

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.2, when: "beforeChildren" }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

const CatalogsPage = () => {
    const [catalogs, setCatalogs] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        catalogServiceInstance.getCatalogs()
            .then(jsonResponse => setCatalogs(jsonResponse))
            .catch(error => console.log(error));
    }, []);

    const handleDelete = (tag) => {
        setCatalogs((prevCatalogs) => prevCatalogs.filter(catalog => catalog.tag !== tag));
    };

    const handleNavigate = (catalogTag) => {
        navigate(`/catalog/${catalogTag}`);  // Переход на страницу каталога по tag
    };

    return (
        <div className="catalogs-page">
            <h1>Catalogs</h1>
            <motion.div
                className="catalogs-list"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                <AnimatePresence>
                    {catalogs.length > 0 ? (
                        catalogs.map((catalog) => (
                            <motion.div
                                key={catalog.id || catalog.tag}
                                className="catalog-card"
                                variants={itemVariants}
                                exit="exit"
                                onClick={() => handleNavigate(catalog.tag)} // Обработчик клика для перехода
                                whileHover={{ scale: 1.05 }} // Увеличение карточки при наведении
                                whileTap={{ scale: 0.98 }} // Сжатие карточки при клике
                            >
                                <h3>{catalog.name}</h3>
                                <p>{catalog.description}</p>
                                <div className="catalog-actions">
                                    <button className="edit-button">Редактировать</button>
                                    <button
                                        className="delete-button"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Останавливаем событие клика на родительском элементе
                                            handleDelete(catalog.tag);
                                        }}
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <p>No catalogs found.</p>
                    )}
                </AnimatePresence>
            </motion.div>
            <motion.div
                className="add-catalog-card"
                onClick={() => navigate("/add-catalog")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
            >
                <p>+ Добавить каталог</p>
            </motion.div>
        </div>
    );
};

export default CatalogsPage;
