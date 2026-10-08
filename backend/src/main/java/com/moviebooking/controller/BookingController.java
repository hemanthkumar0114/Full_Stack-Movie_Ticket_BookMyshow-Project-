package com.moviebooking.controller;

import com.moviebooking.dto.BookingResponseDTO;
import com.moviebooking.dto.CreateBookingRequest;
import com.moviebooking.dto.SeatLockRequest;
import com.moviebooking.dto.SeatLockResponse;
import com.moviebooking.security.AuthenticatedUser;
import com.moviebooking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping("/showtimes/{showtimeId}/seat-locks")
    public ResponseEntity<SeatLockResponse> lockSeats(@PathVariable Long showtimeId,
                                                      @Valid @RequestBody SeatLockRequest request,
                                                      @AuthenticationPrincipal AuthenticatedUser principal) {
        SeatLockResponse response = bookingService.lockSeats(showtimeId, request, principal.id());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/bookings")
    public ResponseEntity<BookingResponseDTO> createBooking(@Valid @RequestBody CreateBookingRequest request,
                                                            @AuthenticationPrincipal AuthenticatedUser principal) {
        BookingResponseDTO booking = bookingService.createBooking(request, principal.id());
        URI location = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/v1/bookings/{id}")
                .buildAndExpand(booking.getBookingId())
                .toUri();
        return ResponseEntity.created(location).body(booking);
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingResponseDTO>> getMyBookings(@AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(bookingService.getBookingsForUser(principal.id()));
    }

    @GetMapping("/bookings/{bookingId}")
    public ResponseEntity<BookingResponseDTO> getMyBooking(@PathVariable Long bookingId,
                                                           @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(bookingService.getBookingForUser(bookingId, principal.id()));
    }
}
