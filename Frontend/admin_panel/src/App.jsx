import './App.css';
import React from "react";
import HomePage from "./pages/HomePage/HomePage";
import {Routes, Route} from "react-router-dom";
import Header from "./components/Header/Header.jsx";
import AdminsPage from "./pages/AdminsPage/AdminsPage.jsx";
import LoginPage from "./pages/LoginPage/LoginPage.jsx";
import CatalogsPage from "./pages/CatalogsPage/CatalogsPage.jsx";


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
                <Route
                    path="/catalogs"
                    element={<CatalogsPage/>}
                />
            </Routes>
        </>
    );
}

export default App;
