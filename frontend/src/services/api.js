import { MOVIES_DATA } from "../data/moviesData";
import { request } from "./http";

function filterByCategory(movies, category) {
  if (category === "now_showing") return movies.filter((m) => m.category === "now_showing");
  if (category === "upcoming") return movies.filter((m) => m.category === "upcoming");
  if (category === "top_rated") return [...movies].sort((a, b) => (b.numericRating || 0) - (a.numericRating || 0));
  if (category === "trending") return movies.filter((m) => m.isTrending);
  return movies;
}

const LOCAL_MOVIES_BY_ID = new Map(MOVIES_DATA.map((movie) => [movie.id, movie]));

function mergeWithCatalogMetadata(serverMovie) {
  const localMovie = LOCAL_MOVIES_BY_ID.get(serverMovie.id);
  if (!localMovie) {
    return { ...serverMovie, category: "now_showing" };
  }
  return {
    ...localMovie,
    ...serverMovie,
    formats: localMovie.formats,
    category: localMovie.category
  };
}

export const api = {
  async getNowPlayingMovies(category = "all") {
    const serverMovies = await request("/movies/now-playing");
    return filterByCategory(serverMovies.map(mergeWithCatalogMetadata), category);
  },

  async getMovieDetails(movieId) {
    const numericId = Number.parseInt(movieId, 10);
    const serverMovie = await request(`/movies/${numericId}/details`);
    return mergeWithCatalogMetadata(serverMovie);
  },

  async searchMovies(query) {
    const trimmed = query.trim();
    if (!trimmed) return [];
    return request(`/movies/search?q=${encodeURIComponent(trimmed)}`);
  },

  getCinemasAndShowtimes(movieId, city, date) {
    const params = new URLSearchParams({ movieId });
    if (city) params.set("city", city);
    if (date) params.set("date", date);
    return request(`/cinemas?${params.toString()}`);
  },

  getShowtimeSeats(showtimeId) {
    return request(`/showtimes/${showtimeId}/seats`);
  },

  lockSeats(showtimeId, seatIds) {
    return request(`/showtimes/${showtimeId}/seat-locks`, { method: "POST", body: { seatIds } });
  },

  createBooking({ showtimeId, seatIds, phone, paymentMethod }) {
    return request("/bookings", {
      method: "POST",
      body: { showtimeId, seatIds, phone, paymentMethod }
    });
  },

  getMyBookings() {
    return request("/bookings");
  },

  register(payload) {
    return request("/auth/register", { method: "POST", body: payload });
  },

  login(payload) {
    return request("/auth/login", { method: "POST", body: payload });
  }
};
