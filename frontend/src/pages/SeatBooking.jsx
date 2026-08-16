import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InteractiveSeatSelector from "../Components/InteractiveSeatSelector";
import CheckoutTray from "../Components/CheckoutTray";
import PaymentModal from "../Components/PaymentModal";
import TicketModal from "../Components/TicketModal";
import { api } from "../services/api";

function SeatBooking() {
  const { id } = useParams(); // showtimeId
  const navigate = useNavigate();

  const [seatMapData, setSeatMapData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Seat Lock & Checkout State
  const [isLocking, setIsLocking] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessingBooking, setIsProcessingBooking] = useState(false);
  const [confirmedTicket, setConfirmedTicket] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Fetch Seat Map
  const loadSeatMap = () => {
    setLoading(true);
    api.getShowtimeSeats(id)
      .then((data) => {
        setSeatMapData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading seat map:", err);
        setError("Could not load cinema seat layout.");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadSeatMap();
  }, [id]);

  // Toggle Seat Selection (shared across Grid and Interactive modes)
  const handleToggleSeat = (seatObj) => {
    if (seatObj.status === "BOOKED") return;

    setSelectedSeats((prev) => {
      const exists = prev.some((s) => s.seatId === seatObj.seatId);
      if (exists) {
        return prev.filter((s) => s.seatId !== seatObj.seatId);
      } else {
        if (prev.length >= 8) {
          alert("Maximum 8 seats can be booked in a single order.");
          return prev;
        }
        return [...prev, seatObj];
      }
    });
  };

  // Lock seats & open payment modal
  const handleProceedToPay = async () => {
    if (selectedSeats.length === 0) return;

    setIsLocking(true);
    try {
      const seatIds = selectedSeats.map((s) => s.seatId);
      const lockRes = await api.lockSeats(id, seatIds);

      if (lockRes.success) {
        setIsLocking(false);
        setIsPaymentModalOpen(true);
      } else {
        setIsLocking(false);
        alert(lockRes.message || "Failed to hold seats. Please select different seats.");
        loadSeatMap();
      }
    } catch (err) {
      setIsLocking(false);
      alert("Error holding seats. Please try again.");
    }
  };

  // Confirm booking & generate M-Ticket
  const handleConfirmBooking = async (formData) => {
    setIsProcessingBooking(true);
    try {
      const result = await api.confirmBooking(formData);
      setIsProcessingBooking(false);
      setIsPaymentModalOpen(false);

      // Save to localStorage history for offline access
      const localHistory = JSON.parse(localStorage.getItem("bms_booking_history")) || [];
      localHistory.unshift(result);
      localStorage.setItem("bms_booking_history", JSON.stringify(localHistory));

      setConfirmedTicket(result);
      setIsTicketModalOpen(true);
    } catch (err) {
      setIsProcessingBooking(false);
      alert(err.message || "Payment transaction could not be completed.");
    }
  };

  if (loading) {
    return (
      <div className="bms-loading-screen dark-bg">
        <div className="bms-spinner"></div>
        <h2>Loading Cinema Auditorium Layout...</h2>
        <p>Configuring tiered seating and seat allocations</p>
      </div>
    );
  }

  if (error || !seatMapData) {
    return (
      <div className="bms-error-screen dark-bg">
        <h2>⚠️ Seating Plan Unavailable</h2>
        <p>{error || "Unable to display seating layout."}</p>
        <button onClick={() => navigate(-1)} className="bms-btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="bms-booking-page">
      {/* Interactive & Tiered Cinema Seat Map */}
      <InteractiveSeatSelector
        seatMapData={seatMapData}
        selectedSeatIds={selectedSeats.map((s) => s.seatId)}
        onToggleSeat={handleToggleSeat}
      />

      {/* Sticky Bottom Checkout Tray */}
      <CheckoutTray
        selectedSeats={selectedSeats}
        onProceed={handleProceedToPay}
        isLocking={isLocking}
      />

      {/* 5-minute Seat Lock & Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        showtimeData={seatMapData}
        selectedSeats={selectedSeats}
        onConfirmBooking={handleConfirmBooking}
        isProcessing={isProcessingBooking}
      />

      {/* Digital M-Ticket Confirmation Modal */}
      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => {
          setIsTicketModalOpen(false);
          navigate("/history");
        }}
        ticketData={confirmedTicket}
      />
    </div>
  );
}

export default SeatBooking;
