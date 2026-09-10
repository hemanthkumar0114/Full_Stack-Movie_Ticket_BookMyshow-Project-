package com.moviebooking.controller;

import com.moviebooking.dto.BookingConfirmRequest;
import com.moviebooking.dto.BookingResponseDTO;
import com.moviebooking.dto.SeatLockRequest;
import com.moviebooking.dto.SeatLockResponse;
import com.moviebooking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping("/api/v1/bookings/lock-seats")
    public ResponseEntity<SeatLockResponse> lockSeats(@Valid @RequestBody SeatLockRequest request) {
        SeatLockResponse response = bookingService.lockSeats(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/v1/bookings/confirm")
    public ResponseEntity<BookingResponseDTO> confirmBooking(@Valid @RequestBody BookingConfirmRequest request) {
        BookingResponseDTO response = bookingService.confirmBooking(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/v1/bookings/history")
    public ResponseEntity<List<BookingResponseDTO>> getBookingHistory(@RequestParam(required = false) String email) {
        if (email != null && !email.trim().isEmpty()) {
            return ResponseEntity.ok(bookingService.getBookingsByEmail(email.trim()));
        }
        return ResponseEntity.ok(bookingService.getAllBookings());
    }
}
