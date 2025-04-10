import './App.css';
import React from "react";
import {Routes, Route} from "react-router-dom";
import Navbar from "./components/navbar/Navbar.jsx";
import MainPage from "./pages/MainPage/MainPage.jsx";
import LoginPage from "./pages/LoginPage/LoginPage.jsx";
import AdminsPage from "./pages/AdminsPage/AdminsPage.jsx";


function App() {
    return (
        <>
            <Navbar/>
            <Routes>
                <Route
                    path="/"
                    element={<MainPage/>}
                />
                <Route
                    path="/login"
                    element={<LoginPage/>}
                />
                <Route
                    path="/admins"
                    element={<AdminsPage/>}
                />
            </Routes>
        </>
    );
}

export default App;
