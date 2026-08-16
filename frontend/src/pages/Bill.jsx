import { useLocation, Link } from "react-router-dom";

function Bill() {
  const location = useLocation();
  const data = location.state;

  if (!data) {
    return (
      <div className="bill-container" style={{ textAlign: "center", padding: "40px" }}>
        <h2>No Booking Found</h2>
        <p>Please select a movie and complete a booking first.</p>
        <Link to="/">
          <button style={{ marginTop: "20px", padding: "10px 20px", cursor: "pointer" }}>Go Home</button>
        </Link>
      </div>
    );
  }

  const movieTitle = data.movie?.title || data.movie?.name || "Movie Ticket";
  const moviePoster = data.movie?.posterUrl || data.movie?.image || "";
  const seatList = Array.isArray(data.seats) ? data.seats.join(", ") : (data.seats || "N/A");
  const formattedTime = data.time
    ? new Date(data.time).toLocaleString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : data.date || "N/A";

  return (
    <div className="bill-container">
      <h1>🎬 Movie Ticket Bill</h1>

      {moviePoster && (
        <img
          src={moviePoster}
          width="200"
          alt={movieTitle}
          style={{ borderRadius: "8px", margin: "10px auto", display: "block" }}
        />
      )}

      <h2>{movieTitle}</h2>

      <p><strong>Booking ID:</strong> #{data.bookingId}</p>
      <p><strong>Name:</strong> {data.name}</p>
      {data.email && <p><strong>Email:</strong> {data.email}</p>}
      {data.phone && <p><strong>Phone:</strong> {data.phone}</p>}
      <p><strong>Showtime:</strong> {formattedTime}</p>
      <p><strong>Seats:</strong> {seatList}</p>
      {data.tickets && <p><strong>Tickets:</strong> {data.tickets}</p>}
      {data.payment && <p><strong>Payment:</strong> {data.payment}</p>}

      <h2>Total: ₹{data.total}</h2>

      <Link to="/">
        <button style={{ padding: "10px 20px", cursor: "pointer", borderRadius: "5px", marginTop: "15px" }}>
          Go Home
        </button>
      </Link>
    </div>
  );
}

export default Bill;