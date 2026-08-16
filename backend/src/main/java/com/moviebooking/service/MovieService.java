package com.moviebooking.service;

import com.moviebooking.dto.MovieDTO;
import com.moviebooking.entity.Movie;
import com.moviebooking.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MovieService {

    @Autowired
    private MovieRepository movieRepository;

    @Value("${tmdb.api.key:}")
    private String tmdbApiKey;

    @Value("${tmdb.api.base-url:https://api.themoviedb.org/3}")
    private String tmdbBaseUrl;

    public List<MovieDTO> getNowPlayingMovies() {
        List<Movie> movies = movieRepository.findAll();
        return movies.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public MovieDTO getMovieDetails(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movie not found with ID: " + id));
        return convertToDTO(movie);
    }

    public List<MovieDTO> searchMovies(String query) {
        List<Movie> movies = (query == null || query.trim().isEmpty())
                ? movieRepository.findAll()
                : movieRepository.findByTitleContainingIgnoreCase(query.trim());
        return movies.stream().map(this::convertToDTO).collect(Collectors.toList());
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
        dto.setLanguages(m.getLanguages() != null ? Arrays.stream(m.getLanguages().split(",")).map(String::trim).collect(Collectors.toList()) : Collections.emptyList());
        dto.setGenres(m.getGenres() != null ? Arrays.stream(m.getGenres().split(",")).map(String::trim).collect(Collectors.toList()) : Collections.emptyList());
        dto.setCertification(m.getCertification());
        dto.setReleaseDate(m.getReleaseDate());
        dto.setTrailerUrl(m.getTrailerUrl());
        dto.setDescription(m.getDescription());
        return dto;
    }
}
