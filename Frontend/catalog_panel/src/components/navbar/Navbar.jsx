import { Link } from "react-router-dom";
import { ShoppingCartIcon, HomeIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'; // Исправили импорт
import logo from "../../assets/logo.png";
import { useState } from "react";
import "./Navbar.css";

const Navbar = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    return (
        <nav className="navbar">
            {/* Левая часть: логотип + ссылки */}
            <div className="navbar-left">
                <div className="navbar-logo">
                    <img src={logo} alt="Crafted Interiors" />
                </div>

                <div className="navbar-left-links">
                    <Link to="/catalog" className="navbar-link">
                        <HomeIcon className="navbar-icon" />
                        Каталог
                    </Link>
                    <Link to="/stores" className="navbar-link">
                        <ShoppingBagIcon className="navbar-icon" />
                        Магазины
                    </Link>
                </div>
            </div>

            {/* Правая часть: корзина + кнопка */}
            <div className="navbar-right">
                <Link to="/cart" className="navbar-link">
                    <ShoppingCartIcon className="navbar-icon" />
                    Корзина
                </Link>
                <Link to={isAuthenticated ? "/profile" : "/login"} className="navbar-button">
                    {isAuthenticated ? "Профиль" : "Войти"}
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;
