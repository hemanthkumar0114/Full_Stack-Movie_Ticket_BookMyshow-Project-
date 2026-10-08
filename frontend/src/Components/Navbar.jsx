import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCity } from "../hooks/useCity";
import { useAuth } from "../hooks/useAuth";
import { useAsync } from "../hooks/useAsync";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { api } from "../services/api";

const FALLBACK_POSTER = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=120&q=80";

function Navbar() {
  const { selectedCity, setIsCityModalOpen } = useCity();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const debouncedQuery = useDebouncedValue(searchQuery.trim(), 250);
  const canSearch = debouncedQuery.length >= 2;

  const { data: results, loading: isSearching } = useAsync(
    () => (canSearch ? api.searchMovies(debouncedQuery) : Promise.resolve([])),
    [debouncedQuery],
    { keepPreviousData: true }
  );

  const searchResults = canSearch && Array.isArray(results) ? results : [];

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

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bms-header">
      <div className="bms-nav-primary">
        <div className="bms-nav-left">
          <Link to="/" className="bms-logo">
            <span className="bms-logo-icon">🎬</span>
            <span className="bms-logo-text">book<span className="bms-logo-red">my</span>show</span>
          </Link>

          <div className="bms-search-container" ref={searchRef}>
            <span className="bms-search-icon">🔍</span>
            <input
              type="search"
              aria-label="Search movies"
              placeholder="Search for Movies"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
            />
            {canSearch && isSearching && <span className="bms-search-spinner">⏳</span>}

            {showDropdown && searchResults.length > 0 && (
              <div className="bms-search-dropdown">
                {searchResults.map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    className="bms-search-item"
                    onClick={() => handleSelectMovie(m.id)}
                  >
                    <img
                      src={m.posterUrl || FALLBACK_POSTER}
                      alt=""
                      className="bms-search-thumb"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = FALLBACK_POSTER;
                      }}
                    />
                    <div className="bms-search-info">
                      <h4>{m.title}</h4>
                      <p>{Array.isArray(m.genres) ? m.genres.join(", ") : m.genres}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bms-nav-right">
          <button
            type="button"
            className="bms-city-btn"
            onClick={() => setIsCityModalOpen(true)}
            title="Change City"
          >
            <span>{selectedCity}</span>
            <span className="city-arrow">▾</span>
          </button>

          {isAuthenticated ? (
            <>
              <Link to="/history" className="bms-history-btn">
                <span>🎟️ My Bookings</span>
              </Link>
              <span className="bms-user-name">Hi, {user?.name?.split(" ")[0]}</span>
              <button type="button" className="bms-auth-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" state={{ from: { pathname: location.pathname } }} className="bms-auth-btn">
              Sign in
            </Link>
          )}
        </div>
      </div>

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
