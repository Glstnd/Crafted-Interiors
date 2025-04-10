class AdminService {
    static url = "http://localhost:8000/admins"

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