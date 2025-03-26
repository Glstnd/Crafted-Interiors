import './App.css';
import React from "react";
import HomePage from "./pages/HomePage/HomePage";
import {Routes, Route} from "react-router-dom";
import Header from "./components/Header/Header.jsx";
import AdminsPage from "./pages/AdminsPage/AdminsPage.jsx";
import LoginPage from "./pages/LoginPage/LoginPage.jsx";

function App() {
    return (
        <>
            <Header/>

            <Routes>
                <Route
                    path="/"
                    element={<HomePage/>}
                />
                <Route
                    path="/admins"
                    element={<AdminsPage/>}
                />
                <Route
                    path="/login"
                    element={<LoginPage/>}
                />
            </Routes>
        </>
    );
}

export default App;
