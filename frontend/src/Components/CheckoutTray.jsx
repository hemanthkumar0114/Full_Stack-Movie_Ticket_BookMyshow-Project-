import { formatCurrency } from "../utils/formatters";

function CheckoutTray({ selectedSeats = [], convenienceFee = 0, onProceed, isLocking }) {
  if (selectedSeats.length === 0) return null;

  const ticketSubtotal = selectedSeats.reduce((total, seat) => total + Number(seat.price), 0);
  const totalAmount = ticketSubtotal + convenienceFee;
  const seatCodes = selectedSeats.map((seat) => seat.seatCode).join(", ");

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
              <span>Tickets: {formatCurrency(ticketSubtotal)}</span>
              <span className="divider">•</span>
              <span>Convenience fee: {formatCurrency(convenienceFee)}</span>
            </div>
          </div>
        </div>

        <div className="tray-right">
          <div className="tray-total-box">
            <span className="total-label">Total Payable</span>
            <span className="total-amount">{formatCurrency(totalAmount)}</span>
          </div>

          <button type="button" className="tray-pay-btn" onClick={onProceed} disabled={isLocking}>
            {isLocking ? "Holding seats..." : `Proceed to pay (${formatCurrency(totalAmount)})`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CheckoutTray;
