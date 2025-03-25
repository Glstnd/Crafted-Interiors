import {useEffect, useState} from "react";
import adminServiceInstance from "../../services/AdminsService.js";

const AdminsPage = () => {
    const [admins, setAdmins] = useState([]);

    useEffect(() => {
        adminServiceInstance.getAdmins()
            .then(jsonResponse => {
                console.log("Fetched admins:", jsonResponse); // отладка
                if (Array.isArray(jsonResponse)) { // проверяем, массив ли это
                    setAdmins(jsonResponse);
                } else {
                    console.error("Unexpected response format", jsonResponse);
                }
                setAdmins(jsonResponse);
            })
            .catch(error => console.log(error))
    }, []);

    const renderAdmin = (admin) => {
        return (
            <div key={admin.public_id} className="admin-card">
                <h3>{admin.username}</h3>
                <p>Email: {admin.email}</p>
                <p>ID: {admin.public_id}</p>
            </div>
        );
    };

    return (
        <div className="admins-page">
            <h1>Admins</h1>
            <div className="admins-list">
                {admins.map(renderAdmin)}
            </div>
        </div>
    );
}

export default AdminsPage;