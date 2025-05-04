class CategoryService {
    static url = `${import.meta.env.VITE_CATALOG_API_URL}/catalogs`

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

    async getCategoryByTag(catalog_tag, category_tag)  {
        try {
            const response = await fetch(`${CategoryService.url}/${catalog_tag}/categories/${category_tag}`)
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