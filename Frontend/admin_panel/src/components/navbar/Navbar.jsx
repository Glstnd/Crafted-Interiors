import { NavLink } from "react-router-dom";
import {
    HomeIcon,
    ShoppingBagIcon,
    UserIcon,
    ClipboardDocumentListIcon, // Иконка для "Заказы"
    ShieldCheckIcon, // Иконка для "Администраторы"
} from '@heroicons/react/24/outline';
import logo from "../../assets/logo.png";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { verifyAdminToken } from '../../store/authSlice'; // Предполагается, что это правильный импорт
import "./Navbar.css";
import CatalogService from "../../services/CatalogService.js";

const Navbar = () => {
    const [catalogs, setCatalogs] = useState([]);
    const dispatch = useDispatch();
    const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated || false);

    useEffect(() => {
        dispatch(verifyAdminToken());
    }, [dispatch]);

    useEffect(() => {
        CatalogService.getCatalogs()
            .then(setCatalogs)
            .catch(() => setCatalogs([]));
    }, []);

    // Функция для предотвращения клика, если не авторизован
    const handleRestrictedClick = (e) => {
        if (!isAuthenticated) {
            e.preventDefault();
        }
    };

    return (
        <nav className="navbar">
            {/* Левая часть: логотип + ссылки */}
            <div className="navbar-left">
                <NavLink to="/" className="navbar-logo">
                    <img src={logo} alt="Crafted Interiors" />
                </NavLink>

                <div className="navbar-left-links">
                    <div
                        className={`navbar-link dropdown ${!isAuthenticated ? 'disabled' : ''}`}
                    >
                        <NavLink
                            to="/catalog"
                            className="navbar-link-inner"
                            onClick={handleRestrictedClick}
                        >
                            <HomeIcon className="navbar-icon" />
                            <span>Каталоги</span>
                        </NavLink>

                        <div className="dropdown-content">
                            {catalogs.map((catalog) => (
                                <NavLink
                                    key={catalog.tag}
                                    to={`/catalog/${catalog.tag}`}
                                    className="dropdown-item"
                                    onClick={handleRestrictedClick}
                                >
                                    {catalog.name}
                                </NavLink>
                            ))}
                        </div>
                    </div>

                    <NavLink
                        to="/stores"
                        className={`navbar-link ${!isAuthenticated ? 'disabled' : ''}`}
                        onClick={handleRestrictedClick}
                    >
                        <ShoppingBagIcon className="navbar-icon" />
                        Магазины
                    </NavLink>
                </div>
            </div>

            {/* Правая часть: заказы + администраторы + кнопка входа/профиля */}
            <div className="navbar-right">
                <NavLink
                    to="/orders"
                    className={`navbar-link ${!isAuthenticated ? 'disabled' : ''}`}
                    onClick={handleRestrictedClick}
                >
                    <ClipboardDocumentListIcon className="navbar-icon" />
                    Заказы
                </NavLink>

                <NavLink
                    to="/admins"
                    className={`navbar-link ${!isAuthenticated ? 'disabled' : ''}`}
                    onClick={handleRestrictedClick}
                >
                    <ShieldCheckIcon className="navbar-icon" />
                    Администраторы
                </NavLink>

                <NavLink
                    to={isAuthenticated ? "/profile" : "/login"}
                    className="navbar-button"
                >
                    {isAuthenticated ? (
                        <>
                            <UserIcon className="navbar-icon" />
                            Профиль
                        </>
                    ) : (
                        "Войти"
                    )}
                </NavLink>
            </div>
        </nav>
    );
};

export default Navbar;