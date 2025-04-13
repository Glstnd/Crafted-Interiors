const BASE_URL = 'http://localhost:8001';

const StoreService = {
    // Получение списка магазинов
    getStores: async () => {
        try {
            const response = await fetch(`${BASE_URL}/stores`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Ошибка ${response.status}: Не удалось загрузить магазины`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка в StoreService.getStores:', error);
            throw error; // Передаем ошибку дальше для обработки в компоненте
        }
    },

    async getStore(id) {
        try {
            const response = await fetch(`${BASE_URL}/stores/${id}`);
            if (!response.ok) {
                console.log("Магазин не был загружен");
            }
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
};

export default StoreService;