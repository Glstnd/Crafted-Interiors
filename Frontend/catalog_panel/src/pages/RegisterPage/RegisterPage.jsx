// components/RegisterPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { useDispatch } from 'react-redux'; // Добавляем только useDispatch для кнопки
import { registerUser } from '../../store/authSlice'; // Импортируем действие регистрации
import './RegisterPage.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState(null); // Восстанавливаем локальный error
    const [isLoading, setIsLoading] = useState(false); // Восстанавливаем локальный isLoading
    const [emailError, setEmailError] = useState('');

    const dispatch = useDispatch(); // Для отправки действия регистрации
    const navigate = useNavigate(); // Для перенаправления после регистрации

    // Критерии пароля
    const passwordCriteria = {
        length: formData.password.length >= 8,
        uppercase: /[A-Z]/.test(formData.password),
        lowercase: /[a-z]/.test(formData.password),
        number: /\d/.test(formData.password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    };
    const passwordsMatch = formData.password === formData.confirmPassword && formData.password !== '';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (name === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            setEmailError(emailRegex.test(value) ? '' : 'Введите корректный email');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const requiredCriteria = { ...passwordCriteria, special: true };
        if (emailError || !passwordsMatch || Object.values(requiredCriteria).some(criterion => !criterion)) {
            setError('Пожалуйста, исправьте ошибки в форме');
            setIsLoading(false);
            return;
        }

        const userData = {
            username: formData.username,
            password: formData.password,
            ...(formData.email && { email: formData.email }), // Email опционален
        };

        try {
            // Отправляем действие регистрации через Redux
            const resultAction = await dispatch(registerUser(userData)).unwrap();
            if (resultAction) {
                // После успешной регистрации перенаправляем на главную страницу
                navigate('/');
            }
        } catch (err) {
            setError(err || 'Ошибка регистрации');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = '/api/auth/google';
    };

    return (
        <div className="register-container">
            <h2>Регистрация</h2>
            <form onSubmit={handleSubmit} className="register-form">
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
                    <label htmlFor="email">Электронная почта (необязательно)</label>
                    <div className="input-wrapper">
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Введите email"
                        />
                    </div>
                    {emailError && <p className="error-message">{emailError}</p>}
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

                <div className="form-group">
                    <label htmlFor="confirmPassword">Подтверждение пароля</label>
                    <div className="password-input-wrapper">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Повторите пароль"
                            required
                        />
                        <button
                            type="button"
                            className="toggle-password-eye"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'}
                        >
                            <svg
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#27ae60"
                                strokeWidth="2"
                                className={showConfirmPassword ? 'eye-open' : 'eye-closed'}
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

                <div className="password-criteria">
                    <p className={passwordCriteria.length ? 'valid' : 'invalid'}>Минимум 8 символов</p>
                    <p className={passwordCriteria.uppercase ? 'valid' : 'invalid'}>Заглавная буква</p>
                    <p className={passwordCriteria.lowercase ? 'valid' : 'invalid'}>Строчная буква</p>
                    <p className={passwordCriteria.number ? 'valid' : 'invalid'}>Цифра</p>
                    <p className={passwordCriteria.special ? 'valid-special' : 'invalid-special'}>Спецсимвол (!@#$%...) (необязательно)</p>
                    <p className={passwordsMatch ? 'valid' : 'invalid'}>Пароли совпадают</p>
                </div>

                {error && <p className="error-message">{error}</p>}

                <button
                    type="submit"
                    className="register-button"
                    disabled={isLoading}
                >
                    {isLoading ? 'Загрузка...' : 'Зарегистрироваться'}
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

                <div className="login-link">
                    Уже есть аккаунт?{' '}
                    <Link to="/login">Войти</Link>
                </div>
            </form>
        </div>
    );
};

export default RegisterPage;