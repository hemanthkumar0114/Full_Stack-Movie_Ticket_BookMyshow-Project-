import { useState, useEffect } from "react";

function SeatSelection({ showtimeId, price, onSeatSelect }) {
  const [seats, setSeats] = useState([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);

  useEffect(() => {
    if (!showtimeId) return;
    fetch(`http://localhost:8080/api/showtimes/${showtimeId}/seats`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch seats");
        return res.json();
      })
      .then(data => {
        if (data && Array.isArray(data.seats)) {
          setSeats(data.seats);
        } else {
          setSeats([]);
        }
        setSelectedSeatIds([]);
        onSeatSelect([]);
      })
      .catch(err => console.error(err));
  }, [showtimeId]);

  const toggleSeat = (seatId) => {
    let updated;
    if (selectedSeatIds.includes(seatId)) {
      updated = selectedSeatIds.filter(id => id !== seatId);
    } else {
      updated = [...selectedSeatIds, seatId];
    }
    setSelectedSeatIds(updated);
    onSeatSelect(updated); // Pass IDs back up
  };

  return (
    <div className="seat-selection-box">
      <h3>Select Seats</h3>

      {/* Adding a dynamic grid style since there are 20 seats instead of 9 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '5px', margin: '15px 0' }}>
        {seats.map((seat) => (
          <button
            key={seat.id}
            onClick={() => toggleSeat(seat.id)}
            disabled={seat.isBooked}
            className={
              selectedSeatIds.includes(seat.id)
                ? "seat selected"
                : "seat"
            }
            style={{
              padding: '10px 5px',
              backgroundColor: seat.isBooked ? '#ccc' : selectedSeatIds.includes(seat.id) ? '#4caf50' : '#fff',
              color: seat.isBooked ? '#666' : '#000',
              border: '1px solid #999',
              borderRadius: '4px',
              cursor: seat.isBooked ? 'not-allowed' : 'pointer',
              opacity: seat.isBooked ? 0.6 : 1
            }}
          >
            {seat.seatNumber}
          </button>
        ))}
      </div>

      <div className="seat-info">
        <h4>Total Seats: {selectedSeatIds.length}</h4>
        <h4>
          Total Price: ₹{(selectedSeatIds.length * price).toFixed(2)}
        </h4>
      </div>
    </div>
  );
}

export default SeatSelection;