import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Вход администратора
export const loginAdmin = createAsyncThunk(
    'adminAuth/loginAdmin',
    async (credentials, { rejectWithValue, dispatch }) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_ADMIN_API_URL}/admins/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Ошибка входа администратора');
            }

            const { access_token } = data;
            localStorage.setItem('adminToken', access_token);

            // После успешного входа сразу проверяем токен и получаем данные администратора
            await dispatch(verifyAdminToken()).unwrap();

            return access_token;
        } catch (error) {
            return rejectWithValue(error.message || 'Ошибка входа администратора');
        }
    }
);

// Проверка токена и получение данных администратора
export const verifyAdminToken = createAsyncThunk(
    'adminAuth/verifyAdminToken',
    async (_, { rejectWithValue }) => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            return rejectWithValue('Токен отсутствует');
        }
        try {
            const response = await fetch(`${import.meta.env.VITE_ADMIN_API_URL}/admins/protected`, {
                headers: {
                    access_token: `${token}`, // Предполагается, что API ожидает токен в таком формате
                },
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Недействительный токен');
            }

            return { admin: data, token };
        } catch (error) {
            localStorage.removeItem('adminToken');
            return rejectWithValue(error.message || 'Недействительный токен');
        }
    }
);

const adminAuthSlice = createSlice({
    name: 'adminAuth',
    initialState: {
        token: null,
        admin: null,
        isLoading: false,
        error: null,
        isAuthenticated: false,
    },
    reducers: {
        logoutAdmin: (state) => {
            state.token = null;
            state.admin = null;
            state.isAuthenticated = false;
            localStorage.removeItem('adminToken');
        },
    },
    extraReducers: (builder) => {
        builder
            // Вход администратора
            .addCase(loginAdmin.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginAdmin.fulfilled, (state, action) => {
                state.isLoading = false;
                state.token = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(loginAdmin.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Проверка токена
            .addCase(verifyAdminToken.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(verifyAdminToken.fulfilled, (state, action) => {
                state.isLoading = false;
                state.admin = action.payload.admin;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(verifyAdminToken.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            });
    },
});

export const { logoutAdmin } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;