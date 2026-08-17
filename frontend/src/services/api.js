import { MOVIES_DATA, DEFAULT_POSTER_FALLBACK } from "../data/moviesData";

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";
/**
 * Generates or retrieves a unique session ID for atomic seat reservations.
 */
export function getSessionId() {
  let sid = sessionStorage.getItem("bms_session_id");
  if (!sid) {
    sid = "sess_" + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    sessionStorage.setItem("bms_session_id", sid);
  }
  return sid;
}

export const api = {
  /**
   * Fetch movies filtered by category (all, now_showing, upcoming, top_rated, trending)
   */
  async getNowPlayingMovies(category = "all") {
    try {
      const res = await fetch(`${BASE_URL}/movies/now-playing`);
      if (!res.ok) throw new Error("Server not reachable");
      const serverMovies = await res.json();

      if (Array.isArray(serverMovies) && serverMovies.length > 0) {
        const enriched = MOVIES_DATA.map((localMovie) => {
          const serverMatch = serverMovies.find((sm) => sm.id === localMovie.id);
          return serverMatch
            ? { ...localMovie, ...serverMatch, formats: localMovie.formats, category: localMovie.category }
            : localMovie;
        });
        return filterByCategory(enriched, category);
      }
      return filterByCategory(MOVIES_DATA, category);
    } catch (err) {
      return filterByCategory(MOVIES_DATA, category);
    }
  },

  /**
   * Fetch detailed information for a single movie
   */
  async getMovieDetails(movieId) {
    const numericId = parseInt(movieId, 10);
    const localMatch = MOVIES_DATA.find((m) => m.id === numericId) || MOVIES_DATA[0];

    try {
      const res = await fetch(`${BASE_URL}/movies/${numericId}/details`);
      if (!res.ok) return localMatch;
      const serverData = await res.json();
      return { ...localMatch, ...serverData };
    } catch (err) {
      return localMatch;
    }
  },

  /**
   * Search movies by title, language, or genre
   */
  async searchMovies(query) {
    if (!query || !query.trim()) return MOVIES_DATA.slice(0, 5);
    const q = query.toLowerCase().trim();

    try {
      const res = await fetch(`${BASE_URL}/movies/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const serverResults = await res.json();
        if (Array.isArray(serverResults) && serverResults.length > 0) return serverResults;
      }
    } catch (e) {
      // Fallback to local filtering
    }

    return MOVIES_DATA.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        (m.languages && m.languages.toLowerCase().includes(q)) ||
        (m.genres && m.genres.some((g) => g.toLowerCase().includes(q)))
    );
  },

  /**
   * Fetch cinemas and auditorium showtimes for a specific movie, city, and date
   */
  async getCinemasAndShowtimes(movieId, city, date) {
    try {
      const url = new URL(`${BASE_URL}/cinemas`);
      url.searchParams.append("movieId", movieId);
      if (city) url.searchParams.append("city", city);
      if (date) url.searchParams.append("date", date);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to load showtimes from server");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
      throw new Error("Empty showtimes response");
    } catch (err) {
      return generateMockVenues(movieId, city || "Mumbai", date);
    }
  },

  /**
   * Fetch tiered seat map and occupancy status for a showtime
   */
  async getShowtimeSeats(showtimeId) {
    const sessionId = getSessionId();
    try {
      const res = await fetch(`${BASE_URL}/showtimes/${showtimeId}/seats?sessionId=${sessionId}`);
      if (!res.ok) throw new Error("Failed to load seat layout");
      return await res.json();
    } catch (err) {
      return generateMockSeatLayout(showtimeId);
    }
  },

  /**
   * Lock selected seats for 5 minutes to prevent race conditions
   */
  async lockSeats(showtimeId, seatIds) {
    const sessionId = getSessionId();
    try {
      const res = await fetch(`${BASE_URL}/bookings/lock-seats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showtimeId: parseInt(showtimeId, 10),
          seatIds,
          sessionId
        })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // Local fallback
    }

    return {
      success: true,
      message: "Seats reserved for 5 minutes.",
      sessionId,
      lockedSeatIds: seatIds,
      lockExpiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    };
  },

  /**
   * Confirm booking transaction and generate digital M-Ticket
   */
  async confirmBooking(bookingData) {
    const sessionId = getSessionId();
    try {
      const res = await fetch(`${BASE_URL}/bookings/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...bookingData,
          sessionId
        })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // Instant client-side M-Ticket generation fallback
    }

    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return {
      bookingId: Date.now(),
      bookingCode: `BMS-${randomNum}`,
      movieTitle: bookingData.movieTitle || "Kalki 2898 AD",
      posterUrl: bookingData.posterUrl || MOVIES_DATA[0].posterUrl,
      cinemaName: bookingData.cinemaName || "PVR ICON: Phoenix Palladium",
      screenName: bookingData.screenName || "Audi 1 - IMAX with Laser",
      soundType: "IMAX 12.1 Immersive Sound",
      formatType: "IMAX 3D",
      showTime: bookingData.showTime || new Date().toISOString(),
      userName: bookingData.userName || "Customer",
      userEmail: bookingData.userEmail || "user@bookmyshow.com",
      userPhone: bookingData.userPhone || "+91 9876543210",
      seatNumbers: bookingData.seatNumbers || ["A1", "A2"],
      ticketSubtotal: bookingData.ticketSubtotal || 900,
      convenienceFee: 35,
      totalAmount: (bookingData.ticketSubtotal || 900) + 35,
      paymentMethod: bookingData.paymentMethod || "UPI (Google Pay)",
      bookingStatus: "CONFIRMED",
      bookingTime: new Date().toLocaleString()
    };
  },

  /**
   * Fetch digital ticket history
   */
  async getBookingHistory(email) {
    try {
      const url = email ? `${BASE_URL}/bookings/history?email=${encodeURIComponent(email)}` : `${BASE_URL}/bookings/history`;
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch (e) {
      // Local fallback
    }
    return JSON.parse(localStorage.getItem("bms_booking_history")) || [];
  }
};

/**
 * Filter helper for movie categories
 */
function filterByCategory(movies, category) {
  if (category === "now_showing") {
    return movies.filter((m) => m.category === "now_showing");
  }
  if (category === "upcoming") {
    return movies.filter((m) => m.category === "upcoming");
  }
  if (category === "top_rated") {
    return [...movies].sort((a, b) => (b.numericRating || 0) - (a.numericRating || 0));
  }
  if (category === "trending") {
    return movies.filter((m) => m.isTrending);
  }
  return movies;
}

/**
 * Mock Venues Generator for Offline / Fallback Support
 */
function generateMockVenues(movieId, city, date) {
  const m = MOVIES_DATA.find((x) => x.id === parseInt(movieId, 10)) || MOVIES_DATA[0];
  const currentDate = date || new Date().toISOString().split("T")[0];

  return [
    {
      cinemaId: 1,
      name: "PVR ICON: Phoenix Palladium",
      brand: "PVR",
      city: city,
      locationAddress: "462, Senapati Bapat Marg, Lower Parel",
      facilities: "M-Ticket, Food & Beverage, Recliners, Valet Parking",
      showtimes: [
        { showtimeId: 101, startTime: `${currentDate}T10:30:00`, formatType: "IMAX 3D", screenName: "Audi 1 - IMAX Laser", soundType: "IMAX 12.1", status: "AVAILABLE" },
        { showtimeId: 102, startTime: `${currentDate}T14:15:00`, formatType: "IMAX 3D", screenName: "Audi 1 - IMAX Laser", soundType: "IMAX 12.1", status: "FAST_FILLING" },
        { showtimeId: 103, startTime: `${currentDate}T18:00:00`, formatType: "IMAX 3D", screenName: "Audi 1 - IMAX Laser", soundType: "IMAX 12.1", status: "ALMOST_FULL" },
        { showtimeId: 104, startTime: `${currentDate}T21:45:00`, formatType: "2D Dolby Atmos", screenName: "Audi 2 - P[XL]", soundType: "Dolby Atmos 7.1", status: "AVAILABLE" }
      ]
    },
    {
      cinemaId: 2,
      name: "INOX: Megaplex Inorbit Mall",
      brand: "INOX",
      city: city,
      locationAddress: "Link Road, Malad West",
      facilities: "M-Ticket, F&B, IMAX Laser, Wheelchair Access",
      showtimes: [
        { showtimeId: 105, startTime: `${currentDate}T13:00:00`, formatType: "4DX 3D", screenName: "Audi 1 - 4DX", soundType: "Dolby Atmos", status: "AVAILABLE" },
        { showtimeId: 106, startTime: `${currentDate}T17:30:00`, formatType: "4DX 3D", screenName: "Audi 1 - 4DX", soundType: "Dolby Atmos", status: "FAST_FILLING" }
      ]
    },
    {
      cinemaId: 3,
      name: "Cinepolis: Grand Central Mall",
      brand: "Cinepolis",
      city: city,
      locationAddress: "Sector 40, Seawoods Grand Central",
      facilities: "M-Ticket, F&B, VIP Lounge",
      showtimes: [
        { showtimeId: 107, startTime: `${currentDate}T12:00:00`, formatType: "2D Dolby Atmos", screenName: "Audi 3 - VIP Luxe", soundType: "Dolby Atmos 7.1", status: "AVAILABLE" },
        { showtimeId: 108, startTime: `${currentDate}T19:15:00`, formatType: "2D Dolby Atmos", screenName: "Audi 3 - VIP Luxe", soundType: "Dolby Atmos 7.1", status: "ALMOST_FULL" }
      ]
    }
  ];
}

/**
 * Mock Tiered Seat Map Generator
 */
function generateMockSeatLayout(showtimeId) {
  const rows = [
    { name: "A", tier: "RECLINER", price: 450.00, count: 10 },
    { name: "B", tier: "PRIME", price: 280.00, count: 10 },
    { name: "C", tier: "PRIME", price: 280.00, count: 10 },
    { name: "D", tier: "PRIME", price: 280.00, count: 10 },
    { name: "E", tier: "CLASSIC", price: 180.00, count: 10 },
    { name: "F", tier: "CLASSIC", price: 180.00, count: 10 }
  ];

  let seatCounter = 1;
  const tiersMap = {
    RECLINER: { tierName: "RECLINER", tierLabel: "👑 Recliner (₹450.00)", price: 450.00, seats: [] },
    PRIME: { tierName: "PRIME", tierLabel: "⭐ Prime (₹280.00)", price: 280.00, seats: [] },
    CLASSIC: { tierName: "CLASSIC", tierLabel: "🎬 Classic (₹180.00)", price: 180.00, seats: [] }
  };

  rows.forEach((r) => {
    for (let num = 1; num <= r.count; num++) {
      const sId = seatCounter++;
      const isBooked = (r.name === "B" && (num === 4 || num === 5 || num === 6));
      tiersMap[r.tier].seats.push({
        seatId: sId,
        rowName: r.name,
        seatNumber: num,
        seatCode: `${r.name}${num}`,
        tierCategory: r.tier,
        price: r.price,
        status: isBooked ? "BOOKED" : "AVAILABLE",
        isLockedByMe: false
      });
    }
  });

  return {
    showtimeId: parseInt(showtimeId, 10),
    movieTitle: "Kalki 2898 AD",
    cinemaName: "PVR ICON: Phoenix Palladium",
    screenName: "Audi 1 - IMAX Laser",
    showTime: `${new Date().toISOString().split("T")[0]}T18:00:00`,
    tiers: Object.values(tiersMap),
    totalSeats: 60,
    availableSeats: 57
  };
}
