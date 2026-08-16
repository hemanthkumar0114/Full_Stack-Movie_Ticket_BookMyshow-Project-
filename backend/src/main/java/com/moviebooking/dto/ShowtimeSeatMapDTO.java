package com.moviebooking.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ShowtimeSeatMapDTO {
    private Long showtimeId;
    private Long movieId;
    private String movieTitle;
    private String posterUrl;
    private String cinemaName;
    private String screenName;
    private String formatType;
    private LocalDateTime startTime;
    private List<SeatTierDTO> tiers = new ArrayList<>();
    private Integer totalSeats;
    private Integer availableSeats;

    public ShowtimeSeatMapDTO() {}

    public Long getShowtimeId() { return showtimeId; }
    public void setShowtimeId(Long showtimeId) { this.showtimeId = showtimeId; }

    public Long getMovieId() { return movieId; }
    public void setMovieId(Long movieId) { this.movieId = movieId; }

    public String getMovieTitle() { return movieTitle; }
    public void setMovieTitle(String movieTitle) { this.movieTitle = movieTitle; }

    public String getPosterUrl() { return posterUrl; }
    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }

    public String getCinemaName() { return cinemaName; }
    public void setCinemaName(String cinemaName) { this.cinemaName = cinemaName; }

    public String getScreenName() { return screenName; }
    public void setScreenName(String screenName) { this.screenName = screenName; }

    public String getFormatType() { return formatType; }
    public void setFormatType(String formatType) { this.formatType = formatType; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public List<SeatTierDTO> getTiers() { return tiers; }
    public void setTiers(List<SeatTierDTO> tiers) { this.tiers = tiers; }

    public Integer getTotalSeats() { return totalSeats; }
    public void setTotalSeats(Integer totalSeats) { this.totalSeats = totalSeats; }

    public Integer getAvailableSeats() { return availableSeats; }
    public void setAvailableSeats(Integer availableSeats) { this.availableSeats = availableSeats; }
}
