import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import SeatSelection from "../Components/SeatSelection";

function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedShowtime, setSelectedShowtime] = useState(null);

  // Booking details
  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); // Replaced phone with email to match backend

  // Seat selection state
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);

  useEffect(() => {
    // Fetch movie
    fetch("http://localhost:8080/api/movies")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch movies");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          const found = data.find((m) => m.id == id);
          setMovie(found);
        }
      })
      .catch(err => console.error(err));

    // Fetch showtimes
    fetch(`http://localhost:8080/api/movies/${id}/showtimes`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch showtimes");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setShowtimes(data);
          if (data.length > 0) {
            setSelectedShowtime(data[0]);
          }
        }
      })
      .catch(err => console.error(err));
  }, [id]);

  if (!movie) {
    return <h2>Loading...</h2>;
  }

  // Total calculation
  const total = selectedShowtime ? (selectedSeatIds.length * selectedShowtime.ticketPrice).toFixed(2) : 0;

  const handleShowtimeChange = (e) => {
    const stId = parseInt(e.target.value);
    const st = showtimes.find(s => s.id === stId);
    setSelectedShowtime(st);
    setSelectedSeatIds([]); // Reset seats on showtime change
  };

  // Confirm Booking
  const confirmBooking = () => {
    if (!name || !email || !selectedShowtime || selectedSeatIds.length === 0) {
      Swal.fire("Please fill all details and select seats");
      return;
    }

    const bookingRequest = {
      customerName: name,
      customerEmail: email,
      showtimeId: selectedShowtime.id,
      seatIds: selectedSeatIds
    };

    fetch("http://localhost:8080/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingRequest)
    })
    .then(res => {
      if (!res.ok) throw new Error("Booking failed");
      return res.json();
    })
    .then(data => {
      Swal.fire(
        "Booking Successful!",
        `Your ticket is confirmed. Booking Ref: #${data.id}`,
        "success"
      );
      
      const bookingRecord = {
        bookingId: data.id,
        movie: movie,
        name: name,
        email: email,
        time: selectedShowtime.showTime,
        seats: data.seats ? data.seats.map(s => s.seatNumber) : [],
        total: data.totalAmount
      };

      const history = JSON.parse(localStorage.getItem("history")) || [];
      history.push(bookingRecord);
      localStorage.setItem("history", JSON.stringify(history));

      navigate("/bill", { state: bookingRecord });
    })
    .catch(err => {
      Swal.fire("Error", "Could not complete booking", "error");
    });
  };

  return (
    <div className="booking-container">
      <motion.div className="booking-card"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
      >
        <h2>Booking for {movie.title}</h2>
        <img src={movie.posterUrl} width="200" alt={movie.title} />

        {selectedShowtime && <h3>Price per seat: ₹{selectedShowtime.ticketPrice}</h3>}

        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <br />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />

        <select
          value={selectedShowtime ? selectedShowtime.id : ""}
          onChange={handleShowtimeChange}
        >
          {showtimes.map(st => (
            <option key={st.id} value={st.id}>
              {new Date(st.showTime).toLocaleString([], {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </option>
          ))}
        </select>
        <br />

        {selectedShowtime && (
          <SeatSelection
            showtimeId={selectedShowtime.id}
            price={selectedShowtime.ticketPrice}
            onSeatSelect={(seatIds) => setSelectedSeatIds(seatIds)}
          />
        )}

        <h2>Total: ₹{total}</h2>

        <button
          onClick={confirmBooking}
          style={{
            padding: "10px",
            background: "blue",
            color: "white",
            border: "none",
            borderRadius: "5px",
            marginTop: "10px",
            cursor: "pointer"
          }}
        >
          Confirm Booking
        </button>

      </motion.div>
    </div>
  );
}

export default Booking;