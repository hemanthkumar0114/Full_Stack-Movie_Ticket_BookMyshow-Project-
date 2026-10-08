package com.moviebooking.repository;

import com.moviebooking.entity.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {

    @Query("SELECT st FROM Showtime st JOIN FETCH st.screen sc JOIN FETCH sc.cinema c " +
           "WHERE st.movie.id = :movieId AND LOWER(c.city) = LOWER(:city) " +
           "AND st.startTime >= :from AND st.startTime < :to " +
           "ORDER BY c.name, st.startTime")
    List<Showtime> findShowtimesByMovieCityBetween(
            @Param("movieId") Long movieId,
            @Param("city") String city,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    @Query("SELECT st FROM Showtime st JOIN FETCH st.screen sc JOIN FETCH sc.cinema c " +
           "WHERE st.movie.id = :movieId AND LOWER(c.city) = LOWER(:city) " +
           "AND st.startTime >= :from " +
           "ORDER BY c.name, st.startTime")
    List<Showtime> findUpcomingShowtimesByMovieCity(
            @Param("movieId") Long movieId,
            @Param("city") String city,
            @Param("from") LocalDateTime from);
}
