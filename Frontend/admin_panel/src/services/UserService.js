class UserService {
    async getUserInfo(publicId) {
        const response = await fetch(`${import.meta.env.VITE_ADMIN_API_URL}/users/${publicId}/info`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Не удалось загрузить данные пользователя');
        }
        return response.json();
    }
}

const userServiceInstance = new UserService();
export default userServiceInstance;