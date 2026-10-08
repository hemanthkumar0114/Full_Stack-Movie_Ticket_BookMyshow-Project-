package com.moviebooking.exception;

public class SeatConflictException extends ConflictException {
    public SeatConflictException(String message) {
        super(message);
    }
}
