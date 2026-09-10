package com.moviebooking;

import com.moviebooking.dto.SeatLockRequest;
import com.moviebooking.dto.SeatLockResponse;
import com.moviebooking.entity.*;
import com.moviebooking.exception.SeatConflictException;
import com.moviebooking.repository.*;
import com.moviebooking.service.BookingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=MySQL",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
public class SeatBookingConcurrencyTest {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private CinemaRepository cinemaRepository;

    @Autowired
    private ScreenRepository screenRepository;

    @Autowired
    private ShowtimeRepository showtimeRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private ShowtimeSeatRepository showtimeSeatRepository;

    private Long testShowtimeId;
    private Long testSeatId;

    @BeforeEach
    public void setupTestData() {
        showtimeSeatRepository.deleteAll();
        showtimeRepository.deleteAll();
        seatRepository.deleteAll();
        screenRepository.deleteAll();
        cinemaRepository.deleteAll();
        movieRepository.deleteAll();

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

        Screen screen = new Screen();
        screen.setCinema(cinema);
        screen.setScreenName("Screen 1");
        screen = screenRepository.save(screen);

        Seat seat = new Seat();
        seat.setScreen(screen);
        seat.setRowName("A");
        seat.setSeatNumber(1);
        seat.setTierCategory("PRIME");
        seat.setBasePrice(new BigDecimal("250.00"));
        seat = seatRepository.save(seat);
        testSeatId = seat.getId();

        Showtime showtime = new Showtime();
        showtime.setMovie(movie);
        showtime.setScreen(screen);
        showtime.setStartTime(LocalDateTime.now().plusDays(1));
        showtime.setFormatType("2D");
        showtime = showtimeRepository.save(showtime);
        testShowtimeId = showtime.getId();

        ShowtimeSeat showtimeSeat = new ShowtimeSeat();
        showtimeSeat.setShowtime(showtime);
        showtimeSeat.setSeat(seat);
        showtimeSeat.setStatus("AVAILABLE");
        showtimeSeatRepository.save(showtimeSeat);
    }

    @Test
    @DisplayName("Concurrent lockSeats on identical seat: exactly one succeeds, second gets SeatConflictException")
    public void testConcurrentSeatLocking() throws InterruptedException {
        int numberOfThreads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(numberOfThreads);

        AtomicReference<SeatLockResponse> responseThread1 = new AtomicReference<>();
        AtomicReference<SeatLockResponse> responseThread2 = new AtomicReference<>();
        AtomicReference<Throwable> exceptionThread1 = new AtomicReference<>();
        AtomicReference<Throwable> exceptionThread2 = new AtomicReference<>();

        SeatLockRequest request1 = new SeatLockRequest();
        request1.setShowtimeId(testShowtimeId);
        request1.setSeatIds(Collections.singletonList(testSeatId));
        request1.setSessionId("session-alpha");

        SeatLockRequest request2 = new SeatLockRequest();
        request2.setShowtimeId(testShowtimeId);
        request2.setSeatIds(Collections.singletonList(testSeatId));
        request2.setSessionId("session-beta");

        executor.submit(() -> {
            try {
                startLatch.await();
                SeatLockResponse response = bookingService.lockSeats(request1);
                responseThread1.set(response);
            } catch (Throwable t) {
                exceptionThread1.set(t);
            } finally {
                doneLatch.countDown();
            }
        });

        executor.submit(() -> {
            try {
                startLatch.await();
                SeatLockResponse response = bookingService.lockSeats(request2);
                responseThread2.set(response);
            } catch (Throwable t) {
                exceptionThread2.set(t);
            } finally {
                doneLatch.countDown();
            }
        });

        // Trigger both threads simultaneously
        startLatch.countDown();
        boolean completed = doneLatch.await(10, TimeUnit.SECONDS);
        assertTrue(completed, "Concurrent threads should complete within 10 seconds");
        executor.shutdown();

        // Evaluate outcomes
        boolean thread1Succeeded = responseThread1.get() != null && responseThread1.get().isSuccess();
        boolean thread2Succeeded = responseThread2.get() != null && responseThread2.get().isSuccess();

        // Exactly one thread must succeed
        assertTrue(thread1Succeeded ^ thread2Succeeded, "Exactly one thread must successfully lock the seat");

        if (thread1Succeeded) {
            assertNotNull(exceptionThread2.get(), "Thread 2 should have thrown an exception");
            assertTrue(exceptionThread2.get() instanceof SeatConflictException,
                    "Thread 2 exception should be SeatConflictException but was: " + exceptionThread2.get().getClass().getName());
        } else {
            assertNotNull(exceptionThread1.get(), "Thread 1 should have thrown an exception");
            assertTrue(exceptionThread1.get() instanceof SeatConflictException,
                    "Thread 1 exception should be SeatConflictException but was: " + exceptionThread1.get().getClass().getName());
        }

        // Verify DB state
        List<ShowtimeSeat> seatsInDb = showtimeSeatRepository.findByShowtimeIdAndSeatIds(testShowtimeId, Collections.singletonList(testSeatId));
        assertEquals(1, seatsInDb.size());
        ShowtimeSeat ss = seatsInDb.get(0);
        assertEquals("LOCKED", ss.getStatus());
        String winningSession = thread1Succeeded ? "session-alpha" : "session-beta";
        assertEquals(winningSession, ss.getLockedBySession());
    }
}
