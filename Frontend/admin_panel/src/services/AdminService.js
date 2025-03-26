import Cookies from 'js-cookie';


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
            const response = await fetch(`${AdminService.url}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(authDTO),
            });

            if (!response.ok) {
                throw new Error('Failed to authenticate user');
            }

            if (!!Cookies.get('token')) {
                console.error("Failed to get token!")
            }

            console.log(response.json());
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

const adminServiceInstance = new AdminService();
export default adminServiceInstance;