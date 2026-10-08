package com.moviebooking.scheduler;

import com.moviebooking.repository.ShowtimeSeatRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;

@Component
public class SeatLockCleanupWorker {

    private static final Logger logger = LoggerFactory.getLogger(SeatLockCleanupWorker.class);

    private final ShowtimeSeatRepository showtimeSeatRepository;
    private final Clock clock;

    public SeatLockCleanupWorker(ShowtimeSeatRepository showtimeSeatRepository, Clock clock) {
        this.showtimeSeatRepository = showtimeSeatRepository;
        this.clock = clock;
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cleanupExpiredLocks() {
        int released = showtimeSeatRepository.releaseExpiredLocks(LocalDateTime.now(clock));
        if (released > 0) {
            logger.info("Released {} expired seat locks", released);
        }
    }
}
