import {useEffect, useState} from "react";
import adminServiceInstance from "../../services/AdminService.js";
import "./AdminsPage.css";
import {useNavigate} from "react-router-dom";
import { motion } from "framer-motion";

const AdminsPage = () => {
    const [admins, setAdmins] = useState([]);
    const navigate = useNavigate();

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
        <motion.div className="admins-page">
            <h1>Admins</h1>
            <div className="admins-list">
                {Array.isArray(admins) && admins.length > 0 ? (
                    admins.map(renderAdmin)
                ) : (
                    <p>No admins found.</p>
                )}
            </div>
            <motion.div
                className="add-admin-card"
                onClick={() => navigate("/add-admin")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
            >
                <p>+ Добавить администратора</p>
            </motion.div>
        </motion.div>
    );
}

export default AdminsPage;