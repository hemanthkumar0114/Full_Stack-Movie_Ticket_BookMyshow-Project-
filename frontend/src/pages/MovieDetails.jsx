import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import TrailerModal from "../Components/TrailerModal";
import LoadingState from "../Components/LoadingState";
import ErrorState from "../Components/ErrorState";
import { useAsync } from "../hooks/useAsync";
import { api } from "../services/api";
import { DEFAULT_POSTER_FALLBACK, DEFAULT_BACKDROP_FALLBACK } from "../data/moviesData";

const joinList = (value, separator) => (Array.isArray(value) ? value.join(separator) : value || "");

function MovieDetails() {
  const { id } = useParams();
  const [trailerOpen, setTrailerOpen] = useState(false);
  const { data: movie, error, loading, retry } = useAsync(() => api.getMovieDetails(id), [id]);

  if (loading) {
    return <LoadingState title="Loading Movie Information..." />;
  }

  if (error || !movie) {
    return (
      <ErrorState
        title={error?.status === 404 ? "Movie Not Found" : "Unable to load movie"}
        message={error?.message || "The requested movie could not be found."}
        onRetry={error?.status === 404 ? undefined : retry}
      >
        <Link to="/" className="bms-btn-primary">
          Back to Home
        </Link>
      </ErrorState>
    );
  }

  const languagesText = joinList(movie.languages, ", ");
  const genresText = joinList(movie.genres, " • ");
  const certificate = movie.certificate || movie.certification;
  const duration = movie.duration || (movie.runtimeMin ? `${movie.runtimeMin} mins` : "");
  const ratingText = typeof movie.rating === "number" ? `${movie.rating}/10` : movie.rating;
  const isUpcoming = movie.category === "upcoming";
  const cast = Array.isArray(movie.cast) ? movie.cast : [];
  const formats = Array.isArray(movie.formats) ? movie.formats : [];

  return (
    <div className="bms-details-page">
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
            <span className="poster-caption">{isUpcoming ? "Upcoming Release" : "In Cinemas"}</span>
          </div>

          <div className="details-info-col">
            <h1 className="details-title">{movie.title}</h1>

            {ratingText && (
              <div className="details-rating-card">
                <div className="rating-left">
                  <span className="rating-star">{isUpcoming ? "🔥" : "★"}</span>
                  <span className="rating-score">{ratingText}</span>
                  {movie.votes && <span className="rating-votes">({movie.votes})</span>}
                </div>
              </div>
            )}

            <div className="details-meta-tags">
              {certificate && <span className="meta-pill">{certificate}</span>}
              {duration && <span className="meta-pill">{duration}</span>}
              {languagesText && <span className="meta-pill">{languagesText}</span>}
              {formats.map((format) => (
                <span key={format} className="meta-pill">{format}</span>
              ))}
            </div>

            {genresText && <p className="details-genre-text">{genresText}</p>}

            <p className="details-release-text">
              Status: {movie.releaseDate || (isUpcoming ? "Releasing Soon" : "Now Showing")}
            </p>

            <div className="details-cta-group">
              <Link to={`/showtimes/${movie.id}`} className="bms-btn-primary book-large-btn">
                🎟️ {isUpcoming ? "Explore Theaters & Pre-Book" : "Book Tickets"}
              </Link>
              {movie.trailerUrl && (
                <button type="button" className="bms-btn-secondary" onClick={() => setTrailerOpen(true)}>
                  ▶ Watch Trailer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bms-details-body">
        <section className="about-movie-section">
          <h2>About the Movie</h2>
          <p className="movie-synopsis">{movie.synopsis || movie.description}</p>
        </section>

        {cast.length > 0 && (
          <>
            <hr className="details-divider" />
            <section className="cast-crew-section">
              <h2>Starring Cast</h2>
              <div className="cast-grid">
                {cast.map((actorName) => (
                  <div key={actorName} className="cast-card">
                    <div className="cast-avatar">🎭</div>
                    <h4>{actorName}</h4>
                    <p>Lead Cast</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      <TrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        trailerUrl={movie.trailerUrl || ""}
        movieTitle={movie.title}
      />
    </div>
  );
}

export default MovieDetails;
