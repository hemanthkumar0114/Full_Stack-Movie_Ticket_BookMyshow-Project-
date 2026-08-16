function TrailerModal({ isOpen, onClose, trailerUrl, movieTitle }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="trailer-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="trailer-header">
          <h3>🎬 {movieTitle} - Official Trailer</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="video-responsive">
          <iframe
            src={trailerUrl ? `${trailerUrl}?autoplay=1` : "https://www.youtube.com/embed/zSWdZVtXT7E?autoplay=1"}
            title={`${movieTitle} Trailer`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
}

export default TrailerModal;
