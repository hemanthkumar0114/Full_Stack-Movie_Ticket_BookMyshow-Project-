package com.moviebooking.dto;

import java.time.LocalDateTime;
import java.util.List;

public class SeatLockResponse {
    private Boolean success;
    private String message;
    private String sessionId;
    private LocalDateTime lockExpiresAt;
    private List<Long> lockedSeatIds;

    public SeatLockResponse() {}

    public SeatLockResponse(Boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public Boolean getSuccess() { return success; }
    public Boolean isSuccess() { return Boolean.TRUE.equals(success); }
    public void setSuccess(Boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public LocalDateTime getLockExpiresAt() { return lockExpiresAt; }
    public void setLockExpiresAt(LocalDateTime lockExpiresAt) { this.lockExpiresAt = lockExpiresAt; }

    public List<Long> getLockedSeatIds() { return lockedSeatIds; }
    public void setLockedSeatIds(List<Long> lockedSeatIds) { this.lockedSeatIds = lockedSeatIds; }
}
