package com.moviebooking.controller;

import com.moviebooking.dto.ShowtimeSeatMapDTO;
import com.moviebooking.security.AuthenticatedUser;
import com.moviebooking.service.SeatService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/showtimes")
public class ShowtimeController {

    private final SeatService seatService;

    public ShowtimeController(SeatService seatService) {
        this.seatService = seatService;
    }

    @GetMapping("/{showtimeId}/seats")
    public ResponseEntity<ShowtimeSeatMapDTO> getShowtimeSeats(@PathVariable Long showtimeId,
                                                               @AuthenticationPrincipal AuthenticatedUser principal) {
        Long userId = principal != null ? principal.id() : null;
        return ResponseEntity.ok(seatService.getSeatMapForShowtime(showtimeId, userId));
    }
}
