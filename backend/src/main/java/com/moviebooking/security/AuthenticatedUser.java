package com.moviebooking.security;

public record AuthenticatedUser(Long id, String email, String name) {
}
