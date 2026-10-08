import { useEffect, useMemo, useState } from "react";
import { CITIES, CityContext } from "./cityContext";

function readStoredCity() {
  try {
    return window.localStorage.getItem("bms_selected_city") || "Mumbai";
  } catch {
    return "Mumbai";
  }
}

export function CityProvider({ children }) {
  const [selectedCity, setSelectedCity] = useState(readStoredCity);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem("bms_selected_city", selectedCity);
    } catch {
      return;
    }
  }, [selectedCity]);

  const value = useMemo(
    () => ({
      selectedCity,
      changeCity: (city) => {
        setSelectedCity(city);
        setIsCityModalOpen(false);
      },
      isCityModalOpen,
      setIsCityModalOpen,
      cities: CITIES
    }),
    [selectedCity, isCityModalOpen]
  );

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
}
