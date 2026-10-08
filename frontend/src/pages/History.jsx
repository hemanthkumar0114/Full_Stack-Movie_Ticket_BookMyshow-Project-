import { useState } from "react";
import { Link } from "react-router-dom";
import TicketModal from "../Components/TicketModal";
import LoadingState from "../Components/LoadingState";
import ErrorState from "../Components/ErrorState";
import { useAsync } from "../hooks/useAsync";
import { api } from "../services/api";

const POSTER_FALLBACK =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80";

function formatShowTime(value) {
  if (!value) return "Confirmed";
  return new Date(value).toLocaleString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

function History() {
  const { data: bookings, error, loading, retry } = useAsync(() => api.getMyBookings(), []);
  const [selectedTicket, setSelectedTicket] = useState(null);

  return (
    <div className="bms-history-page">
      <div className="history-page-header">
        <h1>🎟️ Your Bookings & M-Tickets</h1>
        <p>Access your confirmed cinema passes, seat allocations, and entry barcodes</p>
      </div>

      {loading && <LoadingState title="Fetching your tickets..." />}

      {!loading && error && (
        <ErrorState title="Could not load your bookings" message={error.message} onRetry={retry} />
      )}

      {!loading && !error && bookings?.length === 0 && (
        <div className="empty-history-box">
          <div className="empty-icon">🎟️</div>
          <h3>No Bookings Found</h3>
          <p>You haven't booked any movie tickets yet. Start exploring the latest blockbusters!</p>
          <Link to="/" className="bms-btn-primary">
            Explore Now Showing Movies
          </Link>
        </div>
      )}

      {!loading && !error && bookings?.length > 0 && (
        <div className="history-tickets-grid">
          {bookings.map((booking) => (
            <div key={booking.bookingCode} className="history-ticket-card">
              <div className="ticket-card-top">
                <div className="movie-poster-thumb">
                  {booking.posterUrl ? (
                    <img
                      src={booking.posterUrl}
                      alt={booking.movieTitle}
                      onError={(event) => {
                        event.target.onerror = null;
                        event.target.src = POSTER_FALLBACK;
                      }}
                    />
                  ) : (
                    <div className="poster-placeholder">🎬</div>
                  )}
                </div>

                <div className="ticket-card-info">
                  <span className="booking-status-tag">{booking.bookingStatus}</span>
                  <h3>{booking.movieTitle}</h3>
                  <p className="card-cinema">{booking.cinemaName}</p>
                  <p className="card-screen">{booking.screenName} • {booking.formatType}</p>

                  <div className="card-meta-row">
                    <div>
                      <span className="meta-k">Date & Time</span>
                      <strong className="meta-v">{formatShowTime(booking.showTime)}</strong>
                    </div>
                    <div>
                      <span className="meta-k">Seats</span>
                      <strong className="meta-v highlight-seats">{booking.seatNumbers.join(", ")}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="ticket-card-bottom">
                <div className="card-code-section">
                  <span className="code-lbl">Booking Ref</span>
                  <span className="code-val">#{booking.bookingCode}</span>
                </div>

                <div className="card-amount-section">
                  <span className="amount-lbl">Total Amount</span>
                  <span className="amount-val">₹{booking.totalAmount}</span>
                </div>

                <button type="button" className="view-ticket-btn" onClick={() => setSelectedTicket(booking)}>
                  📱 View M-Ticket
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TicketModal
        isOpen={Boolean(selectedTicket)}
        onClose={() => setSelectedTicket(null)}
        ticketData={selectedTicket}
      />
    </div>
  );
}

export default History;
