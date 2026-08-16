import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import TrailerModal from "../Components/TrailerModal";
import { api } from "../services/api";
import { DEFAULT_POSTER_FALLBACK, DEFAULT_BACKDROP_FALLBACK } from "../data/moviesData";

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [trailerModal, setTrailerModal] = useState({
    isOpen: false,
    trailerUrl: "",
    movieTitle: ""
  });

  useEffect(() => {
    setLoading(true);
    api.getMovieDetails(id)
      .then((data) => {
        setMovie(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading movie details:", err);
        setError("Unable to load movie details.");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="bms-loading-screen">
        <div className="bms-spinner"></div>
        <h2>Loading Movie Information...</h2>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="bms-error-screen">
        <h2>Movie Not Found</h2>
        <p>{error || "The requested movie could not be found."}</p>
        <Link to="/" className="bms-btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  const languagesText = Array.isArray(movie.languages)
    ? movie.languages.join(", ")
    : movie.languages || "Hindi, Telugu";

  const genresText = Array.isArray(movie.genres)
    ? movie.genres.join(" • ")
    : movie.genres || "Action • Drama";

  const isUpcoming = movie.category === "upcoming";

  return (
    <div className="bms-details-page">
      {/* Backdrop Header Banner */}
      <div
        className="details-hero-banner"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(15, 16, 23, 0.96) 25%, rgba(15, 16, 23, 0.8) 65%, rgba(15, 16, 23, 0.4) 100%), url(${movie.backdropUrl || DEFAULT_BACKDROP_FALLBACK})`
        }}
      >
        <div className="details-hero-container">
          <div className="details-poster-col">
            <img
              src={movie.posterUrl || DEFAULT_POSTER_FALLBACK}
              alt={movie.title}
              className="details-main-poster"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = movie.fallbackPoster || DEFAULT_POSTER_FALLBACK;
              }}
            />
            <span className="poster-caption">
              {isUpcoming ? "Upcoming Release" : "In Cinemas"}
            </span>
          </div>

          <div className="details-info-col">
            <h1 className="details-title">{movie.title}</h1>

            {/* Rating Box */}
            <div className="details-rating-card">
              <div className="rating-left">
                <span className="rating-star">{isUpcoming ? "🔥" : "★"}</span>
                <span className="rating-score">
                  {typeof movie.rating === "number" ? `${movie.rating}/10` : movie.rating || "9.0/10"}
                </span>
                <span className="rating-votes">
                  ({movie.votes || `${(movie.voteCount || 150000).toLocaleString()} Votes`})
                </span>
              </div>
              <button
                className="rate-now-btn"
                onClick={() => alert("Thank you! Your rating has been recorded.")}
              >
                Rate now
              </button>
            </div>

            {/* Formats & Languages */}
            <div className="details-meta-tags">
              <span className="meta-pill">{movie.certificate || movie.certification || "UA"}</span>
              <span className="meta-pill">{movie.duration || `${movie.runtimeMin || 160} mins`}</span>
              <span className="meta-pill">{languagesText}</span>
              {movie.formats && Array.isArray(movie.formats) ? (
                movie.formats.map((fmt, idx) => (
                  <span key={idx} className="meta-pill">{fmt}</span>
                ))
              ) : (
                <span className="meta-pill">2D, IMAX 2D, 4DX</span>
              )}
            </div>

            <p className="details-genre-text">{genresText}</p>

            <p className="details-release-text">
              Status: {movie.releaseDate || (isUpcoming ? "Releasing Soon" : "Now Showing")}
            </p>

            {/* Action CTAs */}
            <div className="details-cta-group">
              <Link to={`/showtimes/${movie.id}`} className="bms-btn-primary book-large-btn">
                🎟️ {isUpcoming ? "Explore Theaters & Pre-Book" : "Book Tickets"}
              </Link>
              {movie.trailerUrl && (
                <button
                  className="bms-btn-secondary"
                  onClick={() =>
                    setTrailerModal({
                      isOpen: true,
                      trailerUrl: movie.trailerUrl,
                      movieTitle: movie.title
                    })
                  }
                >
                  ▶ Watch Trailer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* About Movie Synopsis & Cast */}
      <div className="bms-details-body">
        <section className="about-movie-section">
          <h2>About the Movie</h2>
          <p className="movie-synopsis">{movie.synopsis || movie.description}</p>
        </section>

        <hr className="details-divider" />

        <section className="cast-crew-section">
          <h2>Starring Cast & Crew</h2>
          <div className="cast-grid">
            {movie.cast && Array.isArray(movie.cast) ? (
              movie.cast.map((actorName, idx) => (
                <div key={idx} className="cast-card">
                  <div className="cast-avatar">🎭</div>
                  <h4>{actorName}</h4>
                  <p>Lead Cast</p>
                </div>
              ))
            ) : (
              [
                { name: "Prabhas", role: "Actor", icon: "🎭" },
                { name: "Amitabh Bachchan", role: "Actor", icon: "🌟" },
                { name: "Deepika Padukone", role: "Actor", icon: "✨" },
                { name: "Kamal Haasan", role: "Actor", icon: "🎬" }
              ].map((c, i) => (
                <div key={i} className="cast-card">
                  <div className="cast-avatar">{c.icon}</div>
                  <h4>{c.name}</h4>
                  <p>{c.role}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={trailerModal.isOpen}
        onClose={() => setTrailerModal({ isOpen: false, trailerUrl: "", movieTitle: "" })}
        trailerUrl={trailerModal.trailerUrl}
        movieTitle={trailerModal.movieTitle}
      />
    </div>
  );
}

export default MovieDetails;
