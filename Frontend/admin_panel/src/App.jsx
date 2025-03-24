import './App.css';
import React from "react";
import HomePage from "./pages/HomePage/HomePage";
import {Routes, Route, NavLink} from "react-router-dom";
import Header from "./components/Header/Header.jsx";

function App() {
    return (
        <>
            <Header/>

            <Routes>
                <Route
                    path="/"
                    element={<HomePage/>}
                />
            </Routes>
        </>
    );
}

export default App;
