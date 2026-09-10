package com.moviebooking.service;

import com.moviebooking.dto.BookingConfirmRequest;
import com.moviebooking.dto.BookingResponseDTO;
import com.moviebooking.dto.SeatLockRequest;
import com.moviebooking.dto.SeatLockResponse;
import com.moviebooking.entity.*;
import com.moviebooking.exception.InvalidBookingException;
import com.moviebooking.exception.ResourceNotFoundException;
import com.moviebooking.exception.SeatConflictException;
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
        Long showtimeId = request.getShowtimeId();
        List<Long> seatIds = request.getSeatIds();
        String sessionId = request.getSessionId();

        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime not found: " + showtimeId));

        List<Seat> seats = seatRepository.findAllById(seatIds);
        if (seats.size() != seatIds.size()) {
            throw new InvalidBookingException("Some selected seats do not exist.");
        }

        // Ensure ShowtimeSeat records exist for all requested seats
        List<ShowtimeSeat> existingShowtimeSeats = showtimeSeatRepository.findByShowtimeIdAndSeatIds(showtimeId, seatIds);
        Set<Long> existingSeatIds = existingShowtimeSeats.stream()
                .map(ss -> ss.getSeat().getId())
                .collect(Collectors.toSet());

        List<ShowtimeSeat> newShowtimeSeats = new ArrayList<>();
        for (Seat seat : seats) {
            if (!existingSeatIds.contains(seat.getId())) {
                ShowtimeSeat ss = new ShowtimeSeat();
                ss.setShowtime(showtime);
                ss.setSeat(seat);
                ss.setStatus("AVAILABLE");
                ss.setLockedUntil(null);
                ss.setLockedBySession(null);
                newShowtimeSeats.add(ss);
            }
        }
        if (!newShowtimeSeats.isEmpty()) {
            try {
                showtimeSeatRepository.saveAllAndFlush(newShowtimeSeats);
            } catch (org.springframework.dao.DataIntegrityViolationException e) {
                // A concurrent thread inserted the ShowtimeSeat record simultaneously.
                // Catching this allows atomic update query to safely evaluate seat lock availability.
            }
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lockExpiry = now.plusMinutes(5);

        // Perform atomic lock update query
        int updatedRows = showtimeSeatRepository.lockSeatsAtomic(showtimeId, seatIds, sessionId, lockExpiry, now);

        if (updatedRows != seatIds.size()) {
            throw new SeatConflictException("One or more selected seats are no longer available or held by another customer.");
        }

        SeatLockResponse response = new SeatLockResponse(true, "Seats locked successfully for 5 minutes.");
        response.setSessionId(sessionId);
        response.setLockExpiresAt(lockExpiry);
        response.setLockedSeatIds(seatIds);
        return response;
    }

    @Transactional
    public BookingResponseDTO confirmBooking(BookingConfirmRequest request) {
        Showtime showtime = showtimeRepository.findById(request.getShowtimeId())
                .orElseThrow(() -> new ResourceNotFoundException("Showtime not found: " + request.getShowtimeId()));

        List<Seat> seats = seatRepository.findAllById(request.getSeatIds());
        if (seats.size() != request.getSeatIds().size()) {
            throw new InvalidBookingException("Some selected seats are invalid.");
        }

        List<ShowtimeSeat> showtimeSeats = showtimeSeatRepository.findByShowtimeIdAndSeatIds(request.getShowtimeId(), request.getSeatIds());
        Map<Long, ShowtimeSeat> ssMap = showtimeSeats.stream()
                .collect(Collectors.toMap(ss -> ss.getSeat().getId(), ss -> ss));

        LocalDateTime now = LocalDateTime.now();

        // Verification loop checking session ownership, status, and lock expiry
        for (Seat seat : seats) {
            ShowtimeSeat ss = ssMap.get(seat.getId());
            if (ss == null) {
                throw new SeatConflictException("Seat " + seat.getRowName() + seat.getSeatNumber() + " is not locked.");
            }
            if (!"LOCKED".equalsIgnoreCase(ss.getStatus())) {
                throw new SeatConflictException("Seat " + seat.getRowName() + seat.getSeatNumber() + " is not locked by your current session.");
            }
            if (!request.getSessionId().equals(ss.getLockedBySession())) {
                throw new SeatConflictException("Seat " + seat.getRowName() + seat.getSeatNumber() + " is held by another session.");
            }
            if (ss.getLockedUntil() == null || !ss.getLockedUntil().isAfter(now)) {
                throw new SeatConflictException("Seat lock for " + seat.getRowName() + seat.getSeatNumber() + " has expired.");
            }
        }

        // Mark seats as permanently BOOKED
        for (Seat seat : seats) {
            ShowtimeSeat ss = ssMap.get(seat.getId());
            ss.setStatus("BOOKED");
            ss.setLockedUntil(null);
            ss.setLockedBySession(null);
        }
        showtimeSeatRepository.saveAll(showtimeSeats);

        // Calculate Subtotal & Total
        BigDecimal ticketSubtotal = BigDecimal.ZERO;
        for (Seat seat : seats) {
            ticketSubtotal = ticketSubtotal.add(seat.getBasePrice());
        }

        BigDecimal convenienceFee = new BigDecimal("35.00");
        BigDecimal totalAmount = ticketSubtotal.add(convenienceFee);

        // Generate secure UUID-based booking code
        String bookingCode = "BMS-" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();

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
