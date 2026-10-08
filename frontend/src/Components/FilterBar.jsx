const FORMATS = ["ALL FORMATS", "IMAX 2D", "4DX 3D", "2D Dolby Atmos", "VIP Luxe"];

function FilterBar({ selectedFormat, onFormatChange }) {
  return (
    <div className="bms-filter-bar">
      <div className="filter-group">
        <span className="filter-label">Format:</span>
        <div className="filter-chips">
          {FORMATS.map((format) => (
            <button
              type="button"
              key={format}
              className={`filter-chip ${selectedFormat === format ? "active" : ""}`}
              onClick={() => onFormatChange(format)}
            >
              {format}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FilterBar;
