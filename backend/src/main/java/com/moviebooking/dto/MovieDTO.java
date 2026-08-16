package com.moviebooking.dto;

import java.math.BigDecimal;
import java.util.List;

public class MovieDTO {
    private Long id;
    private Long tmdbId;
    private String title;
    private String posterUrl;
    private String backdropUrl;
    private BigDecimal rating;
    private Integer voteCount;
    private Integer runtimeMin;
    private List<String> languages;
    private List<String> genres;
    private String certification;
    private String releaseDate;
    private String trailerUrl;
    private String description;

    public MovieDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTmdbId() { return tmdbId; }
    public void setTmdbId(Long tmdbId) { this.tmdbId = tmdbId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getPosterUrl() { return posterUrl; }
    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }

    public String getBackdropUrl() { return backdropUrl; }
    public void setBackdropUrl(String backdropUrl) { this.backdropUrl = backdropUrl; }

    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }

    public Integer getVoteCount() { return voteCount; }
    public void setVoteCount(Integer voteCount) { this.voteCount = voteCount; }

    public Integer getRuntimeMin() { return runtimeMin; }
    public void setRuntimeMin(Integer runtimeMin) { this.runtimeMin = runtimeMin; }

    public List<String> getLanguages() { return languages; }
    public void setLanguages(List<String> languages) { this.languages = languages; }

    public List<String> getGenres() { return genres; }
    public void setGenres(List<String> genres) { this.genres = genres; }

    public String getCertification() { return certification; }
    public void setCertification(String certification) { this.certification = certification; }

    public String getReleaseDate() { return releaseDate; }
    public void setReleaseDate(String releaseDate) { this.releaseDate = releaseDate; }

    public String getTrailerUrl() { return trailerUrl; }
    public void setTrailerUrl(String trailerUrl) { this.trailerUrl = trailerUrl; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
