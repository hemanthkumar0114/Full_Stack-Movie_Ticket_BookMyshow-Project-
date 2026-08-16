package com.moviebooking.controller;

import com.moviebooking.dto.CinemaShowtimeDTO;
import com.moviebooking.service.CinemaScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class CinemaController {

    @Autowired
    private CinemaScheduleService cinemaScheduleService;

    @GetMapping("/api/v1/cinemas")
    public ResponseEntity<List<CinemaShowtimeDTO>> getCinemas(
            @RequestParam Long movieId,
            @RequestParam(required = false, defaultValue = "Mumbai") String city,
            @RequestParam(required = false) String date) {
        return ResponseEntity.ok(cinemaScheduleService.getCinemasWithShowtimes(movieId, city, date));
    }

    // Compatibility endpoint
    @GetMapping("/api/movies/{movieId}/showtimes")
    public ResponseEntity<List<CinemaShowtimeDTO>> getShowtimesForMovie(
            @PathVariable Long movieId,
            @RequestParam(required = false, defaultValue = "Mumbai") String city,
            @RequestParam(required = false) String date) {
        return ResponseEntity.ok(cinemaScheduleService.getCinemasWithShowtimes(movieId, city, date));
    }
}
