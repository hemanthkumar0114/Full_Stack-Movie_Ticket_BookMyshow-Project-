package com.moviebooking.service;

import com.moviebooking.dto.SeatStatusDTO;
import com.moviebooking.dto.SeatTierDTO;
import com.moviebooking.dto.ShowtimeSeatMapDTO;
import com.moviebooking.entity.Seat;
import com.moviebooking.entity.Showtime;
import com.moviebooking.entity.ShowtimeSeat;
import com.moviebooking.repository.SeatRepository;
import com.moviebooking.repository.ShowtimeRepository;
import com.moviebooking.repository.ShowtimeSeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SeatService {

    @Autowired
    private ShowtimeRepository showtimeRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private ShowtimeSeatRepository showtimeSeatRepository;

    @Transactional
    public ShowtimeSeatMapDTO getSeatMapForShowtime(Long showtimeId, String sessionId) {
        // Auto-release any locks older than 5 minutes
        showtimeSeatRepository.releaseExpiredLocks(LocalDateTime.now());

        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new RuntimeException("Showtime not found: " + showtimeId));

        Long screenId = showtime.getScreen().getId();
        List<Seat> screenSeats = seatRepository.findByScreenIdOrderByRowNameAscSeatNumberAsc(screenId);

        // Fetch or create showtime seats
        List<ShowtimeSeat> showtimeSeats = showtimeSeatRepository.findByShowtimeId(showtimeId);
        Map<Long, ShowtimeSeat> seatStatusMap = showtimeSeats.stream()
                .collect(Collectors.toMap(ss -> ss.getSeat().getId(), ss -> ss));

        // Group into Tiers: RECLINER, PRIME, CLASSIC
        SeatTierDTO reclinerTier = new SeatTierDTO("RECLINER", "👑 Recliner (₹450.00)", new BigDecimal("450.00"));
        SeatTierDTO primeTier = new SeatTierDTO("PRIME", "⭐ Prime (₹280.00)", new BigDecimal("280.00"));
        SeatTierDTO classicTier = new SeatTierDTO("CLASSIC", "🎬 Classic (₹180.00)", new BigDecimal("180.00"));

        int totalSeats = screenSeats.size();
        int availableCount = 0;

        for (Seat seat : screenSeats) {
            ShowtimeSeat ss = seatStatusMap.get(seat.getId());
            String status = "AVAILABLE";
            boolean isLockedByMe = false;

            if (ss != null) {
                if ("BOOKED".equalsIgnoreCase(ss.getStatus())) {
                    status = "BOOKED";
                } else if ("LOCKED".equalsIgnoreCase(ss.getStatus())) {
                    if (ss.getLockedUntil() != null && ss.getLockedUntil().isAfter(LocalDateTime.now())) {
                        status = "LOCKED";
                        if (sessionId != null && sessionId.equals(ss.getLockedBySession())) {
                            isLockedByMe = true;
                        }
                    }
                }
            }

            if ("AVAILABLE".equals(status) || isLockedByMe) {
                availableCount++;
            }

            SeatStatusDTO seatDTO = new SeatStatusDTO();
            seatDTO.setSeatId(seat.getId());
            seatDTO.setRowName(seat.getRowName());
            seatDTO.setSeatNumber(seat.getSeatNumber());
            seatDTO.setSeatCode(seat.getRowName() + seat.getSeatNumber());
            seatDTO.setTierCategory(seat.getTierCategory());
            seatDTO.setPrice(seat.getBasePrice());
            seatDTO.setStatus(status);
            seatDTO.setIsLockedByMe(isLockedByMe);

            if ("RECLINER".equalsIgnoreCase(seat.getTierCategory())) {
                reclinerTier.getSeats().add(seatDTO);
            } else if ("PRIME".equalsIgnoreCase(seat.getTierCategory())) {
                primeTier.getSeats().add(seatDTO);
            } else {
                classicTier.getSeats().add(seatDTO);
            }
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
        response.setTotalSeats(totalSeats);
        response.setAvailableSeats(availableCount);

        List<SeatTierDTO> activeTiers = new ArrayList<>();
        if (!reclinerTier.getSeats().isEmpty()) activeTiers.add(reclinerTier);
        if (!primeTier.getSeats().isEmpty()) activeTiers.add(primeTier);
        if (!classicTier.getSeats().isEmpty()) activeTiers.add(classicTier);

        response.setTiers(activeTiers);
        return response;
    }
}
