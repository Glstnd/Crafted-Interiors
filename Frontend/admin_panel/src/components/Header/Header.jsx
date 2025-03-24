import LogoPicture from '../../assets/logo.png';
import {NavLink} from "react-router-dom";
import './Header.css';

const Header = () => {
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
            <div className="nav-auth">
                <NavLink to="/login">Login</NavLink>
            </div>
        </div>
    )
}

export default Header;