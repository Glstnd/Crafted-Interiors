import axios from "axios";


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

    async loginAdmin(username, password) {
        const authDTO = { username, password };
        try {
            const response = await axios.post(
                `${AdminService.url}/login`,
                authDTO,
                { withCredentials: true}
            );

            console.log(response.data);
            return response.data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getAuthAdmin() {
        try {
            const response = await axios.get(
                `${AdminService.url}/protected`,
                {withCredentials : true}
            )

            console.log(response.data)

            return response.data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

const adminServiceInstance = new AdminService();
export default adminServiceInstance;