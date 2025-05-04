class ProductService {
    static url = `${import.meta.env.VITE_CATALOG_API_URL}/catalogs`

    async getProducts(catalog_tag, category_tag, params = {}) {
        try {
            const query = new URLSearchParams(params).toString();
            const response = await fetch(`${ProductService.url}/${catalog_tag}/categories/${category_tag}/products?${query}`);
            if (!response.ok) {
                console.error("Категории не были загружены");
            }
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getProductByTag(catalog_tag, category_tag, product_tag) {
        try {
            const response = await fetch(`${ProductService.url}/${catalog_tag}/categories/${category_tag}/products/${product_tag}`)
            if (!response.ok) {
                console.error("Категории не были загружены");
            }
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getProductInfo(productId) {
        const response = await fetch(`${import.meta.env.VITE_CATALOG_API_URL}/${productId}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Не удалось загрузить данные о товаре');
        }
        return response.json();
    }
}

const productServiceInstance = new ProductService();
export default productServiceInstance;