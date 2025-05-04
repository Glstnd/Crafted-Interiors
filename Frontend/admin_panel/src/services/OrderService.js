class OrderService {
    static url = `${import.meta.env.VITE_CATALOG_API_URL}/orders`;

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

    async updateOrder(orderId, orderData) {
        try {
            console.log(orderData);
            const response = await fetch(`${OrderService.url}/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            if (!response.ok) {
                console.error(`Не удалось обновить заказ`);
                throw new Error(`Ошибка: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Ошибка при обновлении статуса заказа ${orderId}:`, error);
            throw error;
        }
    }

    async getUserInfo(publicId) {
        const response = await fetch(`${import.meta.env.VITE_ADMIN_API_URL}/users/${publicId}/info`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Не удалось загрузить данные пользователя');
        }
        return response.json();
    }

    async getProductInfo(productId) {
        const response = await fetch(`${import.meta.env.VITE_CATALOG_API_URL}/products/${productId}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Не удалось загрузить данные о товаре');
        }
        return response.json();
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