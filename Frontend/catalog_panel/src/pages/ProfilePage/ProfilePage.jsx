// components/ProfilePage.js
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { verifyToken, logout } from '../../store/authSlice';
import './ProfilePage.css';

const ProfilePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading, error } = useSelector((state) => state.auth);

    // Проверяем токен при загрузке страницы
    useEffect(() => {
        if (!isAuthenticated) {
            dispatch(verifyToken());
        }
    }, [dispatch, isAuthenticated]);

    // Если пользователь не авторизован, перенаправляем на логин
    useEffect(() => {
        if (!isAuthenticated && !isLoading) {
            navigate('/login');
        }
    }, [isAuthenticated, isLoading, navigate]);

    // Обработчик выхода
    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    if (isLoading) {
        return <div className="profile-loading">Загрузка...</div>;
    }

    if (error) {
        return <div className="profile-error">{error}</div>;
    }

    return (
        <div className="profile-container">
            <h2>Профиль пользователя</h2>
            {user && (
                <div className="profile-info">
                    <div className="profile-field">
                        <span className="profile-label">Имя пользователя:</span>
                        <span className="profile-value">{user.username}</span>
                    </div>
                    <div className="profile-field">
                        <span className="profile-label">Email:</span>
                        <span className="profile-value">{user.email}</span>
                    </div>
                    <div className="profile-field">
                        <span className="profile-label">Публичный ID:</span>
                        <span className="profile-value">{user.public_id}</span>
                    </div>
                </div>
            )}
            <button className="logout-button" onClick={handleLogout}>
                Выйти
            </button>
        </div>
    );
};

export default ProfilePage;