// components/LoginPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import './LoginPage.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Ошибка входа');

            console.log('Успешный вход:', data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = '/api/auth/google';
    };

    return (
        <div className="login-container">
            <h2>Вход</h2>
            <form onSubmit={handleSubmit} className="login-form">
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
                                <path
                                    className="eye-path"
                                    d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                                />
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

                <button
                    type="submit"
                    className="login-button"
                    disabled={isLoading}
                >
                    {isLoading ? 'Загрузка...' : 'Войти'}
                </button>

                <button
                    type="button"
                    className="google-login-button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                >
                    <FcGoogle size={24} style={{ marginRight: '10px' }} />
                    Войти через Google
                </button>

                <div className="register-link">
                    Нет аккаунта?{' '}
                    <Link to="/register">Зарегистрироваться</Link>
                </div>
            </form>
        </div>
    );
};

export default LoginPage;