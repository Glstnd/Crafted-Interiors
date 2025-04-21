import './App.css';
import React from "react";
import {Routes, Route} from "react-router-dom";
import Navbar from "./components/navbar/Navbar.jsx";
import MainPage from "./pages/MainPage/MainPage.jsx";
import LoginPage from "./pages/LoginPage/LoginPage.jsx";
import AdminsPage from "./pages/AdminsPage/AdminsPage.jsx";
import StoresPage from "./pages/StoresPage/StoresPage.jsx";
import StorePage from "./pages/StoresPage/StorePage/StorePage.jsx";
import ProfilePage from "./pages/ProfilePage/ProfilePage.jsx";
import CatalogsPage from "./pages/Catalog/CatalogsPage.jsx";
import CatalogPage from "./pages/Catalog/CatalogPage.jsx";
import CategoryPage from "./pages/Category/CategoryPage.jsx";
import NewProductPage from "./pages/Product/NewProductPage/NewProductPage.jsx";
import AddNewCatalogPage from "./pages/Catalog/AddNewCatalogPage.jsx";
import OrdersPage from "./pages/OrdersPage/OrdersPage.jsx";
import OrderPage from "./pages/OrdersPage/OrderPage.jsx";
import EditOrderPage from "./pages/OrdersPage/EditOrderPage.jsx";


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
                <Route
                    path="/profile"
                    element={<ProfilePage/>}
                />
                <Route
                    path="/orders"
                    element={<OrdersPage/>}
                />
                <Route
                    path="/orders/:orderId"
                    element={<OrderPage/>}
                />
                <Route
                    path="/orders/:orderId/edit"
                    element={<EditOrderPage/>}
                />
                <Route
                    path="/catalog"
                    element={<CatalogsPage/>}
                />
                <Route
                    path="/catalog/new"
                    element={<AddNewCatalogPage/>}
                />
                <Route
                    path="/catalog/:catalog_tag"
                    element={<CatalogPage/>}
                />
                <Route
                    path="/catalog/:catalog_tag/:category_tag"
                    element={<CategoryPage/>}
                />
                <Route
                    path="/catalog/:catalog_tag/:category_tag/product/new"
                   element={<NewProductPage/>}
                />
                <Route
                    path="/stores"
                    element={<StoresPage/>}
                />
                <Route
                    path="/stores/:id"
                    element={<StorePage/>}
                />
            </Routes>
        </>
    );
}

export default App;
