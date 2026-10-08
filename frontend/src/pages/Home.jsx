import { useState } from "react";
import HeroBanner from "../Components/HeroBanner";
import MovieCard from "../Components/MovieCard";
import TrailerModal from "../Components/TrailerModal";
import LoadingState from "../Components/LoadingState";
import ErrorState from "../Components/ErrorState";
import { useAsync } from "../hooks/useAsync";
import { api } from "../services/api";

const CATEGORIES = [
  { key: "all", label: "🔥 All Movies" },
  { key: "now_showing", label: "🎬 Now Showing" },
  { key: "upcoming", label: "⚡ Upcoming Releases" },
  { key: "top_rated", label: "⭐ Top Rated" },
  { key: "trending", label: "🚀 Trending" }
];

const LANGUAGES = ["ALL", "Hindi", "Telugu", "Tamil", "Malayalam", "Kannada"];
const GENRES = ["ALL", "Action", "Sci-Fi", "Comedy", "Thriller", "Horror", "Drama", "Mythology"];

const SECTION_TITLES = {
  upcoming: "Upcoming Blockbusters",
  top_rated: "Top Rated Cinema"
};

const joinList = (value) => (Array.isArray(value) ? value.join(" ") : value || "");

function Home() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("ALL");
  const [selectedGenre, setSelectedGenre] = useState("ALL");
  const [trailer, setTrailer] = useState(null);

  const { data, error, loading, retry } = useAsync(
    () => api.getNowPlayingMovies(activeCategory),
    [activeCategory],
    { keepPreviousData: true }
  );

  const movies = Array.isArray(data) ? data : [];

  const filteredMovies = movies.filter((movie) => {
    const languageMatch =
      selectedLanguage === "ALL" ||
      joinList(movie.languages).toLowerCase().includes(selectedLanguage.toLowerCase());
    const genreMatch =
      selectedGenre === "ALL" ||
      joinList(movie.genres).toLowerCase().includes(selectedGenre.toLowerCase());
    return languageMatch && genreMatch;
  });

  const resetFilters = () => {
    setSelectedLanguage("ALL");
    setSelectedGenre("ALL");
  };

  return (
    <div className="bms-home-page">
      <HeroBanner
        movies={movies.slice(0, 4)}
        onWatchTrailer={(url, title) => setTrailer({ url, title })}
      />

      <main className="bms-main-container">
        <div className="bms-category-tabs-bar">
          {CATEGORIES.map((category) => (
            <button
              type="button"
              key={category.key}
              className={`cat-tab-btn ${activeCategory === category.key ? "active" : ""}`}
              onClick={() => setActiveCategory(category.key)}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="bms-section-header">
          <div className="section-title-group">
            <h2>{SECTION_TITLES[activeCategory] || "Now Showing in Cinemas"}</h2>
            <p>Showing {filteredMovies.length} movies available for instant ticket booking</p>
          </div>

          <div className="bms-catalog-filters">
            <div className="filter-pill-group">
              {LANGUAGES.map((language) => (
                <button
                  type="button"
                  key={language}
                  className={`lang-pill ${selectedLanguage === language ? "active" : ""}`}
                  onClick={() => setSelectedLanguage(language)}
                >
                  {language}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="genre-tags-bar">
          <span className="genre-label">Genres:</span>
          {GENRES.map((genre) => (
            <button
              type="button"
              key={genre}
              className={`genre-tag ${selectedGenre === genre ? "active" : ""}`}
              onClick={() => setSelectedGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>

        {loading && movies.length === 0 ? (
          <LoadingState title="Loading Movies Catalog..." />
        ) : error ? (
          <ErrorState
            title="Unable to load movies"
            message={error.message}
            onRetry={retry}
          />
        ) : (
          <div className="bms-movies-grid">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
            {filteredMovies.length === 0 && (
              <div className="no-movies-found">
                <p>No movies match the selected filters ({selectedLanguage}, {selectedGenre}).</p>
                <button type="button" onClick={resetFilters} className="reset-filters-btn">
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        )}

        <div className="bms-promo-banner">
          <div className="promo-badge">BOOKMYSHOW STREAM</div>
          <h3>Endless Entertainment Anytime. Rent or Buy Indian blockbusters.</h3>
          <p>Handpicked cinema releases in 4K Dolby Vision delivered straight to your home screen.</p>
        </div>
      </main>

      <TrailerModal
        isOpen={Boolean(trailer)}
        onClose={() => setTrailer(null)}
        trailerUrl={trailer?.url || ""}
        movieTitle={trailer?.title || ""}
      />
    </div>
  );
}

export default Home;
