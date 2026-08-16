import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import DateStrip from "../Components/DateStrip";
import FilterBar from "../Components/FilterBar";
import CinemaVenueCard from "../Components/CinemaVenueCard";
import { useCity } from "../context/CityContext";
import { api } from "../services/api";

function Showtimes() {
  const { id } = useParams();
  const { selectedCity, setIsCityModalOpen } = useCity();

  const [movie, setMovie] = useState(null);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const today = new Date();
  const initialIsoDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const [selectedDate, setSelectedDate] = useState(initialIsoDate);
  const [selectedFormat, setSelectedFormat] = useState("ALL FORMATS");
  const [selectedPriceRange, setSelectedPriceRange] = useState("ALL PRICES");

  // Fetch movie details
  useEffect(() => {
    api.getMovieDetails(id)
      .then((data) => setMovie(data))
      .catch((err) => console.error("Error fetching movie info:", err));
  }, [id]);

  // Fetch cinemas and showtimes based on movie, city, and date
  useEffect(() => {
    setLoading(true);
    api.getCinemasAndShowtimes(id, selectedCity, selectedDate)
      .then((data) => {
        setCinemas(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading showtimes:", err);
        setError("Failed to load showtimes.");
        setLoading(false);
      });
  }, [id, selectedCity, selectedDate]);

  // Filter cinemas and showtimes locally based on format and price filter
  const filteredCinemas = cinemas.map((cinema) => {
    const filteredShowtimes = cinema.showtimes.filter((st) => {
      const formatMatch =
        selectedFormat === "ALL FORMATS" ||
        (st.formatType && st.formatType.toLowerCase().includes(selectedFormat.toLowerCase()));
      return formatMatch;
    });

    return {
      ...cinema,
      showtimes: filteredShowtimes
    };
  }).filter((cinema) => cinema.showtimes.length > 0);

  return (
    <div className="bms-showtimes-page">
      {/* Movie Header Strip */}
      {movie && (
        <div className="showtimes-movie-header">
          <div className="header-container">
            <div className="header-movie-title-box">
              <h1>{movie.title}</h1>
              <div className="header-meta-tags">
                <span className="cert-pill">{movie.certificate || movie.certification || "UA"}</span>
                <span>
                  {Array.isArray(movie.languages)
                    ? movie.languages.join(", ")
                    : movie.languages || "Hindi, Telugu"}
                </span>
                <span>•</span>
                <span>
                  {Array.isArray(movie.genres)
                    ? movie.genres.join(", ")
                    : movie.genres || "Action, Drama"}
                </span>
              </div>
            </div>

            <div className="header-city-indicator">
              <span>Showing in </span>
              <button
                className="city-change-btn"
                onClick={() => setIsCityModalOpen(true)}
              >
                {selectedCity} ▾
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Selector Strip */}
      <DateStrip selectedDate={selectedDate} onDateChange={setSelectedDate} />

      {/* Format & Price Filter Bar */}
      <FilterBar
        selectedFormat={selectedFormat}
        onFormatChange={setSelectedFormat}
        selectedPriceRange={selectedPriceRange}
        onPriceChange={setSelectedPriceRange}
      />

      {/* Cinema Venues List */}
      <main className="bms-venues-container">
        {loading ? (
          <div className="bms-loading-screen">
            <div className="bms-spinner"></div>
            <h2>Finding Theaters & Available Showtimes...</h2>
          </div>
        ) : error ? (
          <div className="bms-error-screen">
            <h2>⚠️ Notice</h2>
            <p>{error}</p>
          </div>
        ) : filteredCinemas.length === 0 ? (
          <div className="no-showtimes-box">
            <h3>No Showtimes Available</h3>
            <p>
              No cinema showtimes found in <strong>{selectedCity}</strong> for this date. Try changing the city or date.
            </p>
            <button
              className="bms-btn-primary"
              onClick={() => setIsCityModalOpen(true)}
            >
              Change City
            </button>
          </div>
        ) : (
          filteredCinemas.map((cinema) => (
            <CinemaVenueCard key={cinema.cinemaId} cinema={cinema} />
          ))
        )}
      </main>
    </div>
  );
}

export default Showtimes;
