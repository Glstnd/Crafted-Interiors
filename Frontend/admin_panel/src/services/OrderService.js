import { store } from '../store/store.js';

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
            const response = await fetch(`${OrderService.url}/${orderId}`, {
                headers: {
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
            const response = await fetch(`${OrderService.url}/${orderId}`, {
                method: 'PATCH',
                headers: {
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

    async createOrder(orderData) {
        try {
            const response = await fetch(OrderService.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            if (!response.ok) {
                console.error("Не удалось создать заказ");
                throw new Error(`Ошибка: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Ошибка при создании заказа:", error);
            throw error;
        }
    }
}

const orderServiceInstance = new OrderService();
export default orderServiceInstance;