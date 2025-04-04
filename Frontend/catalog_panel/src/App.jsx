import './App.css'
import Navbar from "./components/navbar/Navbar.jsx";

function App() {
  return (
    <>
      <Navbar isAuthenticated={false} cartItemsCount={3} />
    </>
  )
}

export default App
