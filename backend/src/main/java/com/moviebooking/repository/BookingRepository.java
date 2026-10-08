package com.moviebooking.repository;

import com.moviebooking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("SELECT DISTINCT b FROM Booking b " +
           "JOIN FETCH b.items i " +
           "JOIN FETCH i.seat " +
           "JOIN FETCH i.showtime st " +
           "JOIN FETCH st.movie " +
           "JOIN FETCH st.screen sc " +
           "JOIN FETCH sc.cinema " +
           "WHERE b.user.id = :userId " +
           "ORDER BY b.createdAt DESC")
    List<Booking> findAllByUserIdWithDetails(@Param("userId") Long userId);

    @Query("SELECT DISTINCT b FROM Booking b " +
           "JOIN FETCH b.items i " +
           "JOIN FETCH i.seat " +
           "JOIN FETCH i.showtime st " +
           "JOIN FETCH st.movie " +
           "JOIN FETCH st.screen sc " +
           "JOIN FETCH sc.cinema " +
           "WHERE b.id = :bookingId AND b.user.id = :userId")
    Optional<Booking> findByIdAndUserIdWithDetails(@Param("bookingId") Long bookingId, @Param("userId") Long userId);
}
