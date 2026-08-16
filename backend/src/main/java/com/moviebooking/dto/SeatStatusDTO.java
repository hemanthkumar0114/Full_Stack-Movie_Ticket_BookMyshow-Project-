package com.moviebooking.dto;

import java.math.BigDecimal;

public class SeatStatusDTO {
    private Long seatId;
    private String rowName;
    private Integer seatNumber;
    private String seatCode; // e.g. A4
    private String tierCategory; // RECLINER, PRIME, CLASSIC
    private BigDecimal price;
    private String status; // AVAILABLE, LOCKED, BOOKED
    private Boolean isLockedByMe;

    public SeatStatusDTO() {}

    public Long getSeatId() { return seatId; }
    public void setSeatId(Long seatId) { this.seatId = seatId; }

    public String getRowName() { return rowName; }
    public void setRowName(String rowName) { this.rowName = rowName; }

    public Integer getSeatNumber() { return seatNumber; }
    public void setSeatNumber(Integer seatNumber) { this.seatNumber = seatNumber; }

    public String getSeatCode() { return seatCode; }
    public void setSeatCode(String seatCode) { this.seatCode = seatCode; }

    public String getTierCategory() { return tierCategory; }
    public void setTierCategory(String tierCategory) { this.tierCategory = tierCategory; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getIsLockedByMe() { return isLockedByMe; }
    public void setIsLockedByMe(Boolean isLockedByMe) { this.isLockedByMe = isLockedByMe; }
}
