package com.moviebooking.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateBookingRequest(
        @NotNull(message = "Showtime ID is required")
        Long showtimeId,

        @NotEmpty(message = "At least one seat must be selected")
        @Size(max = 20, message = "Too many seats selected")
        List<@NotNull(message = "Seat id cannot be null") Long> seatIds,

        @Pattern(regexp = "^$|^[0-9+\\- ]{10,15}$", message = "Phone must contain 10 to 15 digits")
        String phone,

        @NotNull(message = "Payment method is required")
        PaymentMethod paymentMethod) {
}
