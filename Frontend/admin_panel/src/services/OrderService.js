import { store } from '../store/store.js'; // Импортируем Redux store

class OrderService {
    static url = "http://localhost:8001/orders";

    async getOrders() {
        try {
            const response = await fetch(`${OrderService.url}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                console.error("Заказы не были загружены");
                throw new Error(`Ошибка: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Ошибка при загрузке заказов:", error);
            throw error;
        }
    }

    async getOrderById(orderId) {
        try {
            const state = store.getState();
            const token = state.auth.token;

            if (!token) {
                throw new Error("Токен авторизации отсутствует");
            }

            const response = await fetch(`${OrderService.url}/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                console.error(`Заказ ${orderId} не был загружен`);
                throw new Error(`Ошибка: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Ошибка при загрузке заказа ${orderId}:`, error);
            throw error;
        }
    }

    async updateOrderStatus(orderId, newStatus) {
        try {
            const state = store.getState();
            const token = state.auth.token;

            if (!token) {
                throw new Error("Токен авторизации отсутствует");
            }

            const response = await fetch(`${OrderService.url}/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                console.error(`Не удалось обновить статус заказа ${orderId}`);
                throw new Error(`Ошибка: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Ошибка при обновлении статуса заказа ${orderId}:`, error);
            throw error;
        }
    }
}

const orderServiceInstance = new OrderService();
export default orderServiceInstance;