package com.moviebooking.service;

import com.moviebooking.config.BookingProperties;
import com.moviebooking.dto.SeatStatusDTO;
import com.moviebooking.dto.SeatTierDTO;
import com.moviebooking.dto.ShowtimeSeatMapDTO;
import com.moviebooking.entity.Seat;
import com.moviebooking.entity.Showtime;
import com.moviebooking.entity.ShowtimeSeat;
import com.moviebooking.exception.ResourceNotFoundException;
import com.moviebooking.repository.SeatRepository;
import com.moviebooking.repository.ShowtimeRepository;
import com.moviebooking.repository.ShowtimeSeatRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class SeatService {

    private static final String AVAILABLE = "AVAILABLE";
    private static final String LOCKED = "LOCKED";
    private static final String BOOKED = "BOOKED";

    private static final List<String> TIER_ORDER = List.of("RECLINER", "PRIME", "CLASSIC");

    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final ShowtimeSeatRepository showtimeSeatRepository;
    private final BookingProperties properties;
    private final Clock clock;

    public SeatService(ShowtimeRepository showtimeRepository,
                       SeatRepository seatRepository,
                       ShowtimeSeatRepository showtimeSeatRepository,
                       BookingProperties properties,
                       Clock clock) {
        this.showtimeRepository = showtimeRepository;
        this.seatRepository = seatRepository;
        this.showtimeSeatRepository = showtimeSeatRepository;
        this.properties = properties;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public ShowtimeSeatMapDTO getSeatMapForShowtime(Long showtimeId, Long currentUserId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime not found: " + showtimeId));

        List<Seat> screenSeats = seatRepository.findByScreenIdOrderByRowNameAscSeatNumberAsc(showtime.getScreen().getId());
        Map<Long, ShowtimeSeat> showtimeSeatBySeatId = showtimeSeatRepository.findByShowtimeId(showtimeId).stream()
                .collect(Collectors.toMap(ss -> ss.getSeat().getId(), Function.identity()));

        LocalDateTime now = LocalDateTime.now(clock);
        Map<String, SeatTierDTO> tiers = new LinkedHashMap<>();
        int availableCount = 0;

        for (Seat seat : screenSeats) {
            ShowtimeSeat showtimeSeat = showtimeSeatBySeatId.get(seat.getId());
            String status = resolveStatus(showtimeSeat, now);
            boolean lockedByMe = LOCKED.equals(status)
                    && currentUserId != null
                    && currentUserId.equals(showtimeSeat.getLockedByUserId());

            if (AVAILABLE.equals(status) || lockedByMe) {
                availableCount++;
            }

            SeatStatusDTO seatDto = new SeatStatusDTO();
            seatDto.setSeatId(seat.getId());
            seatDto.setRowName(seat.getRowName());
            seatDto.setSeatNumber(seat.getSeatNumber());
            seatDto.setSeatCode(seat.getRowName() + seat.getSeatNumber());
            seatDto.setTierCategory(seat.getTierCategory());
            seatDto.setPrice(seat.getBasePrice());
            seatDto.setStatus(status);
            seatDto.setIsLockedByMe(lockedByMe);

            String tierName = seat.getTierCategory() == null ? "CLASSIC" : seat.getTierCategory().toUpperCase();
            tiers.computeIfAbsent(tierName, name -> newTier(name, seat.getBasePrice()))
                    .getSeats().add(seatDto);
        }

        ShowtimeSeatMapDTO response = new ShowtimeSeatMapDTO();
        response.setShowtimeId(showtime.getId());
        response.setMovieId(showtime.getMovie().getId());
        response.setMovieTitle(showtime.getMovie().getTitle());
        response.setPosterUrl(showtime.getMovie().getPosterUrl());
        response.setCinemaName(showtime.getScreen().getCinema().getName());
        response.setScreenName(showtime.getScreen().getScreenName());
        response.setFormatType(showtime.getFormatType());
        response.setStartTime(showtime.getStartTime());
        response.setTotalSeats(screenSeats.size());
        response.setAvailableSeats(availableCount);
        response.setConvenienceFee(properties.convenienceFee());
        response.setMaxSeatsPerBooking(properties.maxSeatsPerBooking());
        response.setLockMinutes(properties.lockMinutes());
        response.setTiers(sortTiers(tiers));
        return response;
    }

    private String resolveStatus(ShowtimeSeat showtimeSeat, LocalDateTime now) {
        if (showtimeSeat == null) {
            return AVAILABLE;
        }
        if (BOOKED.equalsIgnoreCase(showtimeSeat.getStatus())) {
            return BOOKED;
        }
        boolean holdIsActive = LOCKED.equalsIgnoreCase(showtimeSeat.getStatus())
                && showtimeSeat.getLockedUntil() != null
                && showtimeSeat.getLockedUntil().isAfter(now);
        return holdIsActive ? LOCKED : AVAILABLE;
    }

    private SeatTierDTO newTier(String tierName, BigDecimal price) {
        String displayName = tierName.charAt(0) + tierName.substring(1).toLowerCase();
        return new SeatTierDTO(tierName, displayName + " (₹" + price.setScale(2, RoundingMode.HALF_UP) + ")", price);
    }

    private List<SeatTierDTO> sortTiers(Map<String, SeatTierDTO> tiers) {
        List<SeatTierDTO> sorted = new ArrayList<>();
        for (String name : TIER_ORDER) {
            if (tiers.containsKey(name)) {
                sorted.add(tiers.remove(name));
            }
        }
        sorted.addAll(tiers.values());
        return sorted;
    }
}
