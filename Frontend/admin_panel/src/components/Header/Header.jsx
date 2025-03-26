import LogoPicture from '../../assets/logo.png';
import { NavLink } from "react-router-dom";
import './Header.css';
import AdminService from "../../services/AdminService.js";
import { useEffect, useState, useRef } from "react";

const Header = () => {
    const [admin, setAdmin] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        AdminService.getAuthAdmin()
            .then(setAdmin)
            .catch(() => setAdmin(null));
    }, []);

    const handleLogout = () => {
        // AdminService.logout();
        window.location.reload();
    };

    // Закрытие меню при клике вне его области
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        if (menuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]);

    return (
        <div className="navbar">
            <div className="logo-container">
                <NavLink to="/">
                    <img src={LogoPicture} alt="logo" className="logo" />
                </NavLink>
            </div>
            <div className="nav-links">
                <NavLink to="/catalogs">Catalogs</NavLink>
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
}

export default Header;
