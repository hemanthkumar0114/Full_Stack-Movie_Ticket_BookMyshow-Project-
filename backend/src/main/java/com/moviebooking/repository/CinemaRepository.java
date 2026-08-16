package com.moviebooking.repository;

import com.moviebooking.entity.Cinema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CinemaRepository extends JpaRepository<Cinema, Long> {
    List<Cinema> findByCityIgnoreCase(String city);
    List<Cinema> findByCityIgnoreCaseAndBrandIgnoreCase(String city, String brand);
}
