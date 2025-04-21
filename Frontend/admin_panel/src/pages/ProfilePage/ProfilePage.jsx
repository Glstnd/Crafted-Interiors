import { Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutAdmin } from "../../store/authSlice"; // Путь к вашему authSlice
import { ShieldCheckIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import "./ProfilePage.css";

const ProfilePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated || false);
    const admin = useSelector((state) => state.auth?.admin || {}); // Получаем данные администратора

    // Защита: перенаправление на /login, если не авторизован
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    const handleLogout = () => {
        dispatch(logoutAdmin());
        navigate("/login"); // Перенаправляем на страницу логина после выхода
    };

    return (
        <div className="profile-page fade-in">
            <h1 className="profile-title">
                <ShieldCheckIcon className="profile-title-icon" />
                Профиль администратора
            </h1>

            <div className="profile-info">
                <div className="info-item">
                    <span className="info-label">Имя пользователя:</span>
                    <span className="info-value">{admin.username || "Не указано"}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{admin.email || "Не указано"}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">ID:</span>
                    <span className="info-value">{admin.public_id || "Не указано"}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Статус:</span>
                    <span className="info-value">{isAuthenticated ? "Авторизован" : "Не авторизован"}</span>
                </div>
            </div>

            <button className="logout-button" onClick={handleLogout}>
                <ArrowRightOnRectangleIcon className="logout-icon" />
                Выйти
            </button>
        </div>
    );
};

export default ProfilePage;