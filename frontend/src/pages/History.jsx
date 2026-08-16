import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import TicketModal from "../Components/TicketModal";
import { api } from "../services/api";

function History() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    // 1. First load local bookings from localStorage
    const localBookings = JSON.parse(localStorage.getItem("bms_booking_history")) || [];

    // 2. Fetch server bookings
    api.getBookingHistory()
      .then((serverBookings) => {
        // Merge without duplicates based on bookingCode
        const combined = [...localBookings];
        if (Array.isArray(serverBookings)) {
          serverBookings.forEach((sb) => {
            if (!combined.some((cb) => cb.bookingCode === sb.bookingCode)) {
              combined.push(sb);
            }
          });
        }
        setBookings(combined);
        setLoading(false);
      })
      .catch(() => {
        // Fallback to local bookings
        setBookings(localBookings);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bms-history-page">
      <div className="history-page-header">
        <h1>🎟️ Your Bookings & M-Tickets</h1>
        <p>Access your confirmed cinema passes, seat allocations, and entry barcodes</p>
      </div>

      {loading ? (
        <div className="bms-loading-screen">
          <div className="bms-spinner"></div>
          <h2>Fetching Your Ticket History...</h2>
        </div>
      ) : bookings.length === 0 ? (
        <div className="empty-history-box">
          <div className="empty-icon">🎟️</div>
          <h3>No Bookings Found</h3>
          <p>You haven't booked any movie tickets yet. Start exploring the latest blockbusters!</p>
          <Link to="/" className="bms-btn-primary">
            Explore Now Showing Movies
          </Link>
        </div>
      ) : (
        <div className="history-tickets-grid">
          {bookings.map((booking, idx) => {
            const formattedDate = booking.showTime
              ? new Date(booking.showTime).toLocaleString([], {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true
                })
              : booking.bookingTime || "Confirmed";

            return (
              <div key={booking.bookingCode || idx} className="history-ticket-card">
                <div className="ticket-card-top">
                  <div className="movie-poster-thumb">
                    {booking.posterUrl ? (
                      <img
                        src={booking.posterUrl}
                        alt={booking.movieTitle}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80";
                        }}
                      />
                    ) : (
                      <div className="poster-placeholder">🎬</div>
                    )}
                  </div>

                  <div className="ticket-card-info">
                    <span className="booking-status-tag">CONFIRMED</span>
                    <h3>{booking.movieTitle || "Movie Ticket"}</h3>
                    <p className="card-cinema">{booking.cinemaName}</p>
                    <p className="card-screen">{booking.screenName} • {booking.formatType || "2D Dolby Atmos"}</p>

                    <div className="card-meta-row">
                      <div>
                        <span className="meta-k">Date & Time</span>
                        <strong className="meta-v">{formattedDate}</strong>
                      </div>
                      <div>
                        <span className="meta-k">Seats</span>
                        <strong className="meta-v highlight-seats">
                          {booking.seatNumbers ? booking.seatNumbers.join(", ") : "N/A"}
                        </strong>
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

                  <button
                    className="view-ticket-btn"
                    onClick={() => setSelectedTicket(booking)}
                  >
                    📱 View M-Ticket
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Modal */}
      <TicketModal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        ticketData={selectedTicket}
      />
    </div>
  );
}

export default History;