package com.moviebooking.service;

import com.moviebooking.dto.BookingResponseDTO;
import com.moviebooking.entity.Booking;
import com.moviebooking.entity.BookingItem;
import com.moviebooking.entity.Showtime;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

@Component
public class BookingMapper {

    public BookingResponseDTO toResponse(Booking booking) {
        BookingResponseDTO dto = new BookingResponseDTO();
        dto.setBookingId(booking.getId());
        dto.setBookingCode(booking.getBookingCode());
        dto.setUserName(booking.getUserName());
        dto.setUserEmail(booking.getUserEmail());
        dto.setUserPhone(booking.getUserPhone());
        dto.setConvenienceFee(booking.getConvenienceFee());
        dto.setTotalAmount(booking.getTotalAmount());
        dto.setPaymentMethod(booking.getPaymentMethod());
        dto.setBookingStatus(booking.getBookingStatus());
        dto.setBookingTime(booking.getCreatedAt());

        List<BookingItem> items = booking.getItems().stream()
                .sorted(Comparator
                        .comparing((BookingItem item) -> item.getSeat().getRowName())
                        .thenComparing(item -> item.getSeat().getSeatNumber()))
                .toList();

        if (!items.isEmpty()) {
            Showtime showtime = items.get(0).getShowtime();
            dto.setMovieTitle(showtime.getMovie().getTitle());
            dto.setPosterUrl(showtime.getMovie().getPosterUrl());
            dto.setCinemaName(showtime.getScreen().getCinema().getName());
            dto.setScreenName(showtime.getScreen().getScreenName());
            dto.setSoundType(showtime.getScreen().getSoundType());
            dto.setFormatType(showtime.getFormatType());
            dto.setShowTime(showtime.getStartTime());
        }

        dto.setSeatNumbers(items.stream()
                .map(item -> item.getSeat().getRowName() + item.getSeat().getSeatNumber())
                .toList());
        dto.setTicketSubtotal(items.stream()
                .map(BookingItem::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        return dto;
    }
}
