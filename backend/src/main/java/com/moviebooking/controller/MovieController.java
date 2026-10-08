package com.moviebooking.controller;

import com.moviebooking.dto.MovieDTO;
import com.moviebooking.service.MovieService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/movies")
public class MovieController {

    private final MovieService movieService;

    public MovieController(MovieService movieService) {
        this.movieService = movieService;
    }

    @GetMapping("/now-playing")
    public ResponseEntity<List<MovieDTO>> getNowPlayingMovies() {
        return ResponseEntity.ok(movieService.getNowPlayingMovies());
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<MovieDTO> getMovieDetails(@PathVariable Long id) {
        return ResponseEntity.ok(movieService.getMovieDetails(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<MovieDTO>> searchMovies(@RequestParam(required = false) String q) {
        return ResponseEntity.ok(movieService.searchMovies(q));
    }
}
