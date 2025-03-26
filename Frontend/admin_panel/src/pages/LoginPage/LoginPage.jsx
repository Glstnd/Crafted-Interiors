import "./LoginPage.css";
import {useState} from "react";
import AdminService from "../../services/AdminService.js";
import {useNavigate} from "react-router-dom";

const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        console.log("Logging in with", username, password);
        // Здесь можно добавить логику авторизации
        AdminService.loginAdmin(username, password)
            .catch(error => console.log(error))
         navigate("/");
    };

    return (
        <div className="login-container">
            <h1>Admin Login</h1>
            <form onSubmit={handleLogin} className="login-form">
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" className="login-button">Login</button>
            </form>
        </div>
    )
}

export default LoginPage;