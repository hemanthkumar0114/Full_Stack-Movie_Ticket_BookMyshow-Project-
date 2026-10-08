package com.moviebooking.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.math.BigDecimal;

@ConfigurationProperties(prefix = "app.booking")
public record BookingProperties(BigDecimal convenienceFee, int lockMinutes, int maxSeatsPerBooking) {
}
