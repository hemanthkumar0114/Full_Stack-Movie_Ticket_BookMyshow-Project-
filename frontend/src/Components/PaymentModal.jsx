import { useState, useEffect } from "react";

function PaymentModal({
  isOpen,
  onClose,
  showtimeData,
  selectedSeats,
  onConfirmBooking,
  isProcessing
}) {
  const [userName, setUserName] = useState("Aarav Sharma");
  const [userEmail, setUserEmail] = useState("aarav.sharma@example.com");
  const [userPhone, setUserPhone] = useState("+91 9876543210");
  const [paymentMethod, setPaymentMethod] = useState("UPI (Google Pay / PhonePe)");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    if (!isOpen) return;
    setTimeLeft(300);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert("Your 5-minute seat reservation expired. Please select your seats again.");
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const ticketSubtotal = selectedSeats.reduce((acc, s) => acc + Number(s.price), 0);
  const convenienceFee = 35.0;
  const totalAmount = ticketSubtotal + convenienceFee;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = String(timeLeft % 60).padStart(2, "0");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) {
      alert("Please enter your name and email.");
      return;
    }

    onConfirmBooking({
      showtimeId: showtimeData.showtimeId,
      seatIds: selectedSeats.map((s) => s.seatId),
      userName,
      userEmail,
      userPhone,
      paymentMethod
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="payment-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="payment-modal-header">
          <div className="payment-title-group">
            <h3>💳 Quick Checkout</h3>
            <span className="lock-timer-badge">
              ⏳ Seat Lock Expires in: <strong>{minutes}:{seconds}</strong>
            </span>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="payment-form">
          <div className="payment-grid-layout">
            {/* Left: Customer Info & Payment Method */}
            <div className="payment-left-col">
              <h4>1. Contact Details (For M-Ticket delivery)</h4>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  placeholder="+91 Mobile number"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                />
              </div>

              <h4>2. Select Payment Mode</h4>
              <div className="payment-methods-list">
                {[
                  { id: "upi", label: "UPI (Google Pay / PhonePe / Paytm)", icon: "⚡" },
                  { id: "card", label: "Credit / Debit Card", icon: "💳" },
                  { id: "netbanking", label: "Net Banking (All Indian Banks)", icon: "🏦" },
                  { id: "wallet", label: "Apple Pay / Wallets", icon: "📱" }
                ].map((pm) => (
                  <label
                    key={pm.id}
                    className={`payment-method-card ${paymentMethod.includes(pm.id) ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={pm.label}
                      checked={paymentMethod === pm.label}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="pm-icon">{pm.icon}</span>
                    <span className="pm-label">{pm.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Right: Booking Summary Breakdown */}
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
                  <strong>{selectedSeats.map((s) => s.seatCode).join(", ")}</strong>
                </div>

                <hr className="summary-divider" />

                <div className="summary-price-row">
                  <span>Ticket Subtotal:</span>
                  <span>₹{ticketSubtotal.toFixed(2)}</span>
                </div>
                <div className="summary-price-row">
                  <span>Integrated GST & Convenience Fee:</span>
                  <span>₹{convenienceFee.toFixed(2)}</span>
                </div>

                <hr className="summary-divider" />

                <div className="summary-price-row summary-total-row">
                  <span>Total Amount Payable:</span>
                  <span className="total-highlight">₹{totalAmount.toFixed(2)}</span>
                </div>

                <button
                  type="submit"
                  className="confirm-pay-btn"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Confirming Booking..." : `Pay ₹${totalAmount.toFixed(2)} & Get Ticket`}
                </button>

                <p className="security-note">
                  🔒 256-bit SSL Encrypted & Secure Payment Gateway
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
