import './App.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

function App() {
    return (
    <Router>
        <div>
            <nav>
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/login">Login</Link>
                    </li>
                    <li>
                        <Link to="/reset">Reset</Link>
                    </li>
                    <li>
                        <Link to="/dashboard">Dashboard</Link>
                    </li>
                </ul>
            </nav>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/reset" element={<PasswordReset />} />
                <Route path="/dashboard" element={<DefaultLayout />} />
            </Routes>
        </div>
    </Router>
  );
}

function Home() {
    return <h2>Home</h2>
}

function Login() {
    return <h2>Login</h2>
}

function PasswordReset() {
    return <h2>Password Reset</h2>
}

function Dashboard() {
    return <h2>Dashboard</h2>
}

export default App;
