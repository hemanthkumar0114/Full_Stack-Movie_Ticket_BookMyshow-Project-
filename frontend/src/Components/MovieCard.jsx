import { useState } from "react";
import { Link } from "react-router-dom";
import { DEFAULT_POSTER_FALLBACK } from "../data/moviesData";

function MovieCard({ movie }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!movie) return null;

  const languagesText = Array.isArray(movie.languages) ? movie.languages.join(", ") : movie.languages || "";
  const genresText = Array.isArray(movie.genres) ? movie.genres.slice(0, 2).join(", ") : movie.genres || "";
  const ratingText = typeof movie.rating === "number" ? `${movie.rating}/10` : movie.rating;
  const certificate = movie.certificate || movie.certification;

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

        {ratingText && (
          <div className="bms-poster-rating">
            <span className="star">{isUpcoming ? "🔥" : "★"}</span>
            <span className="score">{ratingText}</span>
            {!isUpcoming && movie.votes && <span className="votes">{movie.votes}</span>}
          </div>
        )}

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
          {certificate && <span className="cert-pill">{certificate}</span>}
          <span className="genres-span">{genresText}</span>
        </div>

        {movie.formats && Array.isArray(movie.formats) && (
          <div className="card-formats-row">
            {movie.formats.map((fmt) => (
              <span key={fmt} className="format-tag-mini">{fmt}</span>
            ))}
          </div>
        )}

        <p className="bms-movie-lang">{languagesText}</p>
      </div>
    </Link>
  );
}

export default MovieCard;