package com.moviebooking.dto;

import java.util.List;

public class SeatLockRequest {
    private Long showtimeId;
    private List<Long> seatIds;
    private String sessionId; // Browser session identifier

    public SeatLockRequest() {}

    public Long getShowtimeId() { return showtimeId; }
    public void setShowtimeId(Long showtimeId) { this.showtimeId = showtimeId; }

    public List<Long> getSeatIds() { return seatIds; }
    public void setSeatIds(List<Long> seatIds) { this.seatIds = seatIds; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
}
