import './App.css'
import Navbar from "./components/navbar/Navbar.jsx";
import {Route, Routes} from "react-router-dom";
import MainPage from "./pages/MainPage/MainPage.jsx";
import CatalogsPage from "./pages/Catalog/CatalogsPage.jsx";
import CatalogPage from "./pages/Catalog/CatalogPage.jsx";
import CategoryPage from "./pages/Category/CategoryPage.jsx";
import LoginPage from "./pages/LoginPage/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage/RegisterPage.jsx";

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
              path="/login"
              element={<LoginPage/>}
          />
          <Route
              path="/register"
              element={<RegisterPage/>}
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
        </Routes>
    </>
  )
}

export default App
