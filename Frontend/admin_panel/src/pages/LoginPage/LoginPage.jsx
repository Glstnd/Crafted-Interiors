import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginAdmin, verifyAdminToken } from '../../store/authSlice'; // Импорт из adminAuthSlice
import './LoginPage.css';

const LoginAdminPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        // Проверяем токен администратора при загрузке компонента
        dispatch(verifyAdminToken());
    }, [dispatch]);

    useEffect(() => {
        // Если администратор уже авторизован, перенаправляем на главную
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(loginAdmin(formData));
    };

    return (
        <div className="login-admin-container">
            <h2>Вход для администратора</h2>
            <form onSubmit={handleSubmit} className="login-admin-form">
                <div className="form-group">
                    <label htmlFor="username">Имя пользователя</label>
                    <div className="input-wrapper">
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Введите имя пользователя"
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="password">Пароль</label>
                    <div className="password-input-wrapper">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Введите пароль"
                            required
                        />
                        <button
                            type="button"
                            className="toggle-password-eye"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                        >
                            <svg
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#27ae60"
                                strokeWidth="2"
                                className={showPassword ? 'eye-open' : 'eye-closed'}
                            >
                                <path className="eye-path" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle className="pupil" cx="12" cy="12" r="3" fill="#27ae60" />
                                <path
                                    className="eyelid"
                                    d="M12 15a3 3 0 0 0 0-6"
                                    stroke="#27ae60"
                                    strokeWidth="2"
                                    fill="none"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {error && <p className="error-message">{error}</p>}

                <button type="submit" className="login-button" disabled={isLoading}>
                    {isLoading ? 'Загрузка...' : 'Войти'}
                </button>

                <div className="register-link">
                    Нет аккаунта? <Link to="/register-admin">Зарегистрироваться</Link>
                </div>
            </form>
        </div>
    );
};

export default LoginAdminPage;