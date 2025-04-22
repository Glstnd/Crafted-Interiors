import { store } from '../store/store.js'; // Импортируйте ваш Redux store

class OrderService {
    static url = "http://localhost:8001/orders";

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

    async getOrders() {
        try {
            const state = store.getState();
            const publicId = state.auth.user?.public_id;
            const token = state.auth.token;

            if (!publicId) {
                throw new Error("Пользователь не авторизован или public_id отсутствует");
            }

            if (!token) {
                throw new Error("Токен авторизации отсутствует");
            }

            const response = await fetch(`${OrderService.url}?public_id=${publicId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
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

    async createOrder(cartItems, totalAmount) {
        try {
            const state = store.getState();
            const publicId = state.auth.user?.public_id;
            const token = state.auth.token;

            if (!publicId) {
                throw new Error("Пользователь не авторизован или public_id отсутствует");
            }

            if (!token) {
                throw new Error("Токен авторизации отсутствует");
            }

            // Формируем данные для отправки
            const orderData = {
                public_id: publicId,
                items: cartItems.map(item => ({
                    product_tag: item.product.tag,
                    quantity: item.quantity,
                    unit_price: item.product.price || 0,
                })),
                total_amount: totalAmount,
            };

            const response = await fetch(OrderService.url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
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