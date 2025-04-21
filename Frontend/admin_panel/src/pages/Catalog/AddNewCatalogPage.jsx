import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CatalogService from '../../services/CatalogService';
import './AddNewCatalogPage.css';

const AddNewCatalogPage = () => {
    const navigate = useNavigate();
    const inputFileRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        tag: '',
        photo: null,
    });

    const [errors, setErrors] = useState({});
    const [photoPreview, setPhotoPreview] = useState(null);

    // Проверка валидности поля
    const validateField = (name, value) => {
        switch (name) {
            case 'name':
                if (!value.trim()) return 'Название обязательно';
                if (value.trim().length < 2) return 'Название должно содержать минимум 2 символа';
                return '';
            case 'description':
                return ''; // Необязательное, без ограничений
            case 'tag':
                if (!value.trim()) return 'Тег обязателен';
                if (value.trim().length < 2) return 'Тег должен содержать минимум 2 символа';
                if (!/^[a-z0-9_]+$/.test(value.trim())) return 'Тег должен содержать только английские буквы, цифры и нижние подчёркивания, без пробелов';
                return '';
            case 'photo':
                if (value) {
                    const validExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
                    const extension = value.name.split('.').pop().toLowerCase();
                    if (!validExtensions.includes(extension)) {
                        return 'Допустимы только файлы: .png, .jpg, .jpeg, .gif, .webp';
                    }
                }
                return '';
            default:
                return '';
        }
    };

    // Обновление ошибок при изменении формы
    useEffect(() => {
        const newErrors = {};
        Object.keys(formData).forEach((key) => {
            newErrors[key] = validateField(key, formData[key]);
        });
        setErrors(newErrors);
    }, [formData]);

    // Обработка изменений в полях
    const handleChange = (e) => {
        const { name, value } = e.target;
        let processedValue = value;

        if (name === 'tag') {
            processedValue = value.toLowerCase().replace(/\s/g, '');
        }

        setFormData((prev) => ({
            ...prev,
            [name]: processedValue,
        }));
    };

    // Обработка загрузки фото
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (photoPreview) {
            URL.revokeObjectURL(photoPreview);
        }
        setFormData((prev) => ({
            ...prev,
            photo: file || null,
        }));
        if (file) {
            setPhotoPreview(URL.createObjectURL(file));
        } else {
            setPhotoPreview(null);
        }
    };

    // Удаление фото
    const handleRemovePhoto = () => {
        if (photoPreview) {
            URL.revokeObjectURL(photoPreview);
        }
        setFormData((prev) => ({ ...prev, photo: null }));
        setPhotoPreview(null);
        if (inputFileRef.current) {
            inputFileRef.current.value = null;
        }
    };

    // Проверка валидности формы
    const isFormValid = () => {
        return (
            formData.name.trim().length >= 2 &&
            formData.tag.trim().length >= 2 &&
            /^[a-z0-9_]+$/.test(formData.tag.trim()) &&
            (!formData.photo ||
                ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(
                    formData.photo.name.split('.').pop().toLowerCase()
                ))
        );
    };

    // Обработка отправки формы
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isFormValid()) {
            try {
                const response = await CatalogService.createCatalog(
                    formData.name.trim(),
                    formData.description.trim() || null,
                    formData.tag.trim(),
                    formData.photo
                );
                navigate(`/catalog/${response.tag}`);
            } catch (error) {
                console.error('Ошибка создания каталога:', error);
                if (error.message.includes('409')) {
                    setErrors((prev) => ({
                        ...prev,
                        tag: 'Тег уже занят. Выберите другой.',
                    }));
                } else {
                    setErrors((prev) => ({
                        ...prev,
                        general: 'Не удалось создать каталог. Попробуйте снова.',
                    }));
                }
            }
        }
    };

    // Обработка отмены
    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <div className="add-catalog-page-scope">
            <h1 className="page-title">Создание нового каталога</h1>
            <form className="catalog-form" onSubmit={handleSubmit}>
                {errors.general && <span className="error-message general-error">{errors.general}</span>}
                <div className="form-group">
                    <label htmlFor="name">Название *</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={errors.name ? 'input-error' : ''}
                        placeholder="Введите название"
                    />
                    {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="description">Описание</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className={errors.description ? 'input-error' : ''}
                        placeholder="Введите описание"
                    />
                    {errors.description && <span className="error-message">{errors.description}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="tag">Тег *</label>
                    <input
                        type="text"
                        id="tag"
                        name="tag"
                        value={formData.tag}
                        onChange={handleChange}
                        className={errors.tag ? 'input-error' : ''}
                        placeholder="Введите тег (на английском, без пробелов)"
                    />
                    {errors.tag && <span className="error-message">{errors.tag}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="photo">Фото каталога</label>
                    <input
                        type="file"
                        id="photo"
                        name="photo"
                        accept=".png,.jpg,.jpeg,.gif,.webp"
                        onChange={handlePhotoChange}
                        className={errors.photo ? 'input-error' : ''}
                        ref={inputFileRef}
                    />
                    {photoPreview && (
                        <div className="photo-preview">
                            <img src={photoPreview} alt="Предпросмотр" />
                            <button
                                type="button"
                                className="photo-remove"
                                onClick={handleRemovePhoto}
                                title="Удалить фото"
                            >
                                ×
                            </button>
                        </div>
                    )}
                    {errors.photo && <span className="error-message">{errors.photo}</span>}
                </div>

                <div className="form-actions">
                    {isFormValid() && (
                        <button type="submit" className="submit-button">
                            Создать
                        </button>
                    )}
                    <button type="button" className="cancel-button" onClick={handleCancel}>
                        Отмена
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddNewCatalogPage;