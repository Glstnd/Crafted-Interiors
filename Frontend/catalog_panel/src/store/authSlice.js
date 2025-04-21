import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Валидация данных
const validateUserData = (userData, isUpdate = false) => {
    const errors = {};

    // Username (только при регистрации/входе)
    if (!isUpdate) {
        if (!userData.username || userData.username.length < 3) {
            errors.username = 'Имя пользователя должно содержать минимум 3 символа';
        } else if (!/^[a-zA-Z0-9_]+$/.test(userData.username)) {
            errors.username = 'Имя пользователя может содержать только буквы, цифры и подчёркивания';
        }
    }

    // Email (только при регистрации/входе)
    if (!isUpdate) {
        if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
            errors.email = 'Введите корректный email';
        }
    }

    // Password (только при регистрации/входе)
    if (!isUpdate) {
        if (!userData.password || userData.password.length < 8) {
            errors.password = 'Пароль должен содержать минимум 8 символов';
        } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(userData.password)) {
            errors.password = 'Пароль должен содержать хотя бы одну букву и одну цифру';
        }
    }

    // fname
    if (typeof userData.fname === 'string') {
        if (userData.fname.length < 2) {
            errors.fname = 'Имя должно содержать минимум 2 символа';
        } else if (!/^[a-zA-Zа-яА-Я]+$/.test(userData.fname)) {
            errors.fname = 'Имя может содержать только буквы';
        }
    }

    // lname
    if (typeof userData.lname === 'string') {
        if (userData.lname.length < 2) {
            errors.lname = 'Фамилия должна содержать минимум 2 символа';
        } else if (!/^[a-zA-Zа-яА-Я]+$/.test(userData.lname)) {
            errors.lname = 'Фамилия может содержать только буквы';
        }
    }

    // phone
    if (typeof userData.phone === 'string') {
        if (!/^\+\d{1,3}\d{6,15}$/.test(userData.phone)) {
            errors.phone = 'Номер телефона должен начинаться с "+" и кода страны (1-3 цифры), затем содержать 6-15 цифр (например, +12025550123)';
        }
    }

    if (Object.keys(errors).length > 0) {
        throw new Error(JSON.stringify(errors));
    }
};

// Регистрация пользователя
export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData, { rejectWithValue, dispatch }) => {
        try {
            validateUserData(userData);

            const response = await fetch('http://localhost:8000/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Ошибка регистрации');
            }

            const { access_token } = data;
            localStorage.setItem('token', access_token);

            await dispatch(verifyToken()).unwrap();

            return access_token;
        } catch (error) {
            return rejectWithValue(error.message || 'Ошибка регистрации');
        }
    }
);

// Вход пользователя
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials, { rejectWithValue, dispatch }) => {
        try {
            validateUserData(credentials);

            const response = await fetch('http://localhost:8000/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Ошибка входа');
            }

            const { access_token } = data;
            localStorage.setItem('token', access_token);

            await dispatch(verifyToken()).unwrap();

            return access_token;
        } catch (error) {
            return rejectWithValue(error.message || 'Ошибка входа');
        }
    }
);

// Проверка токена и получение данных пользователя
export const verifyToken = createAsyncThunk(
    'auth/verifyToken',
    async (_, { rejectWithValue }) => {
        const token = localStorage.getItem('token');
        if (!token) {
            return rejectWithValue('Токен отсутствует');
        }
        try {
            const response = await fetch('http://localhost:8000/users/protected', {
                headers: {
                    access_token: `${token}`,
                },
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Недействительный токен');
            }

            return { user: data, token };
        } catch (error) {
            localStorage.removeItem('token');
            return rejectWithValue(error.message || 'Недействительный токен');
        }
    }
);

// Обновление данных пользователя
export const updateUser = createAsyncThunk(
    'auth/updateUser',
    async (userData, { rejectWithValue, getState }) => {
        try {
            validateUserData(userData, true);

            const { auth } = getState();
            const token = auth.token;

            if (!token) {
                throw new Error('Токен авторизации отсутствует');
            }

            const response = await fetch('http://localhost:8000/users/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    access_token: `${token}`,
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Не удалось обновить профиль');
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message || 'Не удалось обновить профиль');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: null,
        user: null,
        isLoading: false,
        error: null,
        isAuthenticated: false,
        updateLoading: false,
        updateError: null,
        updateSuccess: false,
    },
    reducers: {
        logout: (state) => {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
        },
        clearUpdateStatus: (state) => {
            state.updateError = null;
            state.updateSuccess = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.token = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.token = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(verifyToken.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(verifyToken.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(verifyToken.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            })
            .addCase(updateUser.pending, (state) => {
                state.updateLoading = true;
                state.updateError = null;
                state.updateSuccess = false;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.updateLoading = false;
                state.user = action.payload;
                state.updateSuccess = true;
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.updateLoading = false;
                state.updateError = action.payload;
            });
    },
});

export const { logout, clearUpdateStatus } = authSlice.actions;
export default authSlice.reducer;