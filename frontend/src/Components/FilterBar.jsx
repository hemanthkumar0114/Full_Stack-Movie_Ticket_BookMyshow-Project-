function FilterBar({ selectedFormat, onFormatChange, selectedPriceRange, onPriceChange }) {
  const formats = ["ALL FORMATS", "IMAX 2D", "4DX 3D", "2D Dolby Atmos", "VIP Luxe"];
  const priceRanges = ["ALL PRICES", "0-200", "201-350", "351+"];

  return (
    <div className="bms-filter-bar">
      <div className="filter-group">
        <span className="filter-label">Format:</span>
        <div className="filter-chips">
          {formats.map((fmt) => (
            <button
              key={fmt}
              className={`filter-chip ${selectedFormat === fmt ? "active" : ""}`}
              onClick={() => onFormatChange(fmt)}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-label">Price:</span>
        <div className="filter-chips">
          {priceRanges.map((pr) => (
            <button
              key={pr}
              className={`filter-chip ${selectedPriceRange === pr ? "active" : ""}`}
              onClick={() => onPriceChange(pr)}
            >
              {pr === "ALL PRICES" ? pr : `₹${pr}`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FilterBar;
