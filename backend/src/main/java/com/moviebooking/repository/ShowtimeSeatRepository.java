package com.moviebooking.repository;

import com.moviebooking.entity.ShowtimeSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ShowtimeSeatRepository extends JpaRepository<ShowtimeSeat, Long> {

    List<ShowtimeSeat> findByShowtimeId(Long showtimeId);

    @Query("SELECT ss FROM ShowtimeSeat ss WHERE ss.showtime.id = :showtimeId AND ss.seat.id IN :seatIds")
    List<ShowtimeSeat> findByShowtimeIdAndSeatIds(
            @Param("showtimeId") Long showtimeId,
            @Param("seatIds") List<Long> seatIds);

    @Query("SELECT ss.seat.id FROM ShowtimeSeat ss WHERE ss.showtime.id = :showtimeId AND ss.seat.id IN :seatIds")
    List<Long> findExistingSeatIds(
            @Param("showtimeId") Long showtimeId,
            @Param("seatIds") List<Long> seatIds);

    @Modifying(flushAutomatically = true)
    @Query(value = "INSERT IGNORE INTO showtime_seats (showtime_id, seat_id, status) " +
                   "VALUES (:showtimeId, :seatId, 'AVAILABLE')", nativeQuery = true)
    void insertIfAbsent(@Param("showtimeId") Long showtimeId, @Param("seatId") Long seatId);

    @Modifying(flushAutomatically = true)
    @Query("UPDATE ShowtimeSeat ss SET ss.status = 'LOCKED', ss.lockedByUserId = :userId, ss.lockedUntil = :expiry " +
           "WHERE ss.showtime.id = :showtimeId AND ss.seat.id IN :seatIds " +
           "AND (ss.status = 'AVAILABLE' " +
           "OR (ss.status = 'LOCKED' AND (ss.lockedUntil < :now OR ss.lockedByUserId = :userId)))")
    int lockSeatsAtomic(
            @Param("showtimeId") Long showtimeId,
            @Param("seatIds") List<Long> seatIds,
            @Param("userId") Long userId,
            @Param("expiry") LocalDateTime expiry,
            @Param("now") LocalDateTime now);

    @Modifying(flushAutomatically = true)
    @Query("UPDATE ShowtimeSeat ss SET ss.status = 'BOOKED', ss.lockedUntil = null, ss.lockedByUserId = null " +
           "WHERE ss.showtime.id = :showtimeId AND ss.seat.id IN :seatIds " +
           "AND ss.status = 'LOCKED' AND ss.lockedByUserId = :userId AND ss.lockedUntil > :now")
    int confirmSeatsAtomic(
            @Param("showtimeId") Long showtimeId,
            @Param("seatIds") List<Long> seatIds,
            @Param("userId") Long userId,
            @Param("now") LocalDateTime now);

    @Modifying(flushAutomatically = true)
    @Query("UPDATE ShowtimeSeat ss SET ss.status = 'AVAILABLE', ss.lockedUntil = null, ss.lockedByUserId = null " +
           "WHERE ss.status = 'LOCKED' AND ss.lockedUntil < :now")
    int releaseExpiredLocks(@Param("now") LocalDateTime now);
}
