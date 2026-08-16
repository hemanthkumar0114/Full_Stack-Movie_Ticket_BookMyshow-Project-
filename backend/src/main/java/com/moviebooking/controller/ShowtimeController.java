package com.moviebooking.controller;

import com.moviebooking.dto.ShowtimeSeatMapDTO;
import com.moviebooking.service.SeatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
public class ShowtimeController {

    @Autowired
    private SeatService seatService;

    @GetMapping("/api/v1/showtimes/{showtimeId}/seats")
    public ResponseEntity<ShowtimeSeatMapDTO> getShowtimeSeats(
            @PathVariable Long showtimeId,
            @RequestParam(required = false) String sessionId) {
        return ResponseEntity.ok(seatService.getSeatMapForShowtime(showtimeId, sessionId));
    }

    // Compatibility endpoint
    @GetMapping("/api/showtimes/{showtimeId}/seats")
    public ResponseEntity<ShowtimeSeatMapDTO> getSeatsForShowtime(
            @PathVariable Long showtimeId,
            @RequestParam(required = false) String sessionId) {
        return ResponseEntity.ok(seatService.getSeatMapForShowtime(showtimeId, sessionId));
    }
}
