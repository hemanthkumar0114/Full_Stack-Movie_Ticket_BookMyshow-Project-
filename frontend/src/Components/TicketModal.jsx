import { Link } from "react-router-dom";

function TicketModal({ isOpen, onClose, ticketData }) {
  if (!isOpen || !ticketData) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedTime = ticketData.showTime
    ? new Date(ticketData.showTime).toLocaleString([], {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      })
    : "N/A";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="ticket-modal-content" role="dialog" aria-modal="true" aria-label="Booking ticket" onClick={(e) => e.stopPropagation()}>
        <div className="ticket-modal-actions-top">
          <span className="success-badge">✅ Booking Confirmed!</span>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="m-ticket-card" id="printable-ticket">
          <div className="m-ticket-header">
            <div className="m-ticket-brand">
              <span className="brand-icon">🎬</span>
              <span className="brand-title">book<span className="red">my</span>show M-Ticket</span>
            </div>
            <div className="m-ticket-code">
              <span>Booking ID</span>
              <strong>#{ticketData.bookingCode}</strong>
            </div>
          </div>

          <div className="perforation-divider">
            <div className="notch notch-left"></div>
            <div className="dashed-line"></div>
            <div className="notch notch-right"></div>
          </div>

          <div className="m-ticket-body">
            <div className="ticket-main-grid">
              <img
                src={ticketData.posterUrl}
                alt={ticketData.movieTitle}
                className="ticket-movie-poster"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80";
                }}
              />

              <div className="ticket-details-col">
                <h2 className="ticket-movie-title">{ticketData.movieTitle}</h2>
                <p className="ticket-cinema-name">
                  <strong>{ticketData.cinemaName}</strong>
                </p>
                <p className="ticket-screen-info">
                  {ticketData.screenName} • {ticketData.formatType || "2D Dolby Atmos"}
                </p>

                <div className="ticket-meta-grid">
                  <div className="meta-box">
                    <span className="meta-lbl">Showtime</span>
                    <strong className="meta-val">{formattedTime}</strong>
                  </div>

                  <div className="meta-box">
                    <span className="meta-lbl">Seats ({ticketData.seatNumbers?.length || 1})</span>
                    <strong className="meta-val highlight-seats">
                      {ticketData.seatNumbers?.join(", ")}
                    </strong>
                  </div>

                  <div className="meta-box">
                    <span className="meta-lbl">Total Paid</span>
                    <strong className="meta-val price-val">₹{ticketData.totalAmount}</strong>
                  </div>

                  <div className="meta-box">
                    <span className="meta-lbl">Customer</span>
                    <strong className="meta-val">{ticketData.userName}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="perforation-divider">
            <div className="notch notch-left"></div>
            <div className="dashed-line"></div>
            <div className="notch notch-right"></div>
          </div>

          <div className="m-ticket-footer">
            <div className="barcode-box">
              <div className="barcode-visual">
                {Array.from({ length: 48 }).map((_, i) => (
                  <span
                    key={i}
                    style={{
                      width: i % 3 === 0 ? "3px" : i % 5 === 0 ? "1px" : "2px",
                      height: "36px",
                      backgroundColor: "#111",
                      display: "inline-block",
                      margin: "0 1px"
                    }}
                  />
                ))}
              </div>
              <span className="barcode-number">{ticketData.bookingCode} • TAP AT CINEMA GATE</span>
            </div>

            <p className="ticket-instructions">
              📱 Show this M-Ticket QR / Barcode at the cinema entrance for direct entry without paper ticket printing.
            </p>
          </div>
        </div>

        <div className="ticket-footer-actions">
          <button className="ticket-btn print-btn" onClick={handlePrint}>
            🖨️ Print / Download PDF
          </button>
          <Link to="/" className="ticket-btn home-btn" onClick={onClose}>
            🏠 Back to Movies
          </Link>
        </div>
      </div>
    </div>
  );
}

export default TicketModal;
