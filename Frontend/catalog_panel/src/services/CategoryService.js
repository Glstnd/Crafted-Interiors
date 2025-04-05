class CategoryService {
    static url = "http://localhost:8001/catalogs"

    async getCategories(catalog_tag) {
        try {
            const response = await fetch(`${CategoryService.url}/${catalog_tag}/categories`);
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

const categoryServiceInstance = new CategoryService();
export default categoryServiceInstance;