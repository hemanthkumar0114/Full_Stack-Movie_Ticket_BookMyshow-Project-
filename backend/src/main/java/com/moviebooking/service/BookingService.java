package com.moviebooking.service;

import com.moviebooking.config.BookingProperties;
import com.moviebooking.dto.BookingResponseDTO;
import com.moviebooking.dto.CreateBookingRequest;
import com.moviebooking.dto.SeatLockRequest;
import com.moviebooking.dto.SeatLockResponse;
import com.moviebooking.entity.Booking;
import com.moviebooking.entity.BookingItem;
import com.moviebooking.entity.Seat;
import com.moviebooking.entity.Showtime;
import com.moviebooking.entity.User;
import com.moviebooking.exception.InvalidBookingException;
import com.moviebooking.exception.ResourceNotFoundException;
import com.moviebooking.exception.SeatConflictException;
import com.moviebooking.repository.BookingRepository;
import com.moviebooking.repository.SeatRepository;
import com.moviebooking.repository.ShowtimeRepository;
import com.moviebooking.repository.ShowtimeSeatRepository;
import com.moviebooking.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class BookingService {

    private static final String STATUS_CONFIRMED = "CONFIRMED";

    private final BookingRepository bookingRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final ShowtimeSeatRepository showtimeSeatRepository;
    private final UserRepository userRepository;
    private final BookingMapper bookingMapper;
    private final BookingProperties properties;
    private final Clock clock;

    public BookingService(BookingRepository bookingRepository,
                          ShowtimeRepository showtimeRepository,
                          SeatRepository seatRepository,
                          ShowtimeSeatRepository showtimeSeatRepository,
                          UserRepository userRepository,
                          BookingMapper bookingMapper,
                          BookingProperties properties,
                          Clock clock) {
        this.bookingRepository = bookingRepository;
        this.showtimeRepository = showtimeRepository;
        this.seatRepository = seatRepository;
        this.showtimeSeatRepository = showtimeSeatRepository;
        this.userRepository = userRepository;
        this.bookingMapper = bookingMapper;
        this.properties = properties;
        this.clock = clock;
    }

    @Transactional
    public SeatLockResponse lockSeats(Long showtimeId, SeatLockRequest request, Long userId) {
        LocalDateTime now = LocalDateTime.now(clock);
        Showtime showtime = findBookableShowtime(showtimeId, now);
        List<Seat> seats = validateSeatSelection(showtime, request.seatIds());
        List<Long> seatIds = seats.stream().map(Seat::getId).toList();

        Set<Long> existingSeatIds = new HashSet<>(showtimeSeatRepository.findExistingSeatIds(showtimeId, seatIds));
        for (Long seatId : seatIds) {
            if (!existingSeatIds.contains(seatId)) {
                showtimeSeatRepository.insertIfAbsent(showtimeId, seatId);
            }
        }

        LocalDateTime lockExpiry = now.plusMinutes(properties.lockMinutes());
        int lockedRows = showtimeSeatRepository.lockSeatsAtomic(showtimeId, seatIds, userId, lockExpiry, now);
        if (lockedRows != seatIds.size()) {
            throw new SeatConflictException("One or more selected seats are no longer available or are held by another customer.");
        }

        return new SeatLockResponse(true,
                "Seats held for " + properties.lockMinutes() + " minutes.",
                lockExpiry,
                properties.lockMinutes() * 60L,
                seatIds);
    }

    @Transactional
    public BookingResponseDTO createBooking(CreateBookingRequest request, Long userId) {
        LocalDateTime now = LocalDateTime.now(clock);
        Showtime showtime = findBookableShowtime(request.showtimeId(), now);
        List<Seat> seats = validateSeatSelection(showtime, request.seatIds());
        List<Long> seatIds = seats.stream().map(Seat::getId).toList();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        int bookedRows = showtimeSeatRepository.confirmSeatsAtomic(showtime.getId(), seatIds, userId, now);
        if (bookedRows != seatIds.size()) {
            throw new SeatConflictException("Your seat hold has expired or these seats are no longer reserved for you. Please select your seats again.");
        }

        BigDecimal ticketSubtotal = seats.stream()
                .map(Seat::getBasePrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal convenienceFee = properties.convenienceFee();

        Booking booking = new Booking();
        booking.setBookingCode(generateBookingCode());
        booking.setUser(user);
        booking.setUserName(user.getName());
        booking.setUserEmail(user.getEmail());
        booking.setUserPhone(hasText(request.phone()) ? request.phone().trim() : user.getPhone());
        booking.setConvenienceFee(convenienceFee);
        booking.setTotalAmount(ticketSubtotal.add(convenienceFee));
        booking.setPaymentMethod(request.paymentMethod().name());
        booking.setBookingStatus(STATUS_CONFIRMED);
        booking.setCreatedAt(now);

        for (Seat seat : seats) {
            BookingItem item = new BookingItem();
            item.setShowtime(showtime);
            item.setSeat(seat);
            item.setPrice(seat.getBasePrice());
            booking.addItem(item);
        }

        return bookingMapper.toResponse(bookingRepository.save(booking));
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getBookingsForUser(Long userId) {
        return bookingRepository.findAllByUserIdWithDetails(userId).stream()
                .map(bookingMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BookingResponseDTO getBookingForUser(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findByIdAndUserIdWithDetails(bookingId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found."));
        return bookingMapper.toResponse(booking);
    }

    private Showtime findBookableShowtime(Long showtimeId, LocalDateTime now) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime not found: " + showtimeId));
        if (!showtime.getStartTime().isAfter(now)) {
            throw new InvalidBookingException("This showtime has already started and can no longer be booked.");
        }
        return showtime;
    }

    private List<Seat> validateSeatSelection(Showtime showtime, List<Long> requestedSeatIds) {
        if (requestedSeatIds == null || requestedSeatIds.isEmpty()) {
            throw new InvalidBookingException("At least one seat must be selected.");
        }
        if (new HashSet<>(requestedSeatIds).size() != requestedSeatIds.size()) {
            throw new InvalidBookingException("The same seat was selected more than once.");
        }
        if (requestedSeatIds.size() > properties.maxSeatsPerBooking()) {
            throw new InvalidBookingException("You can book at most " + properties.maxSeatsPerBooking() + " seats in one order.");
        }

        List<Seat> seats = new ArrayList<>(seatRepository.findByIdInAndScreenIdOrderByRowNameAscSeatNumberAsc(
                requestedSeatIds, showtime.getScreen().getId()));
        if (seats.size() != requestedSeatIds.size()) {
            throw new InvalidBookingException("One or more selected seats do not belong to this showtime's screen.");
        }
        return seats;
    }

    private String generateBookingCode() {
        return "BMS-" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
