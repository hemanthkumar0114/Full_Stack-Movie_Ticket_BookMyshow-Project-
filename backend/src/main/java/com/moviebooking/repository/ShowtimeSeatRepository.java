package com.moviebooking.repository;

import com.moviebooking.entity.ShowtimeSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShowtimeSeatRepository extends JpaRepository<ShowtimeSeat, Long> {
    List<ShowtimeSeat> findByShowtimeId(Long showtimeId);

    Optional<ShowtimeSeat> findByShowtimeIdAndSeatId(Long showtimeId, Long seatId);

    @Query("SELECT ss FROM ShowtimeSeat ss WHERE ss.showtime.id = :showtimeId AND ss.seat.id IN :seatIds")
    List<ShowtimeSeat> findByShowtimeIdAndSeatIds(
            @Param("showtimeId") Long showtimeId,
            @Param("seatIds") List<Long> seatIds);

    @Modifying
    @Query("UPDATE ShowtimeSeat ss SET ss.status = 'AVAILABLE', ss.lockedUntil = null, ss.lockedBySession = null " +
           "WHERE ss.status = 'LOCKED' AND ss.lockedUntil < :now")
    void releaseExpiredLocks(@Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE ShowtimeSeat ss SET ss.status = 'LOCKED', ss.lockedBySession = :sessionId, ss.lockedUntil = :expiry " +
           "WHERE ss.showtime.id = :showtimeId AND ss.seat.id IN :seatIds " +
           "AND (ss.status = 'AVAILABLE' OR (ss.status = 'LOCKED' AND (ss.lockedUntil < :now OR ss.lockedBySession = :sessionId)))")
    int lockSeatsAtomic(
            @Param("showtimeId") Long showtimeId,
            @Param("seatIds") List<Long> seatIds,
            @Param("sessionId") String sessionId,
            @Param("expiry") LocalDateTime expiry,
            @Param("now") LocalDateTime now);
}
