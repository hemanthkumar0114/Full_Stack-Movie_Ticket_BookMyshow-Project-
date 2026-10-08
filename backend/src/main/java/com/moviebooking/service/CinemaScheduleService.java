package com.moviebooking.service;

import com.moviebooking.dto.CinemaShowtimeDTO;
import com.moviebooking.dto.ShowtimeChipDTO;
import com.moviebooking.entity.Cinema;
import com.moviebooking.entity.Showtime;
import com.moviebooking.repository.ShowtimeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CinemaScheduleService {

    private static final String DEFAULT_STATUS = "AVAILABLE";

    private final ShowtimeRepository showtimeRepository;
    private final Clock clock;

    public CinemaScheduleService(ShowtimeRepository showtimeRepository, Clock clock) {
        this.showtimeRepository = showtimeRepository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<CinemaShowtimeDTO> getCinemasWithShowtimes(Long movieId, String city, LocalDate date) {
        LocalDateTime now = LocalDateTime.now(clock);
        String queryCity = (city == null || city.isBlank()) ? "Mumbai" : city.trim();

        List<Showtime> showtimes;
        if (date != null) {
            LocalDateTime from = date.atStartOfDay().isBefore(now) ? now : date.atStartOfDay();
            LocalDateTime to = date.plusDays(1).atStartOfDay();
            showtimes = from.isBefore(to)
                    ? showtimeRepository.findShowtimesByMovieCityBetween(movieId, queryCity, from, to)
                    : List.of();
        } else {
            showtimes = showtimeRepository.findUpcomingShowtimesByMovieCity(movieId, queryCity, now);
        }

        Map<Cinema, List<Showtime>> byCinema = showtimes.stream()
                .collect(Collectors.groupingBy(st -> st.getScreen().getCinema(), LinkedHashMap::new, Collectors.toList()));

        List<CinemaShowtimeDTO> result = new ArrayList<>();
        byCinema.forEach((cinema, cinemaShowtimes) -> result.add(toCinemaDto(cinema, cinemaShowtimes)));
        return result;
    }

    private CinemaShowtimeDTO toCinemaDto(Cinema cinema, List<Showtime> cinemaShowtimes) {
        CinemaShowtimeDTO dto = new CinemaShowtimeDTO();
        dto.setCinemaId(cinema.getId());
        dto.setName(cinema.getName());
        dto.setBrand(cinema.getBrand());
        dto.setCity(cinema.getCity());
        dto.setLocationAddress(cinema.getLocationAddress());
        dto.setFacilities(cinema.getFacilities());
        dto.setShowtimes(cinemaShowtimes.stream()
                .map(st -> new ShowtimeChipDTO(
                        st.getId(),
                        st.getStartTime(),
                        st.getFormatType(),
                        st.getScreen().getScreenName(),
                        st.getScreen().getSoundType(),
                        st.getStatus() != null ? st.getStatus() : DEFAULT_STATUS))
                .toList());
        return dto;
    }
}
