class CatalogService {
    static url = `${import.meta.env.VITE_CATALOG_API_URL}/catalogs`

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

    async createCatalog(name, description, tag, photo) {
        const formData = new FormData();

        const catalogRequest = {
            "name": name,
            "description": description || null,
            "tag": tag
        }

        formData.append('catalog_request', JSON.stringify(catalogRequest));

        if (photo) {
            formData.append("file", photo);
        }

        // Проверка отправляемых данных
        console.log('Отправляемые данные (JSON):', formData);

        try {
            const response = await fetch(`${CatalogService.url}`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data; // Возвращаем { name, description, tag, image_path }
        } catch (error) {
            console.error('Ошибка в CatalogService:', error);
            console.error("Подробнее:", error.response);
            throw error;
        }
    }
}

const catalogServiceInstance = new CatalogService();
export default catalogServiceInstance;