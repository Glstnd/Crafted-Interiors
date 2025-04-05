import './App.css'
import Navbar from "./components/navbar/Navbar.jsx";
import {Route, Routes} from "react-router-dom";
import MainPage from "./pages/MainPage/MainPage.jsx";
import CatalogsPage from "./pages/Catalog/CatalogsPage.jsx";
import CatalogPage from "./pages/Catalog/CatalogPage.jsx";

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
              path="/catalog"
              element={<CatalogsPage/>}
          />
          <Route
              path="/catalog/:catalog_tag"
              element={<CatalogPage/>}
          />
        </Routes>
    </>
  )
}

export default App
