package com.moviebooking.controller;

import com.moviebooking.dto.MovieDTO;
import com.moviebooking.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class MovieController {

    @Autowired
    private MovieService movieService;

    @GetMapping("/api/v1/movies/now-playing")
    public ResponseEntity<List<MovieDTO>> getNowPlayingMovies() {
        return ResponseEntity.ok(movieService.getNowPlayingMovies());
    }

    @GetMapping("/api/v1/movies/{id}/details")
    public ResponseEntity<MovieDTO> getMovieDetails(@PathVariable Long id) {
        return ResponseEntity.ok(movieService.getMovieDetails(id));
    }

    @GetMapping("/api/v1/movies/search")
    public ResponseEntity<List<MovieDTO>> searchMovies(@RequestParam(required = false) String q) {
        return ResponseEntity.ok(movieService.searchMovies(q));
    }

    // Backward-compatibility endpoints for simple client calls
    @GetMapping("/api/movies")
    public ResponseEntity<List<MovieDTO>> getAllMovies() {
        return ResponseEntity.ok(movieService.getNowPlayingMovies());
    }

    @GetMapping("/api/movies/{id}")
    public ResponseEntity<MovieDTO> getMovieById(@PathVariable Long id) {
        return ResponseEntity.ok(movieService.getMovieDetails(id));
    }
}
