package com.moviebooking.repository;

import com.moviebooking.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByScreenIdOrderByRowNameAscSeatNumberAsc(Long screenId);
    List<Seat> findByIdInAndScreenIdOrderByRowNameAscSeatNumberAsc(Collection<Long> ids, Long screenId);
}
