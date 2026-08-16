function CheckoutTray({ selectedSeats = [], onProceed, isLocking }) {
  if (selectedSeats.length === 0) return null;

  const ticketSubtotal = selectedSeats.reduce((acc, seat) => acc + Number(seat.price), 0);
  const convenienceFee = 35.0;
  const totalAmount = ticketSubtotal + convenienceFee;

  const seatCodes = selectedSeats.map((s) => s.seatCode).join(", ");

  return (
    <div className="bms-checkout-tray">
      <div className="checkout-tray-content">
        <div className="tray-left">
          <div className="tray-seats-badge">
            <span className="count">{selectedSeats.length}</span>
            <span className="label">{selectedSeats.length === 1 ? "Seat" : "Seats"}</span>
          </div>

          <div className="tray-details">
            <div className="tray-seat-codes" title={seatCodes}>
              <strong>{seatCodes}</strong>
            </div>
            <div className="tray-breakdown">
              <span>Tickets: ₹{ticketSubtotal.toFixed(2)}</span>
              <span className="divider">•</span>
              <span>Convenience Fee: ₹{convenienceFee.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="tray-right">
          <div className="tray-total-box">
            <span className="total-label">Total Payable</span>
            <span className="total-amount">₹{totalAmount.toFixed(2)}</span>
          </div>

          <button
            className="tray-pay-btn"
            onClick={onProceed}
            disabled={isLocking}
          >
            {isLocking ? "Holding Seats..." : `Proceed to Pay (₹${totalAmount.toFixed(2)})`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CheckoutTray;
