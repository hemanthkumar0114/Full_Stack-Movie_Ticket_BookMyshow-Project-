import { useState } from "react";
import { useParams } from "react-router-dom";
import DateStrip from "../Components/DateStrip";
import FilterBar from "../Components/FilterBar";
import CinemaVenueCard from "../Components/CinemaVenueCard";
import LoadingState from "../Components/LoadingState";
import ErrorState from "../Components/ErrorState";
import { useCity } from "../hooks/useCity";
import { useAsync } from "../hooks/useAsync";
import { api } from "../services/api";
import { toIsoDate } from "../utils/formatters";

const joinList = (value) => (Array.isArray(value) ? value.join(", ") : value || "");

function Showtimes() {
  const { id } = useParams();
  const { selectedCity, setIsCityModalOpen } = useCity();
  const [selectedDate, setSelectedDate] = useState(() => toIsoDate(new Date()));
  const [selectedFormat, setSelectedFormat] = useState("ALL FORMATS");

  const { data: movie } = useAsync(() => api.getMovieDetails(id), [id]);
  const { data, error, loading, retry } = useAsync(
    () => api.getCinemasAndShowtimes(id, selectedCity, selectedDate),
    [id, selectedCity, selectedDate],
    { keepPreviousData: true }
  );

  const cinemas = Array.isArray(data) ? data : [];

  const filteredCinemas = cinemas
    .map((cinema) => ({
      ...cinema,
      showtimes: cinema.showtimes.filter(
        (showtime) =>
          selectedFormat === "ALL FORMATS" ||
          showtime.formatType?.toLowerCase().includes(selectedFormat.toLowerCase())
      )
    }))
    .filter((cinema) => cinema.showtimes.length > 0);

  return (
    <div className="bms-showtimes-page">
      {movie && (
        <div className="showtimes-movie-header">
          <div className="header-container">
            <div className="header-movie-title-box">
              <h1>{movie.title}</h1>
              <div className="header-meta-tags">
                {(movie.certificate || movie.certification) && (
                  <span className="cert-pill">{movie.certificate || movie.certification}</span>
                )}
                <span>{joinList(movie.languages)}</span>
                <span>•</span>
                <span>{joinList(movie.genres)}</span>
              </div>
            </div>

            <div className="header-city-indicator">
              <span>Showing in </span>
              <button type="button" className="city-change-btn" onClick={() => setIsCityModalOpen(true)}>
                {selectedCity} ▾
              </button>
            </div>
          </div>
        </div>
      )}

      <DateStrip selectedDate={selectedDate} onDateChange={setSelectedDate} />

      <FilterBar selectedFormat={selectedFormat} onFormatChange={setSelectedFormat} />

      <main className="bms-venues-container">
        {loading && cinemas.length === 0 ? (
          <LoadingState title="Finding Theaters & Available Showtimes..." />
        ) : error ? (
          <ErrorState title="Unable to load showtimes" message={error.message} onRetry={retry} />
        ) : filteredCinemas.length === 0 ? (
          <div className="no-showtimes-box">
            <h3>No Showtimes Available</h3>
            <p>
              No cinema showtimes found in <strong>{selectedCity}</strong> for this date. Try changing the city or date.
            </p>
            <button type="button" className="bms-btn-primary" onClick={() => setIsCityModalOpen(true)}>
              Change City
            </button>
          </div>
        ) : (
          filteredCinemas.map((cinema) => <CinemaVenueCard key={cinema.cinemaId} cinema={cinema} />)
        )}
      </main>
    </div>
  );
}

export default Showtimes;
