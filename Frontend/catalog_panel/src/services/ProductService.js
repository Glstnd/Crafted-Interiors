class ProductService {
    static url = "http://localhost:8001/catalogs"

    async getProducts(catalog_tag, category_tag) {
        try {
            const response = await fetch(`${ProductService.url}/${catalog_tag}/categories/${category_tag}/products`);
            if (!response.ok) {
                console.error("Категории не были загружены");
            }
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

const productServiceInstance = new ProductService();
export default productServiceInstance;