package com.moviebooking;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moviebooking.entity.Cinema;
import com.moviebooking.entity.Movie;
import com.moviebooking.entity.Screen;
import com.moviebooking.entity.Seat;
import com.moviebooking.entity.Showtime;
import com.moviebooking.entity.User;
import com.moviebooking.repository.BookingRepository;
import com.moviebooking.repository.CinemaRepository;
import com.moviebooking.repository.MovieRepository;
import com.moviebooking.repository.ScreenRepository;
import com.moviebooking.repository.SeatRepository;
import com.moviebooking.repository.ShowtimeRepository;
import com.moviebooking.repository.ShowtimeSeatRepository;
import com.moviebooking.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class IntegrationTestBase {

    protected record Fixture(Long showtimeId, Long pastShowtimeId, List<Long> seatIds, Long otherScreenSeatId) {
    }

    @Autowired protected MockMvc mockMvc;
    @Autowired protected ObjectMapper objectMapper;
    @Autowired protected Clock clock;
    @Autowired protected PasswordEncoder passwordEncoder;
    @Autowired protected UserRepository userRepository;
    @Autowired protected BookingRepository bookingRepository;
    @Autowired protected MovieRepository movieRepository;
    @Autowired protected CinemaRepository cinemaRepository;
    @Autowired protected ScreenRepository screenRepository;
    @Autowired protected SeatRepository seatRepository;
    @Autowired protected ShowtimeRepository showtimeRepository;
    @Autowired protected ShowtimeSeatRepository showtimeSeatRepository;

    protected Fixture fixture;

    @BeforeEach
    void resetDatabaseAndCreateFixture() {
        bookingRepository.deleteAll();
        showtimeSeatRepository.deleteAllInBatch();
        showtimeRepository.deleteAllInBatch();
        seatRepository.deleteAllInBatch();
        screenRepository.deleteAllInBatch();
        cinemaRepository.deleteAllInBatch();
        movieRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();
        fixture = createFixture();
    }

    protected User createUser(String email) {
        User user = new User();
        user.setName("Test User");
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode("Passw0rd!"));
        user.setCreatedAt(LocalDateTime.now(clock));
        return userRepository.save(user);
    }

    private Fixture createFixture() {
        Movie movie = new Movie();
        movie.setTitle("Concurrency Action Movie");
        movie.setLanguages("English");
        movie.setGenres("Action");
        movie = movieRepository.save(movie);

        Cinema cinema = new Cinema();
        cinema.setName("Test Multiplex");
        cinema.setBrand("TestBrand");
        cinema.setCity("Mumbai");
        cinema = cinemaRepository.save(cinema);

        Screen screenOne = saveScreen(cinema, "Screen 1");
        Screen screenTwo = saveScreen(cinema, "Screen 2");

        List<Long> seatIds = new ArrayList<>();
        for (int number = 1; number <= 4; number++) {
            seatIds.add(saveSeat(screenOne, "A", number).getId());
        }
        Long otherScreenSeatId = saveSeat(screenTwo, "Z", 1).getId();

        Showtime upcoming = saveShowtime(movie, screenOne, LocalDateTime.now(clock).plusDays(1));
        Showtime past = saveShowtime(movie, screenOne, LocalDateTime.now(clock).minusHours(2));

        return new Fixture(upcoming.getId(), past.getId(), seatIds, otherScreenSeatId);
    }

    private Screen saveScreen(Cinema cinema, String name) {
        Screen screen = new Screen();
        screen.setCinema(cinema);
        screen.setScreenName(name);
        return screenRepository.save(screen);
    }

    private Seat saveSeat(Screen screen, String row, int number) {
        Seat seat = new Seat();
        seat.setScreen(screen);
        seat.setRowName(row);
        seat.setSeatNumber(number);
        seat.setTierCategory("PRIME");
        seat.setBasePrice(new BigDecimal("250.00"));
        return seatRepository.save(seat);
    }

    private Showtime saveShowtime(Movie movie, Screen screen, LocalDateTime startTime) {
        Showtime showtime = new Showtime();
        showtime.setMovie(movie);
        showtime.setScreen(screen);
        showtime.setStartTime(startTime);
        showtime.setFormatType("2D");
        return showtimeRepository.save(showtime);
    }
}
