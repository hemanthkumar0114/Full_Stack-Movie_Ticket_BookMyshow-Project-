import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCity } from "../context/CityContext";
import { api } from "../services/api";

function Navbar() {
  const { selectedCity, setIsCityModalOpen } = useCity();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        api.searchMovies(searchQuery)
          .then((data) => {
            setSearchResults(data || []);
            setShowDropdown(true);
            setIsSearching(false);
          })
          .catch(() => {
            setIsSearching(false);
          });
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  }, [searchQuery]);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectMovie = (movieId) => {
    setShowDropdown(false);
    setSearchQuery("");
    navigate(`/movie/${movieId}`);
  };

  return (
    <header className="bms-header">
      {/* Primary Top Bar */}
      <div className="bms-nav-primary">
        <div className="bms-nav-left">
          <Link to="/" className="bms-logo">
            <span className="bms-logo-icon">🎬</span>
            <span className="bms-logo-text">book<span className="bms-logo-red">my</span>show</span>
          </Link>

          {/* Search Bar */}
          <div className="bms-search-container" ref={searchRef}>
            <span className="bms-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search for Movies, Events, Plays, Sports and Activities"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
            />
            {isSearching && <span className="bms-search-spinner">⏳</span>}

            {/* Live Autocomplete Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div className="bms-search-dropdown">
                {searchResults.map((m) => (
                  <div
                    key={m.id}
                    className="bms-search-item"
                    onClick={() => handleSelectMovie(m.id)}
                  >
                    <img
                      src={m.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=120&q=80"}
                      alt={m.title}
                      className="bms-search-thumb"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=120&q=80";
                      }}
                    />
                    <div className="bms-search-info">
                      <h4>{m.title}</h4>
                      <p>
                        <span>★ {m.rating}</span> • <span>{Array.isArray(m.genres) ? m.genres.join(", ") : m.genres || "Action"}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bms-nav-right">
          {/* City Picker Dropdown */}
          <button
            className="bms-city-btn"
            onClick={() => setIsCityModalOpen(true)}
            title="Change City"
          >
            <span>{selectedCity}</span>
            <span className="city-arrow">▾</span>
          </button>

          {/* History / My Bookings */}
          <Link to="/history" className="bms-history-btn">
            <span>🎟️ My Bookings</span>
          </Link>
        </div>
      </div>

      {/* Secondary Categories Bar */}
      <div className="bms-nav-secondary">
        <div className="bms-nav-links-left">
          <Link to="/" className={location.pathname === "/" ? "active" : ""}>
            Movies
          </Link>
          <span className="nav-disabled">Stream <span className="badge-new">NEW</span></span>
          <span className="nav-disabled">Events</span>
          <span className="nav-disabled">Plays</span>
          <span className="nav-disabled">Sports</span>
          <span className="nav-disabled">Activities</span>
        </div>
        <div className="bms-nav-links-right">
          <span className="nav-link-sub">ListYourShow</span>
          <span className="nav-link-sub">Corporates</span>
          <span className="nav-link-sub">Offers</span>
          <span className="nav-link-sub">Gift Cards</span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;