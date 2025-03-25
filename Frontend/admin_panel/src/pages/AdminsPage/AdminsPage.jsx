import {useEffect, useState} from "react";
import adminServiceInstance from "../../services/AdminsService.js";
import "./AdminsPage.css";

const AdminsPage = () => {
    const [admins, setAdmins] = useState([]);

    useEffect(() => {
        adminServiceInstance.getAdmins()
            .then(jsonResponse =>setAdmins(jsonResponse))
            .catch(error => console.log(error))
    }, []);

    const renderAdmin = (admin) => (
        <div key={admin.public_id} className="admin-card">
            <h3>{admin.username}</h3>
            <p>Email: {admin.email}</p>
            <p>ID: {admin.public_id}</p>
            <div className="admin-actions">
                <button className="edit-button">Редактировать</button>
                <button className="delete-button">Удалить</button>
            </div>
        </div>
    );

    return (
        <div className="admins-page">
            <h1>Admins</h1>
            <div className="admins-list">
                {Array.isArray(admins) && admins.length > 0 ? (
                    admins.map(renderAdmin)
                ) : (
                    <p>No admins found.</p>
                )}
            </div>
        </div>
    );
}

export default AdminsPage;