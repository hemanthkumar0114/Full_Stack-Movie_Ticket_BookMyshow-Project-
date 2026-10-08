package com.moviebooking.dto;

import java.time.LocalDateTime;
import java.util.List;

public record SeatLockResponse(
        boolean success,
        String message,
        LocalDateTime lockExpiresAt,
        long expiresInSeconds,
        List<Long> lockedSeatIds) {
}
