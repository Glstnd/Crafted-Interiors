import LogoPicture from '../../assets/logo.png';
import { NavLink } from "react-router-dom";
import './Header.css';
import AdminService from "../../services/AdminService.js";
import CatalogService from "../../services/CatalogService.js";
import { useEffect, useState, useRef } from "react";

const Header = () => {
    const [admin, setAdmin] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [catalogs, setCatalogs] = useState([]);
    const [catalogMenuOpen, setCatalogMenuOpen] = useState(false);
    const [showCatalogMenu, setShowCatalogMenu] = useState(false); // Для анимации скрытия
    const menuRef = useRef(null);
    const catalogMenuRef = useRef(null);
    let hideTimeout = useRef(null);

    useEffect(() => {
        AdminService.getAuthAdmin()
            .then(setAdmin)
            .catch(() => setAdmin(null));
    }, []);

    useEffect(() => {
        CatalogService.getCatalogs()
            .then(setCatalogs)
            .catch(() => setCatalogs([]));
    }, []);

    const handleLogout = () => {
        window.location.reload();
    };

    // Обработчик для показа меню
    const handleMouseEnter = () => {
        if (hideTimeout.current) clearTimeout(hideTimeout.current);
        setShowCatalogMenu(true);
        setCatalogMenuOpen(true);
    };

    // Обработчик для скрытия меню с задержкой
    const handleMouseLeave = () => {
        hideTimeout.current = setTimeout(() => {
            setCatalogMenuOpen(false);
        }, 200); // Задержка, чтобы анимация завершилась
        setShowCatalogMenu(false);
    };

    // Закрытие меню при клике вне его области
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
            if (catalogMenuRef.current && !catalogMenuRef.current.contains(event.target)) {
                setCatalogMenuOpen(false);
                setShowCatalogMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="navbar">
            <div className="logo-container">
                <NavLink to="/">
                    <img src={LogoPicture} alt="logo" className="logo" />
                </NavLink>
            </div>
            <div className="nav-links">
                <div
                    className="nav-item"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    ref={catalogMenuRef}
                >
                    <NavLink to="/catalogs">Catalogs</NavLink>
                    <div className={`dropdown-catalogs ${showCatalogMenu ? "fade-in" : "fade-out"}`} style={{ display: catalogMenuOpen ? "block" : "none" }}>
                        {catalogs.length > 0 ? (
                            catalogs.map((catalog) => (
                                <NavLink key={catalog.id} to={`/catalogs/${catalog.id}`}>
                                    {catalog.name}
                                </NavLink>
                            ))
                        ) : (
                            <div className="dropdown-item">No catalogs</div>
                        )}
                    </div>
                </div>
                <NavLink to="/admins">Admins</NavLink>
            </div>
            {admin ? (
                <div className="nav-auth" ref={menuRef}>
                    <button className="admin-email" onClick={() => setMenuOpen(!menuOpen)}>
                        {admin.email}
                    </button>
                    {menuOpen && (
                        <div className="dropdown-menu">
                            <NavLink to="/profile">Profile</NavLink>
                            <button onClick={handleLogout}>Logout</button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="nav-auth">
                    <NavLink to="/login">Login</NavLink>
                </div>
            )}
        </div>
    );
};

export default Header;
