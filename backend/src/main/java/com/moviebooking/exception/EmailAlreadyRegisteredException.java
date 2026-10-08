package com.moviebooking.exception;

public class EmailAlreadyRegisteredException extends ConflictException {
    public EmailAlreadyRegisteredException() {
        super("An account with this email already exists.");
    }
}
