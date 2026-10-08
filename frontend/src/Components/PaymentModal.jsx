import { useEffect, useState } from "react";
import FormField from "./FormField";
import InlineAlert from "./InlineAlert";
import { useAuth } from "../hooks/useAuth";
import { useCountdown } from "../hooks/useCountdown";
import { formatCurrency } from "../utils/formatters";
import { hasErrors, validateOptionalPhone } from "../utils/validators";

const PAYMENT_METHODS = [
  { code: "UPI", label: "UPI (Google Pay / PhonePe / Paytm)", icon: "⚡" },
  { code: "CARD", label: "Credit / Debit Card", icon: "💳" },
  { code: "NET_BANKING", label: "Net Banking (All Indian Banks)", icon: "🏦" },
  { code: "WALLET", label: "Apple Pay / Wallets", icon: "📱" }
];

function PaymentModal({
  onClose,
  onExpire,
  showtimeData,
  selectedSeats,
  convenienceFee,
  lockSeconds,
  onConfirmBooking
}) {
  const { user } = useAuth();
  const [phone, setPhone] = useState(user?.phone || "");
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].code);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const secondsLeft = useCountdown(lockSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) onExpire();
  }, [secondsLeft, onExpire]);

  const ticketSubtotal = selectedSeats.reduce((total, seat) => total + Number(seat.price), 0);
  const totalAmount = ticketSubtotal + convenienceFee;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = { phone: validateOptionalPhone(phone) };
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setIsProcessing(true);
    setSubmitError("");
    try {
      await onConfirmBooking({ phone: phone.trim(), paymentMethod });
    } catch (error) {
      setSubmitError(error.message);
      setErrors(error.fieldErrors || {});
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="payment-modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="payment-modal-header">
          <div className="payment-title-group">
            <h3 id="payment-modal-title">💳 Quick Checkout</h3>
            <span className="lock-timer-badge">
              ⏳ Seat hold expires in: <strong>{minutes}:{seconds}</strong>
            </span>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close checkout">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="payment-form" noValidate>
          <div className="payment-grid-layout">
            <div className="payment-left-col">
              <h4>1. Contact details</h4>
              <p className="booking-as">
                Booking as <strong>{user?.name}</strong> ({user?.email})
              </p>

              <FormField
                id="payment-phone"
                name="phone"
                type="tel"
                label="Mobile number (optional)"
                placeholder="+91 Mobile number"
                autoComplete="tel"
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                  setErrors({});
                }}
                error={errors.phone}
              />

              <h4>2. Select payment mode</h4>
              <div className="payment-methods-list">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.code}
                    className={`payment-method-card ${paymentMethod === method.code ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.code}
                      checked={paymentMethod === method.code}
                      onChange={() => setPaymentMethod(method.code)}
                    />
                    <span className="pm-icon">{method.icon}</span>
                    <span className="pm-label">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="payment-right-col">
              <div className="booking-summary-card">
                <h4>Order Summary</h4>
                <div className="summary-movie-info">
                  <h5>{showtimeData.movieTitle}</h5>
                  <p>{showtimeData.cinemaName} - {showtimeData.screenName}</p>
                  <p className="summary-time">
                    {new Date(showtimeData.startTime).toLocaleString([], {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })}
                  </p>
                </div>

                <div className="summary-seats-row">
                  <span>Seats ({selectedSeats.length}):</span>
                  <strong>{selectedSeats.map((seat) => seat.seatCode).join(", ")}</strong>
                </div>

                <hr className="summary-divider" />

                <div className="summary-price-row">
                  <span>Ticket subtotal:</span>
                  <span>{formatCurrency(ticketSubtotal)}</span>
                </div>
                <div className="summary-price-row">
                  <span>Convenience fee:</span>
                  <span>{formatCurrency(convenienceFee)}</span>
                </div>

                <hr className="summary-divider" />

                <div className="summary-price-row summary-total-row">
                  <span>Total payable:</span>
                  <span className="total-highlight">{formatCurrency(totalAmount)}</span>
                </div>

                <InlineAlert message={submitError} onDismiss={() => setSubmitError("")} />

                <button type="submit" className="confirm-pay-btn" disabled={isProcessing}>
                  {isProcessing ? "Confirming booking..." : `Pay ${formatCurrency(totalAmount)} & get ticket`}
                </button>

                <p className="security-note">
                  Demo checkout: no real payment is taken. The total is recalculated on the server.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PaymentModal;
