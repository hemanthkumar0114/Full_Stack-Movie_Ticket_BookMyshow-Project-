package com.moviebooking.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class SeatTierDTO {
    private String tierName; // RECLINER, PRIME, CLASSIC
    private String tierLabel; // Recliner (₹450), Prime (₹280), Classic (₹180)
    private BigDecimal price;
    private List<SeatStatusDTO> seats = new ArrayList<>();

    public SeatTierDTO() {}

    public SeatTierDTO(String tierName, String tierLabel, BigDecimal price) {
        this.tierName = tierName;
        this.tierLabel = tierLabel;
        this.price = price;
    }

    public String getTierName() { return tierName; }
    public void setTierName(String tierName) { this.tierName = tierName; }

    public String getTierLabel() { return tierLabel; }
    public void setTierLabel(String tierLabel) { this.tierLabel = tierLabel; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public List<SeatStatusDTO> getSeats() { return seats; }
    public void setSeats(List<SeatStatusDTO> seats) { this.seats = seats; }
}
