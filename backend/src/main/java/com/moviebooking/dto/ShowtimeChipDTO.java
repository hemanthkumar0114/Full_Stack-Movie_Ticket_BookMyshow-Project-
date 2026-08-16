package com.moviebooking.dto;

import java.time.LocalDateTime;

public class ShowtimeChipDTO {
    private Long showtimeId;
    private LocalDateTime startTime;
    private String formatType;
    private String screenName;
    private String soundType;
    private String status; // AVAILABLE, FAST_FILLING, ALMOST_FULL, SOLD_OUT

    public ShowtimeChipDTO() {}

    public ShowtimeChipDTO(Long showtimeId, LocalDateTime startTime, String formatType, String screenName, String soundType, String status) {
        this.showtimeId = showtimeId;
        this.startTime = startTime;
        this.formatType = formatType;
        this.screenName = screenName;
        this.soundType = soundType;
        this.status = status;
    }

    public Long getShowtimeId() { return showtimeId; }
    public void setShowtimeId(Long showtimeId) { this.showtimeId = showtimeId; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public String getFormatType() { return formatType; }
    public void setFormatType(String formatType) { this.formatType = formatType; }

    public String getScreenName() { return screenName; }
    public void setScreenName(String screenName) { this.screenName = screenName; }

    public String getSoundType() { return soundType; }
    public void setSoundType(String soundType) { this.soundType = soundType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
