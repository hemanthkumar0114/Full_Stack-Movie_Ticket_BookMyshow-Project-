package com.moviebooking.service;

import com.moviebooking.dto.BookingConfirmRequest;
import com.moviebooking.dto.BookingResponseDTO;
import com.moviebooking.dto.SeatLockRequest;
import com.moviebooking.dto.SeatLockResponse;
import com.moviebooking.entity.*;
import com.moviebooking.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingItemRepository bookingItemRepository;

    @Autowired
    private ShowtimeRepository showtimeRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private ShowtimeSeatRepository showtimeSeatRepository;

    @Transactional
    public SeatLockResponse lockSeats(SeatLockRequest request) {
        showtimeSeatRepository.releaseExpiredLocks(LocalDateTime.now());

        Long showtimeId = request.getShowtimeId();
        List<Long> seatIds = request.getSeatIds();
        String sessionId = (request.getSessionId() != null && !request.getSessionId().isEmpty())
                ? request.getSessionId()
                : UUID.randomUUID().toString();

        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new RuntimeException("Showtime not found: " + showtimeId));

        List<ShowtimeSeat> existingShowtimeSeats = showtimeSeatRepository.findByShowtimeId(showtimeId);
        Map<Long, ShowtimeSeat> ssMap = existingShowtimeSeats.stream()
                .collect(Collectors.toMap(ss -> ss.getSeat().getId(), ss -> ss));

        LocalDateTime lockExpiry = LocalDateTime.now().plusMinutes(5);

        for (Long seatId : seatIds) {
            ShowtimeSeat ss = ssMap.get(seatId);
            if (ss != null) {
                if ("BOOKED".equalsIgnoreCase(ss.getStatus())) {
                    return new SeatLockResponse(false, "Seat #" + ss.getSeat().getRowName() + ss.getSeat().getSeatNumber() + " is already booked.");
                }
                if ("LOCKED".equalsIgnoreCase(ss.getStatus()) && ss.getLockedUntil() != null && ss.getLockedUntil().isAfter(LocalDateTime.now())) {
                    if (!sessionId.equals(ss.getLockedBySession())) {
                        return new SeatLockResponse(false, "Seat #" + ss.getSeat().getRowName() + ss.getSeat().getSeatNumber() + " is temporarily held by another customer.");
                    }
                }
            }
        }

        // Lock all seats for 5 minutes
        for (Long seatId : seatIds) {
            ShowtimeSeat ss = ssMap.get(seatId);
            if (ss == null) {
                Seat seat = seatRepository.findById(seatId)
                        .orElseThrow(() -> new RuntimeException("Seat not found: " + seatId));
                ss = new ShowtimeSeat();
                ss.setShowtime(showtime);
                ss.setSeat(seat);
            }
            ss.setStatus("LOCKED");
            ss.setLockedUntil(lockExpiry);
            ss.setLockedBySession(sessionId);
            showtimeSeatRepository.save(ss);
        }

        SeatLockResponse response = new SeatLockResponse(true, "Seats locked successfully for 5 minutes.");
        response.setSessionId(sessionId);
        response.setLockExpiresAt(lockExpiry);
        response.setLockedSeatIds(seatIds);
        return response;
    }

    @Transactional
    public BookingResponseDTO confirmBooking(BookingConfirmRequest request) {
        showtimeSeatRepository.releaseExpiredLocks(LocalDateTime.now());

        Showtime showtime = showtimeRepository.findById(request.getShowtimeId())
                .orElseThrow(() -> new RuntimeException("Showtime not found: " + request.getShowtimeId()));

        List<Seat> seats = seatRepository.findAllById(request.getSeatIds());
        if (seats.size() != request.getSeatIds().size()) {
            throw new RuntimeException("Some selected seats are invalid.");
        }

        List<ShowtimeSeat> showtimeSeats = showtimeSeatRepository.findByShowtimeId(request.getShowtimeId());
        Map<Long, ShowtimeSeat> ssMap = showtimeSeats.stream()
                .collect(Collectors.toMap(ss -> ss.getSeat().getId(), ss -> ss));

        // Verify seats are not booked by someone else
        for (Seat seat : seats) {
            ShowtimeSeat ss = ssMap.get(seat.getId());
            if (ss != null && "BOOKED".equalsIgnoreCase(ss.getStatus())) {
                throw new RuntimeException("Seat " + seat.getRowName() + seat.getSeatNumber() + " has already been booked.");
            }
        }

        // Mark seats as permanently BOOKED
        for (Seat seat : seats) {
            ShowtimeSeat ss = ssMap.get(seat.getId());
            if (ss == null) {
                ss = new ShowtimeSeat();
                ss.setShowtime(showtime);
                ss.setSeat(seat);
            }
            ss.setStatus("BOOKED");
            ss.setLockedUntil(null);
            ss.setLockedBySession(null);
            showtimeSeatRepository.save(ss);
        }

        // Calculate Subtotal & Total
        BigDecimal ticketSubtotal = BigDecimal.ZERO;
        for (Seat seat : seats) {
            ticketSubtotal = ticketSubtotal.add(seat.getBasePrice());
        }

        BigDecimal convenienceFee = new BigDecimal("35.00");
        BigDecimal totalAmount = ticketSubtotal.add(convenienceFee);

        // Generate unique BMS Booking Code (e.g. BMS-849204)
        String bookingCode = "BMS-" + (100000 + new Random().nextInt(900000));

        Booking booking = new Booking();
        booking.setBookingCode(bookingCode);
        booking.setUserName(request.getUserName());
        booking.setUserEmail(request.getUserEmail());
        booking.setUserPhone(request.getUserPhone() != null ? request.getUserPhone() : "+91 9876543210");
        booking.setTotalAmount(totalAmount);
        booking.setConvenienceFee(convenienceFee);
        booking.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "UPI (Fast Checkout)");
        booking.setBookingStatus("CONFIRMED");
        booking.setCreatedAt(LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(booking);

        List<BookingItem> items = new ArrayList<>();
        for (Seat seat : seats) {
            BookingItem item = new BookingItem();
            item.setBooking(savedBooking);
            item.setShowtime(showtime);
            item.setSeat(seat);
            item.setPrice(seat.getBasePrice());
            items.add(bookingItemRepository.save(item));
        }
        savedBooking.setItems(items);

        // Assemble DTO
        BookingResponseDTO response = new BookingResponseDTO();
        response.setBookingId(savedBooking.getId());
        response.setBookingCode(savedBooking.getBookingCode());
        response.setMovieTitle(showtime.getMovie().getTitle());
        response.setPosterUrl(showtime.getMovie().getPosterUrl());
        response.setCinemaName(showtime.getScreen().getCinema().getName());
        response.setScreenName(showtime.getScreen().getScreenName());
        response.setSoundType(showtime.getScreen().getSoundType());
        response.setFormatType(showtime.getFormatType());
        response.setShowTime(showtime.getStartTime());
        response.setUserName(savedBooking.getUserName());
        response.setUserEmail(savedBooking.getUserEmail());
        response.setUserPhone(savedBooking.getUserPhone());
        response.setSeatNumbers(seats.stream().map(s -> s.getRowName() + s.getSeatNumber()).collect(Collectors.toList()));
        response.setTicketSubtotal(ticketSubtotal);
        response.setConvenienceFee(convenienceFee);
        response.setTotalAmount(totalAmount);
        response.setPaymentMethod(savedBooking.getPaymentMethod());
        response.setBookingStatus(savedBooking.getBookingStatus());
        response.setBookingTime(savedBooking.getCreatedAt());

        return response;
    }

    public List<BookingResponseDTO> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc().stream().map(this::convertBookingToDTO).collect(Collectors.toList());
    }

    public List<BookingResponseDTO> getBookingsByEmail(String email) {
        return bookingRepository.findByUserEmailOrderByCreatedAtDesc(email).stream().map(this::convertBookingToDTO).collect(Collectors.toList());
    }

    private BookingResponseDTO convertBookingToDTO(Booking b) {
        BookingResponseDTO dto = new BookingResponseDTO();
        dto.setBookingId(b.getId());
        dto.setBookingCode(b.getBookingCode());
        dto.setUserName(b.getUserName());
        dto.setUserEmail(b.getUserEmail());
        dto.setUserPhone(b.getUserPhone());
        dto.setTotalAmount(b.getTotalAmount());
        dto.setConvenienceFee(b.getConvenienceFee());
        dto.setPaymentMethod(b.getPaymentMethod());
        dto.setBookingStatus(b.getBookingStatus());
        dto.setBookingTime(b.getCreatedAt());

        if (b.getItems() != null && !b.getItems().isEmpty()) {
            Showtime st = b.getItems().get(0).getShowtime();
            if (st != null) {
                dto.setMovieTitle(st.getMovie().getTitle());
                dto.setPosterUrl(st.getMovie().getPosterUrl());
                dto.setCinemaName(st.getScreen().getCinema().getName());
                dto.setScreenName(st.getScreen().getScreenName());
                dto.setSoundType(st.getScreen().getSoundType());
                dto.setFormatType(st.getFormatType());
                dto.setShowTime(st.getStartTime());
            }
            List<String> seatNumbers = b.getItems().stream()
                    .map(it -> it.getSeat().getRowName() + it.getSeat().getSeatNumber())
                    .collect(Collectors.toList());
            dto.setSeatNumbers(seatNumbers);
            BigDecimal subtotal = b.getItems().stream()
                    .map(BookingItem::getPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            dto.setTicketSubtotal(subtotal);
        }
        return dto;
    }
}
