package com.moviebooking.scheduler;

import com.moviebooking.repository.ShowtimeSeatRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
public class SeatLockCleanupWorker {

    private static final Logger logger = LoggerFactory.getLogger(SeatLockCleanupWorker.class);

    @Autowired
    private ShowtimeSeatRepository showtimeSeatRepository;

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cleanupExpiredLocks() {
        LocalDateTime now = LocalDateTime.now();
        showtimeSeatRepository.releaseExpiredLocks(now);
        logger.debug("Background cleanup worker released expired seat locks at {}", now);
    }
}
