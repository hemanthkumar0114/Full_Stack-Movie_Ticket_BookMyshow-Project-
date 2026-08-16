import { useState, useEffect } from "react";
import HeroBanner from "../Components/HeroBanner";
import MovieCard from "../Components/MovieCard";
import TrailerModal from "../Components/TrailerModal";
import { api } from "../services/api";

function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Category Tab: "all", "now_showing", "upcoming", "top_rated", "trending"
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("ALL");
  const [selectedGenre, setSelectedGenre] = useState("ALL");

  // Trailer Modal State
  const [trailerModal, setTrailerModal] = useState({
    isOpen: false,
    trailerUrl: "",
    movieTitle: ""
  });

  useEffect(() => {
    setLoading(true);
    api.getNowPlayingMovies(activeCategory)
      .then((data) => {
        if (Array.isArray(data)) {
          setMovies(data);
        } else {
          setMovies([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading movies:", err);
        setError("Unable to connect to movie catalog service.");
        setLoading(false);
      });
  }, [activeCategory]);

  const openTrailer = (url, title) => {
    setTrailerModal({
      isOpen: true,
      trailerUrl: url,
      movieTitle: title
    });
  };

  const closeTrailer = () => {
    setTrailerModal({
      isOpen: false,
      trailerUrl: "",
      movieTitle: ""
    });
  };

  // Indian Languages & Genres
  const languages = ["ALL", "Hindi", "Telugu", "Tamil", "Malayalam", "Kannada"];
  const genres = ["ALL", "Action", "Sci-Fi", "Comedy", "Thriller", "Horror", "Drama", "Mythology"];

  const filteredMovies = movies.filter((m) => {
    const langStr = Array.isArray(m.languages) ? m.languages.join(" ") : m.languages || "";
    const langMatch =
      selectedLanguage === "ALL" ||
      langStr.toLowerCase().includes(selectedLanguage.toLowerCase());

    const genreStr = Array.isArray(m.genres) ? m.genres.join(" ") : m.genres || "";
    const genreMatch =
      selectedGenre === "ALL" ||
      genreStr.toLowerCase().includes(selectedGenre.toLowerCase());

    return langMatch && genreMatch;
  });

  // Top trending movies for Hero Carousel
  const heroMovies = movies.slice(0, 4);

  return (
    <div className="bms-home-page">
      {/* Top Full-Width Hero Banner Slider */}
      <HeroBanner movies={heroMovies} onWatchTrailer={openTrailer} />

      {/* Main Movies Section */}
      <main className="bms-main-container">
        {/* Category Sub-Navigation Tab Bar */}
        <div className="bms-category-tabs-bar">
          <button
            className={`cat-tab-btn ${activeCategory === "all" ? "active" : ""}`}
            onClick={() => setActiveCategory("all")}
          >
            🔥 All Movies
          </button>
          <button
            className={`cat-tab-btn ${activeCategory === "now_showing" ? "active" : ""}`}
            onClick={() => setActiveCategory("now_showing")}
          >
            🎬 Now Showing
          </button>
          <button
            className={`cat-tab-btn ${activeCategory === "upcoming" ? "active" : ""}`}
            onClick={() => setActiveCategory("upcoming")}
          >
            ⚡ Upcoming Releases
          </button>
          <button
            className={`cat-tab-btn ${activeCategory === "top_rated" ? "active" : ""}`}
            onClick={() => setActiveCategory("top_rated")}
          >
            ⭐ Top Rated
          </button>
          <button
            className={`cat-tab-btn ${activeCategory === "trending" ? "active" : ""}`}
            onClick={() => setActiveCategory("trending")}
          >
            🚀 Trending
          </button>
        </div>

        <div className="bms-section-header">
          <div className="section-title-group">
            <h2>
              {activeCategory === "upcoming"
                ? "Upcoming Blockbusters"
                : activeCategory === "top_rated"
                ? "Top Rated Cinema"
                : "Now Showing in Cinemas"}
            </h2>
            <p>
              Showing {filteredMovies.length} movies available for instant ticket booking
            </p>
          </div>

          {/* Language Filter Pills */}
          <div className="bms-catalog-filters">
            <div className="filter-pill-group">
              {languages.map((lang) => (
                <button
                  key={lang}
                  className={`lang-pill ${selectedLanguage === lang ? "active" : ""}`}
                  onClick={() => setSelectedLanguage(lang)}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Genre Tags */}
        <div className="genre-tags-bar">
          <span className="genre-label">Genres:</span>
          {genres.map((genre) => (
            <button
              key={genre}
              className={`genre-tag ${selectedGenre === genre ? "active" : ""}`}
              onClick={() => setSelectedGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Loading / Error / Movie Cards Grid */}
        {loading ? (
          <div className="bms-loading-screen">
            <div className="bms-spinner"></div>
            <h2>Loading Movies Catalog...</h2>
          </div>
        ) : error ? (
          <div className="bms-error-screen">
            <h2>⚠️ Service Notice</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="bms-retry-btn">
              Retry
            </button>
          </div>
        ) : (
          <div className="bms-movies-grid">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
            {filteredMovies.length === 0 && (
              <div className="no-movies-found">
                <p>No movies match the selected filters ({selectedLanguage}, {selectedGenre}).</p>
                <button
                  onClick={() => {
                    setSelectedLanguage("ALL");
                    setSelectedGenre("ALL");
                  }}
                  className="reset-filters-btn"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Stream & Premiere Banner */}
        <div className="bms-promo-banner">
          <div className="promo-badge">BOOKMYSHOW STREAM</div>
          <h3>Endless Entertainment Anytime. Rent or Buy Indian blockbusters.</h3>
          <p>Handpicked cinema releases in 4K Dolby Vision delivered straight to your home screen.</p>
        </div>
      </main>

      {/* Video Trailer Modal */}
      <TrailerModal
        isOpen={trailerModal.isOpen}
        onClose={closeTrailer}
        trailerUrl={trailerModal.trailerUrl}
        movieTitle={trailerModal.movieTitle}
      />
    </div>
  );
}

export default Home;