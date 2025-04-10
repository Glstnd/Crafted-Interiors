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
import "./Navbar.css";
import CatalogService from "../../services/CatalogService.js";

const Navbar = () => {
    const [catalogs, setCatalogs] = useState([]);
    const isAuthenticated = false;

    useEffect(() => {
        CatalogService.getCatalogs()
            .then(setCatalogs)
            .catch(() => setCatalogs([]));
    }, []);

    return (
        <nav className="navbar">
            {/* Левая часть: логотип + ссылки */}
            <div className="navbar-left">
                <NavLink to="/" className="navbar-logo">
                    <img src={logo} alt="Crafted Interiors" />
                </NavLink>

                <div className="navbar-left-links">
                    <div className="navbar-link dropdown">
                        <NavLink to="/catalog">
                            <HomeIcon className="navbar-icon" />
                            <span>Каталоги</span>
                        </NavLink>

                        <div className="dropdown-content">
                            {catalogs.map((catalog) => (
                                <NavLink
                                    key={catalog.tag}
                                    to={`/catalog/${catalog.tag}`}
                                    className="dropdown-item"
                                >
                                    {catalog.name}
                                </NavLink>
                            ))}
                        </div>
                    </div>

                    <NavLink to="/stores" className="navbar-link">
                        <ShoppingBagIcon className="navbar-icon" />
                        Магазины
                    </NavLink>
                </div>
            </div>

            {/* Правая часть: заказы + администраторы + кнопка входа/профиля */}
            <div className="navbar-right">
                <NavLink to="/orders" className="navbar-link">
                    <ClipboardDocumentListIcon className="navbar-icon" />
                    Заказы
                </NavLink>

                <NavLink to="/admins" className="navbar-link">
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