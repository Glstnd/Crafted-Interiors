import { Link } from "react-router-dom";
import {
    ShoppingBagIcon,
    ClipboardDocumentListIcon,
    ShieldCheckIcon,
    TableCellsIcon,
} from "@heroicons/react/24/outline";
import { useSelector } from 'react-redux'; // Добавляем useSelector для проверки авторизации
import "./MainPage.css";

const MainPage = () => {
    const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated || false); // Получаем статус авторизации

    // Функция для предотвращения клика, если не авторизован
    const handleRestrictedClick = (e) => {
        if (!isAuthenticated) {
            e.preventDefault();
        }
    };

    return (
        <div className="main-page">
            <div className="hero-section fade-in">
                <h1 className="hero-title">Добро пожаловать в Crafted Interiors</h1>
                <p className="hero-subtitle">
                    Ваш надежный помощник в управлении мебельным бизнесом
                </p>
            </div>

            <div className="features-section">
                <h2 className="features-title fade-in">Основные возможности</h2>
                <div className="features-grid">
                    <div className="feature-card fade-in">
                        <TableCellsIcon className="feature-icon" />
                        <h3 className="feature-title">Управление каталогами</h3>
                        <p className="feature-description">
                            Просматривайте и редактируйте каталоги товаров, категории и саму мебель с удобным интерфейсом.
                        </p>
                        <Link
                            to="/catalog"
                            className={`feature-link ${!isAuthenticated ? 'disabled' : ''}`}
                            onClick={handleRestrictedClick}
                        >
                            Перейти к каталогам
                        </Link>
                    </div>

                    <div className="feature-card fade-in" style={{ animationDelay: "0.1s" }}>
                        <ShoppingBagIcon className="feature-icon" />
                        <h3 className="feature-title">Магазины</h3>
                        <p className="feature-description">
                            Добавляйте, удаляйте и редактируйте информацию о магазинах и их адресах на карте.
                        </p>
                        <Link
                            to="/stores"
                            className={`feature-link ${!isAuthenticated ? 'disabled' : ''}`}
                            onClick={handleRestrictedClick}
                        >
                            Перейти к магазинам
                        </Link>
                    </div>

                    <div className="feature-card fade-in" style={{ animationDelay: "0.2s" }}>
                        <ClipboardDocumentListIcon className="feature-icon" />
                        <h3 className="feature-title">Обработка заказов</h3>
                        <p className="feature-description">
                            Просматривайте оформленные заказы для их дальнейшей обработки и управления.
                        </p>
                        <Link
                            to="/orders"
                            className={`feature-link ${!isAuthenticated ? 'disabled' : ''}`}
                            onClick={handleRestrictedClick}
                        >
                            Перейти к заказам
                        </Link>
                    </div>

                    <div className="feature-card fade-in" style={{ animationDelay: "0.3s" }}>
                        <ShieldCheckIcon className="feature-icon" />
                        <h3 className="feature-title">Администраторы</h3>
                        <p className="feature-description">
                            Управляйте списком администраторов: добавляйте новых и удаляйте существующих.
                        </p>
                        <Link
                            to="/admins"
                            className={`feature-link ${!isAuthenticated ? 'disabled' : ''}`}
                            onClick={handleRestrictedClick}
                        >
                            Перейти к администраторам
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainPage;