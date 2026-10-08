import { Link } from "react-router-dom";

function CinemaVenueCard({ cinema }) {
  if (!cinema) return null;

  const facilitiesList = cinema.facilities
    ? cinema.facilities.split(",").map((f) => f.trim()).filter(Boolean)
    : [];

  return (
    <div className="bms-venue-card">
      <div className="venue-info-section">
        <div className="venue-header">
          <span className={`brand-badge brand-${cinema.brand?.toLowerCase() || "generic"}`}>
            {cinema.brand || "CINEMA"}
          </span>
          <h3 className="venue-name">{cinema.name}</h3>
        </div>

        <p className="venue-address">{cinema.locationAddress}</p>

        <div className="venue-facilities">
          {facilitiesList.map((fac) => (
            <span key={fac} className="facility-pill">
              {fac.includes("M-Ticket") ? "📱 " : fac.includes("Food") ? "🍿 " : fac.includes("Wheelchair") ? "♿ " : "✨ "}
              {fac}
            </span>
          ))}
        </div>
      </div>

      <div className="venue-showtimes-section">
        <div className="showtimes-grid">
          {cinema.showtimes.map((st) => {
            const timeObj = new Date(st.startTime);
            const formattedTime = timeObj.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true
            });

            const statusClass = (st.status || "AVAILABLE").toLowerCase().replace("_", "-");

            return (
              <div key={st.showtimeId} className="showtime-chip-wrapper">
                <Link
                  to={`/booking/${st.showtimeId}`}
                  className={`showtime-chip status-${statusClass}`}
                >
                  <span className="chip-time">{formattedTime}</span>
                  <span className="chip-format">{st.formatType}</span>
                </Link>
                <div className="chip-hover-tooltip">
                  <span>{st.screenName}</span>
                  <small>{st.soundType}</small>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CinemaVenueCard;
