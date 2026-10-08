package com.moviebooking.dto;

import com.moviebooking.entity.User;

public record UserDTO(Long id, String name, String email, String phone) {

    public static UserDTO from(User user) {
        return new UserDTO(user.getId(), user.getName(), user.getEmail(), user.getPhone());
    }
}
