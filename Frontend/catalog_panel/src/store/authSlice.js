// store/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Регистрация пользователя
export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData, { rejectWithValue, dispatch }) => {
        try {
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

            // После успешной регистрации сразу проверяем токен и получаем данные пользователя
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

            // После успешного входа сразу проверяем токен и получаем данные пользователя
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
                    access_token: `${token}`, // Исправлен заголовок на Authorization: Bearer
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

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: null,
        user: null,
        isLoading: false,
        error: null,
        isAuthenticated: false,
    },
    reducers: {
        logout: (state) => {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
        },
    },
    extraReducers: (builder) => {
        builder
            // Регистрация
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
            // Вход
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
            // Проверка токена
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
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;