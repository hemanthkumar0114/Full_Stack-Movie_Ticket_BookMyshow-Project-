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
    List<Showtime> findByMovieId(Long movieId);

    @Query("SELECT st FROM Showtime st JOIN FETCH st.screen sc JOIN FETCH sc.cinema c " +
           "WHERE st.movie.id = :movieId AND LOWER(c.city) = LOWER(:city) " +
           "AND st.startTime >= :startOfDay AND st.startTime < :endOfDay " +
           "ORDER BY c.name, st.startTime")
    List<Showtime> findShowtimesByMovieCityDate(
            @Param("movieId") Long movieId,
            @Param("city") String city,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay);

    @Query("SELECT st FROM Showtime st JOIN FETCH st.screen sc JOIN FETCH sc.cinema c " +
           "WHERE st.movie.id = :movieId AND LOWER(c.city) = LOWER(:city) " +
           "ORDER BY c.name, st.startTime")
    List<Showtime> findShowtimesByMovieCity(
            @Param("movieId") Long movieId,
            @Param("city") String city);
}
