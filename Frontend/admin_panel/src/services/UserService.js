class UserService {
    async getUserInfo(publicId) {
        const response = await fetch(`http://localhost:8000/users/${publicId}/info`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Не удалось загрузить данные пользователя');
        }
        return response.json();
    }
}

const userServiceInstance = new UserService();
export default userServiceInstance;