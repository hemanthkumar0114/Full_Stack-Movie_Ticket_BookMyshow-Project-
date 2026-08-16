function DateStrip({ selectedDate, onDateChange }) {
  // Generate 7 consecutive days starting today
  const days = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const isoDate = `${year}-${month}-${day}`;

    const dayName = i === 0 ? "TODAY" : i === 1 ? "TOM" : d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
    const dateNum = d.getDate();
    const monthName = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();

    days.push({
      isoDate,
      dayName,
      dateNum,
      monthName,
      isToday: i === 0
    });
  }

  return (
    <div className="bms-date-strip-container">
      <div className="bms-date-strip">
        {days.map((item) => (
          <button
            key={item.isoDate}
            className={`bms-date-pill ${selectedDate === item.isoDate ? "active" : ""}`}
            onClick={() => onDateChange(item.isoDate)}
          >
            <span className="pill-day">{item.dayName}</span>
            <span className="pill-date">{item.dateNum}</span>
            <span className="pill-month">{item.monthName}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default DateStrip;
