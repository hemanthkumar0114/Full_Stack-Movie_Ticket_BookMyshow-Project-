package com.moviebooking.service;

import com.moviebooking.dto.MovieDTO;
import com.moviebooking.entity.Movie;
import com.moviebooking.exception.ResourceNotFoundException;
import com.moviebooking.repository.MovieRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
public class MovieService {

    private final MovieRepository movieRepository;

    public MovieService(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    @Transactional(readOnly = true)
    public List<MovieDTO> getNowPlayingMovies() {
        return movieRepository.findAll().stream().map(this::convertToDTO).toList();
    }

    @Transactional(readOnly = true)
    public MovieDTO getMovieDetails(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found with ID: " + id));
        return convertToDTO(movie);
    }

    @Transactional(readOnly = true)
    public List<MovieDTO> searchMovies(String query) {
        List<Movie> movies = (query == null || query.isBlank())
                ? movieRepository.findAll()
                : movieRepository.findByTitleContainingIgnoreCase(query.trim());
        return movies.stream().map(this::convertToDTO).toList();
    }

    private MovieDTO convertToDTO(Movie m) {
        MovieDTO dto = new MovieDTO();
        dto.setId(m.getId());
        dto.setTmdbId(m.getTmdbId());
        dto.setTitle(m.getTitle());
        dto.setPosterUrl(m.getPosterUrl());
        dto.setBackdropUrl(m.getBackdropUrl());
        dto.setRating(m.getRating());
        dto.setVoteCount(m.getVoteCount());
        dto.setRuntimeMin(m.getRuntimeMin());
        dto.setLanguages(splitCsv(m.getLanguages()));
        dto.setGenres(splitCsv(m.getGenres()));
        dto.setCertification(m.getCertification());
        dto.setReleaseDate(m.getReleaseDate());
        dto.setTrailerUrl(m.getTrailerUrl());
        dto.setDescription(m.getDescription());
        return dto;
    }

    private List<String> splitCsv(String value) {
        if (value == null || value.isBlank()) {
            return Collections.emptyList();
        }
        return Arrays.stream(value.split(",")).map(String::trim).toList();
    }
}
