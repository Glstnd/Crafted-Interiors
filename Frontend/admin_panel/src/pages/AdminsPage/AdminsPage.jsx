import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    ShieldCheckIcon,
    ListBulletIcon,
    Squares2X2Icon,
    TrashIcon,
} from "@heroicons/react/24/outline";
import adminService from "../../services/AdminService";
import "./AdminsPage.css";

const AdminsPage = () => {
    const [admins, setAdmins] = useState([]);
    const [viewMode, setViewMode] = useState("cards");
    const [selectedAdmins, setSelectedAdmins] = useState(new Set());
    const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated || false);

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const data = await adminService.getAdmins();
                setAdmins(data);
            } catch (error) {
                console.error("Ошибка загрузки администраторов:", error);
            }
        };
        fetchAdmins();
    }, []);

    const toggleSelectAdmin = (public_id) => {
        setSelectedAdmins((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(public_id)) {
                newSet.delete(public_id);
            } else {
                newSet.add(public_id);
            }
            return newSet;
        });
    };

    const handleDeleteSelected = () => {
        console.log("Удалить администраторов:", Array.from(selectedAdmins));
        setAdmins(admins.filter((admin) => !selectedAdmins.has(admin.public_id)));
        setSelectedAdmins(new Set());
    };

    return (
        <div className="admins-page">
            <div className="header fade-in">
                <h1 className="header-title">Список администраторов</h1>
                <div className="view-toggle">
                    <button
                        className={`view-button ${viewMode === "cards" ? "active" : ""}`}
                        onClick={() => setViewMode("cards")}
                        title="Вид карточек"
                    >
                        <Squares2X2Icon className="view-icon" />
                    </button>
                    <button
                        className={`view-button ${viewMode === "list" ? "active" : ""}`}
                        onClick={() => setViewMode("list")}
                        title="Вид списка"
                    >
                        <ListBulletIcon className="view-icon" />
                    </button>
                </div>
            </div>

            <div className={`admins-container ${viewMode}`}>
                {admins.map((admin) => (
                    <div
                        key={admin.public_id}
                        className={`admin-item ${viewMode} fade-in`}
                    >
                        <input
                            type="checkbox"
                            checked={selectedAdmins.has(admin.public_id)}
                            onChange={() => toggleSelectAdmin(admin.public_id)}
                            className="admin-checkbox"
                        />
                        <Link
                            to={`/admins/${admin.public_id}`}
                            className="admin-link"
                        >
                            <ShieldCheckIcon className="admin-icon" />
                            <div className="admin-details">
                                <h3 className="admin-username">{admin.username}</h3>
                                <p className="admin-email">{admin.email}</p>
                                <p className="admin-id">ID: {admin.public_id}</p>
                            </div>
                        </Link>
                    </div>
                ))}
                {/* Карточка для добавления нового администратора */}
                <div className={`admin-item ${viewMode} add-admin fade-in`}>
                    <Link to="/admins/new" className="admin-link">
                        <ShieldCheckIcon className="admin-icon" />
                        <div className="admin-details">
                            <h3 className="admin-username">Добавить администратора</h3>
                        </div>
                    </Link>
                </div>
            </div>

            {selectedAdmins.size > 0 && (
                <div className="selected-actions fade-in">
                    <p>Выбрано администраторов: {selectedAdmins.size}</p>
                    <button
                        className="delete-selected-button"
                        onClick={handleDeleteSelected}
                    >
                        <TrashIcon className="delete-icon" />
                        Удалить выбранных
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminsPage;