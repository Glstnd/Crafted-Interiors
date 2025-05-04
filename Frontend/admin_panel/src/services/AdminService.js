class AdminService {
    static url = `${import.meta.env.VITE_ADMIN_API_URL}/admins`;

    async getAdmins() {
        try {
            const response = await fetch(`${AdminService.url}`);
            if (!response.ok) {
                console.log("Администраторы не были загружены");
            }
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

const adminServiceInstance = new AdminService();
export default adminServiceInstance;