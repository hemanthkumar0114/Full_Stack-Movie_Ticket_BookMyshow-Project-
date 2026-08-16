package com.moviebooking.dto;

import java.util.ArrayList;
import java.util.List;

public class CinemaShowtimeDTO {
    private Long cinemaId;
    private String name;
    private String brand;
    private String city;
    private String locationAddress;
    private String facilities;
    private List<ShowtimeChipDTO> showtimes = new ArrayList<>();

    public CinemaShowtimeDTO() {}

    public Long getCinemaId() { return cinemaId; }
    public void setCinemaId(Long cinemaId) { this.cinemaId = cinemaId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getLocationAddress() { return locationAddress; }
    public void setLocationAddress(String locationAddress) { this.locationAddress = locationAddress; }

    public String getFacilities() { return facilities; }
    public void setFacilities(String facilities) { this.facilities = facilities; }

    public List<ShowtimeChipDTO> getShowtimes() { return showtimes; }
    public void setShowtimes(List<ShowtimeChipDTO> showtimes) { this.showtimes = showtimes; }
}
