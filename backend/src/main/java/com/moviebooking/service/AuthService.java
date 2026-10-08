package com.moviebooking.service;

import com.moviebooking.dto.AuthResponse;
import com.moviebooking.dto.LoginRequest;
import com.moviebooking.dto.RegisterRequest;
import com.moviebooking.dto.UserDTO;
import com.moviebooking.entity.User;
import com.moviebooking.exception.EmailAlreadyRegisteredException;
import com.moviebooking.exception.InvalidCredentialsException;
import com.moviebooking.exception.ResourceNotFoundException;
import com.moviebooking.repository.UserRepository;
import com.moviebooking.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final Clock clock;
    private final String dummyPasswordHash;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       Clock clock) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.clock = clock;
        this.dummyPasswordHash = passwordEncoder.encode("not-a-real-password");
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyRegisteredException();
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPhone(request.phone() == null || request.phone().isBlank() ? null : request.phone().trim());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setCreatedAt(LocalDateTime.now(clock));

        User saved = userRepository.saveAndFlush(user);
        return toAuthResponse(saved);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        User user = userRepository.findByEmail(email).orElse(null);

        String hashToCheck = user != null ? user.getPasswordHash() : dummyPasswordHash;
        boolean passwordMatches = passwordEncoder.matches(request.password(), hashToCheck);
        if (user == null || !passwordMatches) {
            throw new InvalidCredentialsException();
        }
        return toAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public UserDTO getCurrentUser(Long userId) {
        return userRepository.findById(userId)
                .map(UserDTO::from)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    private AuthResponse toAuthResponse(User user) {
        return AuthResponse.bearer(jwtService.generateToken(user), jwtService.expiresInSeconds(), UserDTO.from(user));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
