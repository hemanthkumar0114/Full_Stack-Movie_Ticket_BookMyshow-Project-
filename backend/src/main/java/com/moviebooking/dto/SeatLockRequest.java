package com.moviebooking.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record SeatLockRequest(
        @NotEmpty(message = "At least one seat must be selected")
        @Size(max = 20, message = "Too many seats selected")
        List<@NotNull(message = "Seat id cannot be null") Long> seatIds) {
}
