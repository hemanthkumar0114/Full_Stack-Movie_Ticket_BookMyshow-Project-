import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { CityProvider } from "./context/CityProvider";
import Navbar from "./Components/Navbar";
import CityModal from "./Components/CityModal";
import ProtectedRoute from "./Components/ProtectedRoute";
import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import Showtimes from "./pages/Showtimes";
import SeatBooking from "./pages/SeatBooking";
import History from "./pages/History";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./index.css";

function App() {
  return (
    <AuthProvider>
      <CityProvider>
        <BrowserRouter>
          <div className="bms-app-wrapper">
            <Navbar />
            <CityModal />

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movie/:id" element={<MovieDetails />} />
              <Route path="/showtimes/:id" element={<Showtimes />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/booking/:id" element={<SeatBooking />} />
                <Route path="/history" element={<History />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </CityProvider>
    </AuthProvider>
  );
}

export default App;
