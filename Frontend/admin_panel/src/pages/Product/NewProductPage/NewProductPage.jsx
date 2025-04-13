import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NewProductPage.css';

const NewProductPage = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        tag: '',
        price: '',
        photo: null,
    });

    const [errors, setErrors] = useState({});
    const [photoPreview, setPhotoPreview] = useState(null);

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

        setErrors((prev) => ({
            ...prev,
            [name]: '',
        }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({
                ...prev,
                photo: file,
            }));
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Наименование обязательно';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Наименование должно содержать минимум 2 символа';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Описание обязательно';
        } else if (formData.description.trim().length < 10) {
            newErrors.description = 'Описание должно содержать минимум 10 символов';
        }

        if (!formData.tag.trim()) {
            newErrors.tag = 'Тег обязателен';
        } else if (formData.tag.trim().length < 2) {
            newErrors.tag = 'Тег должен содержать минимум 2 символа';
        } else if (!/^[a-z0-9]+$/.test(formData.tag.trim())) {
            newErrors.tag = 'Тег должен содержать только английские буквы и цифры, без пробелов';
        }

        if (formData.price && (isNaN(formData.price) || formData.price < 0)) {
            newErrors.price = 'Цена должна быть положительным числом';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            console.log('Данные для отправки:', {
                name: formData.name.trim(),
                description: formData.description.trim(),
                tag: formData.tag.trim(),
                price: formData.price ? parseFloat(formData.price) : null,
                photo: formData.photo,
            });
            navigate(-1);
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <div className="new-product-page-scope">
            <h1 className="page-title">Создание нового товара</h1>
            <form className="product-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Наименование *</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={errors.name ? 'input-error' : ''}
                        placeholder="Введите наименование"
                    />
                    {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="description">Описание *</label>
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
                    <label htmlFor="price">Цена</label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className={errors.price ? 'input-error' : ''}
                        placeholder="Введите цену"
                        min="0"
                        step="0.01"
                    />
                    {errors.price && <span className="error-message">{errors.price}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="photo">Фото товара</label>
                    <input
                        type="file"
                        id="photo"
                        name="photo"
                        accept="image/*"
                        onChange={handlePhotoChange}
                    />
                    {photoPreview && (
                        <div className="photo-preview">
                            <img src={photoPreview} alt="Предпросмотр" />
                        </div>
                    )}
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-button">
                        Создать
                    </button>
                    <button type="button" className="cancel-button" onClick={handleCancel}>
                        Отмена
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewProductPage;