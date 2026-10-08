package com.moviebooking;

import com.moviebooking.dto.BookingResponseDTO;
import com.moviebooking.dto.CreateBookingRequest;
import com.moviebooking.dto.PaymentMethod;
import com.moviebooking.dto.SeatLockRequest;
import com.moviebooking.entity.ShowtimeSeat;
import com.moviebooking.entity.User;
import com.moviebooking.exception.InvalidBookingException;
import com.moviebooking.exception.SeatConflictException;
import com.moviebooking.service.BookingService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class BookingFlowTest extends IntegrationTestBase {

    @Autowired
    private BookingService bookingService;

    @Test
    @DisplayName("Lock then confirm creates one booking, marks seats BOOKED and charges server-side prices")
    void lockThenConfirmCreatesBooking() {
        User user = createUser("flow@example.com");
        List<Long> seats = fixture.seatIds().subList(0, 2);

        bookingService.lockSeats(fixture.showtimeId(), new SeatLockRequest(seats), user.getId());
        BookingResponseDTO booking = bookingService.createBooking(bookingRequest(seats), user.getId());

        assertEquals(0, new BigDecimal("500.00").compareTo(booking.getTicketSubtotal()));
        assertEquals(0, new BigDecimal("535.00").compareTo(booking.getTotalAmount()));
        assertEquals(List.of("A1", "A2"), booking.getSeatNumbers());
        assertEquals(1, bookingRepository.count());

        List<ShowtimeSeat> rows = showtimeSeatRepository.findByShowtimeIdAndSeatIds(fixture.showtimeId(), seats);
        assertEquals(2, rows.size());
        rows.forEach(row -> assertEquals("BOOKED", row.getStatus()));
    }

    @Test
    @DisplayName("Confirming twice never creates a second booking for the same seats")
    void confirmingTwiceCreatesOnlyOneBooking() {
        User user = createUser("double@example.com");
        List<Long> seats = fixture.seatIds().subList(0, 1);

        bookingService.lockSeats(fixture.showtimeId(), new SeatLockRequest(seats), user.getId());
        bookingService.createBooking(bookingRequest(seats), user.getId());

        assertThrows(SeatConflictException.class,
                () -> bookingService.createBooking(bookingRequest(seats), user.getId()));
        assertEquals(1, bookingRepository.count());
    }

    @Test
    @DisplayName("Confirming seats that were never locked is rejected")
    void confirmWithoutLockIsRejected() {
        User user = createUser("nolock@example.com");
        assertThrows(SeatConflictException.class,
                () -> bookingService.createBooking(bookingRequest(fixture.seatIds().subList(0, 1)), user.getId()));
        assertEquals(0, bookingRepository.count());
    }

    @Test
    @DisplayName("A user cannot confirm seats that another user is holding")
    void confirmingSomeoneElsesHoldIsRejected() {
        User owner = createUser("owner@example.com");
        User intruder = createUser("intruder@example.com");
        List<Long> seats = fixture.seatIds().subList(0, 1);

        bookingService.lockSeats(fixture.showtimeId(), new SeatLockRequest(seats), owner.getId());

        assertThrows(SeatConflictException.class,
                () -> bookingService.createBooking(bookingRequest(seats), intruder.getId()));
        assertEquals(0, bookingRepository.count());
    }

    @Test
    @DisplayName("An expired hold can be taken by another user")
    void expiredHoldCanBeTakenByAnotherUser() {
        User first = createUser("first@example.com");
        User second = createUser("second@example.com");
        List<Long> seats = fixture.seatIds().subList(0, 1);

        bookingService.lockSeats(fixture.showtimeId(), new SeatLockRequest(seats), first.getId());
        ShowtimeSeat row = showtimeSeatRepository.findByShowtimeId(fixture.showtimeId()).get(0);
        row.setLockedUntil(LocalDateTime.now(clock).minusMinutes(1));
        showtimeSeatRepository.save(row);

        bookingService.lockSeats(fixture.showtimeId(), new SeatLockRequest(seats), second.getId());

        ShowtimeSeat reloaded = showtimeSeatRepository.findByShowtimeId(fixture.showtimeId()).get(0);
        assertEquals(second.getId(), reloaded.getLockedByUserId());
    }

    @Test
    @DisplayName("Locking creates the showtime seat row when it does not exist yet")
    void lockingCreatesMissingShowtimeSeatRow() {
        User user = createUser("create@example.com");
        assertEquals(0, showtimeSeatRepository.count());

        bookingService.lockSeats(fixture.showtimeId(), new SeatLockRequest(fixture.seatIds().subList(0, 3)), user.getId());

        assertEquals(3, showtimeSeatRepository.count());
    }

    @Test
    @DisplayName("Seats from a different screen are rejected")
    void seatFromAnotherScreenIsRejected() {
        User user = createUser("screen@example.com");
        assertThrows(InvalidBookingException.class,
                () -> bookingService.lockSeats(fixture.showtimeId(),
                        new SeatLockRequest(List.of(fixture.otherScreenSeatId())), user.getId()));
    }

    @Test
    @DisplayName("Duplicate seat ids are rejected")
    void duplicateSeatIdsAreRejected() {
        User user = createUser("dupe@example.com");
        Long seat = fixture.seatIds().get(0);
        assertThrows(InvalidBookingException.class,
                () -> bookingService.lockSeats(fixture.showtimeId(), new SeatLockRequest(List.of(seat, seat)), user.getId()));
    }

    @Test
    @DisplayName("More seats than the per-order limit are rejected")
    void tooManySeatsAreRejected() {
        User user = createUser("many@example.com");
        List<Long> nineSeats = List.of(1L, 2L, 3L, 4L, 5L, 6L, 7L, 8L, 9L);
        assertThrows(InvalidBookingException.class,
                () -> bookingService.lockSeats(fixture.showtimeId(), new SeatLockRequest(nineSeats), user.getId()));
    }

    @Test
    @DisplayName("A showtime that already started cannot be booked")
    void pastShowtimeIsRejected() {
        User user = createUser("past@example.com");
        InvalidBookingException error = assertThrows(InvalidBookingException.class,
                () -> bookingService.lockSeats(fixture.pastShowtimeId(),
                        new SeatLockRequest(fixture.seatIds().subList(0, 1)), user.getId()));
        assertTrue(error.getMessage().contains("already started"));
    }

    private CreateBookingRequest bookingRequest(List<Long> seatIds) {
        return new CreateBookingRequest(fixture.showtimeId(), seatIds, null, PaymentMethod.UPI);
    }
}
