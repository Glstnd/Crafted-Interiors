import './App.css'
import Navbar from "./components/navbar/Navbar.jsx";
import {Route, Routes} from "react-router-dom";
import MainPage from "./pages/MainPage/MainPage.jsx";
import CatalogsPage from "./pages/Catalog/CatalogsPage.jsx";
import CatalogPage from "./pages/Catalog/CatalogPage.jsx";
import CategoryPage from "./pages/Category/CategoryPage.jsx";
import LoginPage from "./pages/LoginPage/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage/RegisterPage.jsx";
import ProductPage from "./pages/ProductPage/ProductPage.jsx";
import CartPage from "./pages/CartPage/CartPage.jsx";
import ProfilePage from "./pages/ProfilePage/ProfilePage.jsx";
import StoresPage from "./pages/StoresPage/StoresPage.jsx";
import OrderPage from "./pages/OrderPage/OrderPage.jsx";

function App() {
  return (
    <>
      <Navbar isAuthenticated={false} cartItemsCount={3} />
        <Routes>
          <Route
              path="/"
              element={<MainPage/>}
          />
          <Route
              path="/stores"
              element={<StoresPage/>}
          />
          <Route
              path="/login"
              element={<LoginPage/>}
          />
          <Route
              path="/register"
              element={<RegisterPage/>}
          />
          <Route
              path="/cart"
              element={<CartPage/>}
          />
          <Route
              path="/profile"
              element={<ProfilePage/>}
          />
          <Route
              path="/orders/:orderId"
              element={<OrderPage/>}
          />
          <Route
              path="/catalog"
              element={<CatalogsPage/>}
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
              path="/catalog/:catalog_tag/:category_tag/:product_tag"
              element={<ProductPage/>}
          />
        </Routes>
    </>
  )
}

export default App
