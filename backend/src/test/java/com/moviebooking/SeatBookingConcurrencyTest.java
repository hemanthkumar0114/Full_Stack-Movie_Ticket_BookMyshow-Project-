package com.moviebooking;

import com.moviebooking.dto.SeatLockRequest;
import com.moviebooking.dto.SeatLockResponse;
import com.moviebooking.entity.ShowtimeSeat;
import com.moviebooking.entity.User;
import com.moviebooking.exception.SeatConflictException;
import com.moviebooking.service.BookingService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SeatBookingConcurrencyTest extends IntegrationTestBase {

    @Autowired
    private BookingService bookingService;

    @Test
    @DisplayName("Two users locking the same seat at once: exactly one wins, the other gets a conflict")
    void concurrentLocksOnSameSeatAllowExactlyOneWinner() throws InterruptedException {
        User userOne = createUser("one@example.com");
        User userTwo = createUser("two@example.com");
        Long seatId = fixture.seatIds().get(0);
        SeatLockRequest request = new SeatLockRequest(Collections.singletonList(seatId));

        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(2);
        AtomicReference<SeatLockResponse> responseOne = new AtomicReference<>();
        AtomicReference<SeatLockResponse> responseTwo = new AtomicReference<>();
        AtomicReference<Throwable> errorOne = new AtomicReference<>();
        AtomicReference<Throwable> errorTwo = new AtomicReference<>();

        executor.submit(() -> runLock(startLatch, doneLatch, userOne.getId(), request, responseOne, errorOne));
        executor.submit(() -> runLock(startLatch, doneLatch, userTwo.getId(), request, responseTwo, errorTwo));

        startLatch.countDown();
        assertTrue(doneLatch.await(15, TimeUnit.SECONDS), "Both threads should finish in time");
        executor.shutdown();

        boolean oneWon = responseOne.get() != null;
        boolean twoWon = responseTwo.get() != null;
        assertTrue(oneWon ^ twoWon, "Exactly one user must win the seat");

        Throwable loserError = oneWon ? errorTwo.get() : errorOne.get();
        assertNotNull(loserError, "The losing user must receive an error");
        assertTrue(loserError instanceof SeatConflictException,
                "Expected SeatConflictException but was " + loserError.getClass().getName());

        List<ShowtimeSeat> rows = showtimeSeatRepository.findByShowtimeIdAndSeatIds(
                fixture.showtimeId(), Collections.singletonList(seatId));
        assertEquals(1, rows.size());
        assertEquals("LOCKED", rows.get(0).getStatus());
        assertEquals(oneWon ? userOne.getId() : userTwo.getId(), rows.get(0).getLockedByUserId());
    }

    private void runLock(CountDownLatch startLatch,
                         CountDownLatch doneLatch,
                         Long userId,
                         SeatLockRequest request,
                         AtomicReference<SeatLockResponse> response,
                         AtomicReference<Throwable> error) {
        try {
            startLatch.await();
            response.set(bookingService.lockSeats(fixture.showtimeId(), request, userId));
        } catch (Throwable t) {
            error.set(t);
        } finally {
            doneLatch.countDown();
        }
    }
}
