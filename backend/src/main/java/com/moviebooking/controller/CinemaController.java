package com.moviebooking.controller;

import com.moviebooking.dto.CinemaShowtimeDTO;
import com.moviebooking.service.CinemaScheduleService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/cinemas")
public class CinemaController {

    private final CinemaScheduleService cinemaScheduleService;

    public CinemaController(CinemaScheduleService cinemaScheduleService) {
        this.cinemaScheduleService = cinemaScheduleService;
    }

    @GetMapping
    public ResponseEntity<List<CinemaShowtimeDTO>> getCinemas(
            @RequestParam Long movieId,
            @RequestParam(defaultValue = "Mumbai") String city,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(cinemaScheduleService.getCinemasWithShowtimes(movieId, city, date));
    }
}
