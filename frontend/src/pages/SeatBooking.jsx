import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InteractiveSeatSelector from "../Components/InteractiveSeatSelector";
import CheckoutTray from "../Components/CheckoutTray";
import PaymentModal from "../Components/PaymentModal";
import TicketModal from "../Components/TicketModal";
import LoadingState from "../Components/LoadingState";
import ErrorState from "../Components/ErrorState";
import InlineAlert from "../Components/InlineAlert";
import { useAsync } from "../hooks/useAsync";
import { api } from "../services/api";

const DEFAULT_MAX_SEATS = 8;

function SeatBooking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: seatMapData, error, loading, retry: reloadSeatMap } = useAsync(
    () => api.getShowtimeSeats(id),
    [id]
  );

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [notice, setNotice] = useState(null);
  const [isLocking, setIsLocking] = useState(false);
  const [lock, setLock] = useState(null);
  const [confirmedTicket, setConfirmedTicket] = useState(null);

  const maxSeats = seatMapData?.maxSeatsPerBooking ?? DEFAULT_MAX_SEATS;
  const convenienceFee = Number(seatMapData?.convenienceFee ?? 0);

  const resetSelection = (message, variant = "error") => {
    setLock(null);
    setSelectedSeats([]);
    setNotice({ variant, message });
    reloadSeatMap();
  };

  const handleToggleSeat = (seat) => {
    const heldByAnotherUser = seat.status === "LOCKED" && !seat.isLockedByMe;
    if (seat.status === "BOOKED" || heldByAnotherUser) return;

    setNotice(null);
    const alreadySelected = selectedSeats.some((selected) => selected.seatId === seat.seatId);

    if (alreadySelected) {
      setSelectedSeats(selectedSeats.filter((selected) => selected.seatId !== seat.seatId));
      return;
    }
    if (selectedSeats.length >= maxSeats) {
      setNotice({ variant: "info", message: `You can select up to ${maxSeats} seats in one order.` });
      return;
    }
    setSelectedSeats([...selectedSeats, seat]);
  };

  const handleProceedToPay = async () => {
    if (selectedSeats.length === 0) return;

    setIsLocking(true);
    setNotice(null);
    try {
      const result = await api.lockSeats(id, selectedSeats.map((seat) => seat.seatId));
      setLock({ id: Date.now(), expiresInSeconds: result.expiresInSeconds });
    } catch (lockError) {
      if (lockError.status === 400 || lockError.status === 409) {
        resetSelection(lockError.message);
      } else {
        setNotice({ variant: "error", message: lockError.message });
      }
    } finally {
      setIsLocking(false);
    }
  };

  const handleConfirmBooking = async ({ phone, paymentMethod }) => {
    try {
      const ticket = await api.createBooking({
        showtimeId: Number(id),
        seatIds: selectedSeats.map((seat) => seat.seatId),
        phone,
        paymentMethod
      });
      setLock(null);
      setSelectedSeats([]);
      setConfirmedTicket(ticket);
    } catch (bookingError) {
      if (bookingError.status === 409) {
        resetSelection(bookingError.message);
        return;
      }
      throw bookingError;
    }
  };

  const handleLockExpired = () => {
    resetSelection("Your seat hold expired. Please select your seats again.", "info");
  };

  if (loading) {
    return <LoadingState dark title="Loading seat layout..." subtitle="Fetching live seat availability" />;
  }

  if (error || !seatMapData) {
    return (
      <ErrorState
        dark
        title="Seating plan unavailable"
        message={error?.message || "Unable to display the seating layout."}
        onRetry={reloadSeatMap}
      >
        <button type="button" onClick={() => navigate(-1)} className="bms-btn-primary">
          Go Back
        </button>
      </ErrorState>
    );
  }

  return (
    <div className="bms-booking-page">
      <InlineAlert message={notice?.message} variant={notice?.variant} onDismiss={() => setNotice(null)} />

      <InteractiveSeatSelector
        seatMapData={seatMapData}
        selectedSeatIds={selectedSeats.map((seat) => seat.seatId)}
        onToggleSeat={handleToggleSeat}
      />

      <CheckoutTray
        selectedSeats={selectedSeats}
        convenienceFee={convenienceFee}
        onProceed={handleProceedToPay}
        isLocking={isLocking}
      />

      {lock && (
        <PaymentModal
          key={lock.id}
          onClose={() => resetSelection("Seat hold released. You can pick your seats again.", "info")}
          onExpire={handleLockExpired}
          showtimeData={seatMapData}
          selectedSeats={selectedSeats}
          convenienceFee={convenienceFee}
          lockSeconds={lock.expiresInSeconds}
          onConfirmBooking={handleConfirmBooking}
        />
      )}

      <TicketModal
        isOpen={Boolean(confirmedTicket)}
        onClose={() => {
          setConfirmedTicket(null);
          navigate("/history");
        }}
        ticketData={confirmedTicket}
      />
    </div>
  );
}

export default SeatBooking;
