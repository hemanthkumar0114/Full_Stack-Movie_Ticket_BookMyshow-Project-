import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DEFAULT_POSTER_FALLBACK, DEFAULT_BACKDROP_FALLBACK } from "../data/moviesData";

function HeroBanner({ movies = [], onWatchTrailer }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (movies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [movies.length]);

  if (!movies || movies.length === 0) return null;

  const currentMovie = movies[currentIndex] || movies[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  };

  const languagesText = Array.isArray(currentMovie.languages)
    ? currentMovie.languages.join(", ")
    : currentMovie.languages || "Hindi, Telugu";

  const genresText = Array.isArray(currentMovie.genres)
    ? currentMovie.genres.join(" • ")
    : currentMovie.genres || "Action • Sci-Fi";

  const isUpcoming = currentMovie.category === "upcoming";

  return (
    <div className="bms-hero-slider">
      <div
        className="bms-hero-slide"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(15, 16, 23, 0.95) 20%, rgba(15, 16, 23, 0.75) 60%, rgba(15, 16, 23, 0.35) 100%), url(${currentMovie.backdropUrl || DEFAULT_BACKDROP_FALLBACK})`
        }}
      >
        <div className="bms-hero-content">
          <div className="bms-hero-details">
            <span className="bms-hero-badge">
              {isUpcoming ? "⚡ MOST ANTICIPATED BLOCKBUSTER" : "🔥 TRENDING IN CINEMAS"}
            </span>
            <h1 className="bms-hero-title">{currentMovie.title}</h1>

            <div className="bms-hero-meta">
              <span className="bms-rating-pill">
                <span className="star">{isUpcoming ? "🔥" : "★"}</span>
                {typeof currentMovie.rating === "number" ? `${currentMovie.rating}/10` : currentMovie.rating || "9.0/10"}
                <span className="votes">({currentMovie.votes || "350K+ Votes"})</span>
              </span>
              <span className="meta-tag">{currentMovie.certificate || currentMovie.certification || "UA16+"}</span>
              <span className="meta-tag">{currentMovie.duration || `${currentMovie.runtimeMin || 160} mins`}</span>
              <span className="meta-tag">{languagesText}</span>
            </div>

            <p className="bms-hero-genres">{genresText}</p>

            <p className="bms-hero-desc">
              {currentMovie.synopsis || currentMovie.description}
            </p>

            <div className="bms-hero-actions">
              <Link to={`/movie/${currentMovie.id}`} className="bms-btn-primary">
                🎟️ {isUpcoming ? "Explore & Pre-Book" : "Book Tickets"}
              </Link>
              {currentMovie.trailerUrl && (
                <button
                  className="bms-btn-secondary"
                  onClick={() => onWatchTrailer(currentMovie.trailerUrl, currentMovie.title)}
                >
                  ▶ Watch Trailer
                </button>
              )}
            </div>
          </div>

          <div className="bms-hero-poster">
            <img
              src={currentMovie.posterUrl || DEFAULT_POSTER_FALLBACK}
              alt={currentMovie.title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = currentMovie.fallbackPoster || DEFAULT_POSTER_FALLBACK;
              }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {movies.length > 1 && (
        <>
          <button className="slider-arrow arrow-left" onClick={handlePrev} aria-label="Previous Slide">‹</button>
          <button className="slider-arrow arrow-right" onClick={handleNext} aria-label="Next Slide">›</button>

          {/* Dots */}
          <div className="slider-dots">
            {movies.map((_, idx) => (
              <span
                key={idx}
                className={`dot ${idx === currentIndex ? "active" : ""}`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default HeroBanner;
