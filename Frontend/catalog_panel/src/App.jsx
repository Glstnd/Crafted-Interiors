import './App.css'
import Navbar from "./components/navbar/Navbar.jsx";
import {Route, Routes} from "react-router-dom";
import MainPage from "./pages/MainPage/MainPage.jsx";

function App() {
  return (
    <>
      <Navbar isAuthenticated={false} cartItemsCount={3} />
        <Routes>
        <Route
            path="/"
            element={<MainPage/>}
        />
        </Routes>
    </>
  )
}

export default App
