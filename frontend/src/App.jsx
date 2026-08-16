import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CityProvider } from "./context/CityContext";
import Navbar from "./Components/Navbar";
import CityModal from "./Components/CityModal";
import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import Showtimes from "./pages/Showtimes";
import SeatBooking from "./pages/SeatBooking";
import History from "./pages/History";
import "./index.css";

function App() {
  return (
    <CityProvider>
      <BrowserRouter>
        <div className="bms-app-wrapper">
          <Navbar />
          <CityModal />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/showtimes/:id" element={<Showtimes />} />
            <Route path="/booking/:id" element={<SeatBooking />} />
            <Route path="/history" element={<History />} />
            {/* Backward compatibility redirects */}
            <Route path="/bill" element={<Navigate to="/history" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </CityProvider>
  );
}

export default App;
