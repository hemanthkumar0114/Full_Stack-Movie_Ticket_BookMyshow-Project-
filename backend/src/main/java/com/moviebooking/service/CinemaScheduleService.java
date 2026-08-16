package com.moviebooking.service;

import com.moviebooking.dto.CinemaShowtimeDTO;
import com.moviebooking.dto.ShowtimeChipDTO;
import com.moviebooking.entity.Cinema;
import com.moviebooking.entity.Showtime;
import com.moviebooking.repository.CinemaRepository;
import com.moviebooking.repository.ShowtimeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
public class CinemaScheduleService {

    @Autowired
    private ShowtimeRepository showtimeRepository;

    @Autowired
    private CinemaRepository cinemaRepository;

    @Transactional(readOnly = true)
    public List<CinemaShowtimeDTO> getCinemasWithShowtimes(Long movieId, String city, String dateStr) {
        String queryCity = (city == null || city.trim().isEmpty()) ? "Mumbai" : city.trim();
        List<Showtime> showtimes;

        if (dateStr != null && !dateStr.trim().isEmpty()) {
            try {
                LocalDate date = LocalDate.parse(dateStr.trim(), DateTimeFormatter.ISO_LOCAL_DATE);
                LocalDateTime startOfDay = date.atStartOfDay();
                LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();
                showtimes = showtimeRepository.findShowtimesByMovieCityDate(movieId, queryCity, startOfDay, endOfDay);
            } catch (Exception e) {
                showtimes = showtimeRepository.findShowtimesByMovieCity(movieId, queryCity);
            }
        } else {
            showtimes = showtimeRepository.findShowtimesByMovieCity(movieId, queryCity);
        }

        // If no showtimes in specified city, fallback to all showtimes for this movie
        if (showtimes.isEmpty()) {
            showtimes = showtimeRepository.findByMovieId(movieId);
        }

        // Group showtimes by Cinema
        Map<Cinema, List<Showtime>> grouped = showtimes.stream()
                .collect(Collectors.groupingBy(st -> st.getScreen().getCinema(), LinkedHashMap::new, Collectors.toList()));

        List<CinemaShowtimeDTO> result = new ArrayList<>();
        for (Map.Entry<Cinema, List<Showtime>> entry : grouped.entrySet()) {
            Cinema cinema = entry.getKey();
            List<Showtime> cinemaShowtimes = entry.getValue();

            CinemaShowtimeDTO cinemaDTO = new CinemaShowtimeDTO();
            cinemaDTO.setCinemaId(cinema.getId());
            cinemaDTO.setName(cinema.getName());
            cinemaDTO.setBrand(cinema.getBrand());
            cinemaDTO.setCity(cinema.getCity());
            cinemaDTO.setLocationAddress(cinema.getLocationAddress());
            cinemaDTO.setFacilities(cinema.getFacilities());

            List<ShowtimeChipDTO> chips = cinemaShowtimes.stream().map(st -> new ShowtimeChipDTO(
                    st.getId(),
                    st.getStartTime(),
                    st.getFormatType(),
                    st.getScreen().getScreenName(),
                    st.getScreen().getSoundType(),
                    st.getStatus() != null ? st.getStatus() : "AVAILABLE"
            )).collect(Collectors.toList());

            cinemaDTO.setShowtimes(chips);
            result.add(cinemaDTO);
        }

        return result;
    }
}
