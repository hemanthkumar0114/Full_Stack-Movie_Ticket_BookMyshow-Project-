import { useState } from "react";
import { useCity } from "../hooks/useCity";

function CityModal() {
  const { isCityModalOpen, setIsCityModalOpen, selectedCity, changeCity, cities } = useCity();
  const [searchTerm, setSearchTerm] = useState("");

  if (!isCityModalOpen) return null;

  const popularCities = cities.filter((c) => c.popular);
  const filteredCities = cities.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={() => setIsCityModalOpen(false)}>
      <div className="city-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="city-modal-header">
          <h2>Select Your City</h2>
          <button className="close-btn" onClick={() => setIsCityModalOpen(false)}>✕</button>
        </div>

        <div className="city-search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search for your city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>

        {searchTerm === "" && (
          <div className="popular-cities-section">
            <h4>Popular Cities</h4>
            <div className="popular-cities-grid">
              {popularCities.map((city) => (
                <div
                  key={city.name}
                  className={`popular-city-card ${selectedCity === city.name ? "active" : ""}`}
                  onClick={() => changeCity(city.name)}
                >
                  <span className="city-icon">{city.icon}</span>
                  <span className="city-name">{city.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="all-cities-section">
          <h4>{searchTerm === "" ? "Other Cities" : "Search Results"}</h4>
          <div className="cities-list">
            {filteredCities.map((city) => (
              <div
                key={city.name}
                className={`city-list-item ${selectedCity === city.name ? "active" : ""}`}
                onClick={() => changeCity(city.name)}
              >
                <span className="city-icon">{city.icon}</span>
                <span className="city-name">{city.name}</span>
                <span className="city-state">{city.state}</span>
              </div>
            ))}
            {filteredCities.length === 0 && (
              <p className="no-cities">No cities found matching "{searchTerm}"</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CityModal;
