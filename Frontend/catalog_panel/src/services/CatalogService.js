class CatalogService {
    static url = "http://localhost:8001/catalogs"

    async getCatalogs() {
        try {
            const response = await fetch(`${CatalogService.url}`);
            if (!response.ok) {
                console.log("Каталоги не были загружены");
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