class CatalogService {
    static url = "http://localhost:8001/catalogs"

    async getCatalogs() {
        try {
            const response = await fetch(`${CatalogService.url}`);
            if (!response.ok) {
                console.error("Каталоги не были загружены");
            }
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getCatalogByTag(catalog_tag) {
        try {
            const response = await fetch(`${CatalogService.url}/${catalog_tag}`);
            if (!response.ok) {
                console.error("Каталог не был загружен");
            }
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

const catalogServiceInstance = new CatalogService();
export default catalogServiceInstance;