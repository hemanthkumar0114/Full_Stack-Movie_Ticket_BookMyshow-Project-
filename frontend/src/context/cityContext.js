import { createContext } from "react";

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
  { name: "Ahmedabad", state: "Gujarat", icon: "🪁", popular: false }
];

export const CityContext = createContext(null);
