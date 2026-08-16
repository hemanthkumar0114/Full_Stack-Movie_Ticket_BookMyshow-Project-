import { createContext, useContext, useState, useEffect } from "react";

const CityContext = createContext();

export const CITIES = [
  { name: "Mumbai", state: "Maharashtra", icon: "🏙️", popular: true },
  { name: "Delhi-NCR", state: "Delhi", icon: "🏛️", popular: true },
  { name: "Bengaluru", state: "Karnataka", icon: "💻", popular: true },
  { name: "Hyderabad", state: "Telangana", icon: "💎", popular: true },
  { name: "New York", state: "United States", icon: "🗽", popular: true },
  { name: "London", state: "United Kingdom", icon: "🎡", popular: true },
  { name: "Chennai", state: "Tamil Nadu", icon: "🌊", popular: false },
  { name: "Pune", state: "Maharashtra", icon: "🏰", popular: false },
  { name: "Kolkata", state: "West Bengal", icon: "🚖", popular: false },
  { name: "Ahmedabad", state: "Gujarat", icon: "🪁", popular: false },
];

export function CityProvider({ children }) {
  const [selectedCity, setSelectedCity] = useState(() => {
    return localStorage.getItem("bms_selected_city") || "Mumbai";
  });

  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("bms_selected_city", selectedCity);
  }, [selectedCity]);

  const changeCity = (city) => {
    setSelectedCity(city);
    setIsCityModalOpen(false);
  };

  return (
    <CityContext.Provider
      value={{
        selectedCity,
        changeCity,
        isCityModalOpen,
        setIsCityModalOpen,
        cities: CITIES
      }}
    >
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error("useCity must be used within a CityProvider");
  }
  return context;
}
