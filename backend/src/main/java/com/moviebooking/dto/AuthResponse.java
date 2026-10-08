package com.moviebooking.dto;

public record AuthResponse(String token, String tokenType, long expiresInSeconds, UserDTO user) {

    public static AuthResponse bearer(String token, long expiresInSeconds, UserDTO user) {
        return new AuthResponse(token, "Bearer", expiresInSeconds, user);
    }
}
