import { useState } from "react";
import { Link } from "react-router-dom";
import { DEFAULT_POSTER_FALLBACK } from "../data/moviesData";

function MovieCard({ movie }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!movie) return null;

  const languagesText = Array.isArray(movie.languages)
    ? movie.languages.join(", ")
    : movie.languages || "Hindi, Telugu";

  const genresText = Array.isArray(movie.genres)
    ? movie.genres.slice(0, 2).join(", ")
    : movie.genres || "Action, Drama";

  const isUpcoming = movie.category === "upcoming" || (typeof movie.rating === "string" && movie.rating.includes("Interested"));

  return (
    <Link to={`/movie/${movie.id}`} className="bms-movie-card">
      <div className={`bms-poster-wrapper ${!imageLoaded ? "shimmer-loading" : ""}`}>
        <img
          src={movie.posterUrl || DEFAULT_POSTER_FALLBACK}
          alt={movie.title}
          className="bms-movie-poster"
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = movie.fallbackPoster || DEFAULT_POSTER_FALLBACK;
          }}
        />

        {/* Rating Overlay */}
        <div className="bms-poster-rating">
          {isUpcoming ? (
            <>
              <span className="star">🔥</span>
              <span className="score">{movie.rating || "Upcoming"}</span>
            </>
          ) : (
            <>
              <span className="star">★</span>
              <span className="score">
                {typeof movie.rating === "number" ? `${movie.rating}/10` : movie.rating || "8.8/10"}
              </span>
              <span className="votes">{movie.votes || `${(movie.voteCount || 120000).toLocaleString()} Votes`}</span>
            </>
          )}
        </div>

        {/* Hover Quick Action */}
        <div className="bms-poster-overlay">
          <span className="quick-book-btn">
            {isUpcoming ? "Explore & Notify" : "Book Tickets"}
          </span>
        </div>
      </div>

      <div className="bms-movie-meta">
        <h3 className="bms-movie-title" title={movie.title}>
          {movie.title}
        </h3>
        
        <div className="bms-movie-certification">
          <span className="cert-pill">{movie.certificate || movie.certification || "UA"}</span>
          <span className="genres-span">{genresText}</span>
        </div>

        {movie.formats && Array.isArray(movie.formats) && (
          <div className="card-formats-row">
            {movie.formats.map((fmt, idx) => (
              <span key={idx} className="format-tag-mini">{fmt}</span>
            ))}
          </div>
        )}

        <p className="bms-movie-lang">{languagesText}</p>
      </div>
    </Link>
  );
}

export default MovieCard;