-- =======================================================
-- BOOKMYSHOW DATABASE SCHEMA & SEED SCRIPT
-- Database: bookmyshow_db
-- =======================================================

CREATE DATABASE IF NOT EXISTS bookmyshow_db;
USE bookmyshow_db;

-- Disable Foreign Key checks for clean recreation
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS booking_items;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS showtime_seats;
DROP TABLE IF EXISTS seats;
DROP TABLE IF EXISTS showtimes;
DROP TABLE IF EXISTS screens;
DROP TABLE IF EXISTS cinemas;
DROP TABLE IF EXISTS movies;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. MOVIES TABLE
CREATE TABLE movies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tmdb_id BIGINT,
    title VARCHAR(255) NOT NULL,
    poster_url VARCHAR(500),
    backdrop_url VARCHAR(500),
    rating DECIMAL(3, 1) DEFAULT 8.0,
    vote_count INT DEFAULT 50000,
    runtime_min INT DEFAULT 120,
    languages VARCHAR(255) DEFAULT 'English, Hindi',
    genres VARCHAR(255) DEFAULT 'Action, Sci-Fi',
    certification VARCHAR(20) DEFAULT 'UA',
    release_date VARCHAR(50) DEFAULT 'Now Showing',
    trailer_url VARCHAR(500),
    description TEXT
);

-- 2. CINEMAS TABLE
CREATE TABLE cinemas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    location_address VARCHAR(500),
    facilities VARCHAR(255) DEFAULT 'M-Ticket, F&B Available, Recliners, Wheelchair Accessible'
);

-- 3. SCREENS TABLE
CREATE TABLE screens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cinema_id BIGINT NOT NULL,
    screen_name VARCHAR(100) NOT NULL,
    sound_type VARCHAR(100) DEFAULT 'Dolby Atmos 7.1',
    FOREIGN KEY (cinema_id) REFERENCES cinemas(id) ON DELETE CASCADE
);

-- 4. SHOWTIMES TABLE
CREATE TABLE showtimes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    movie_id BIGINT NOT NULL,
    screen_id BIGINT NOT NULL,
    start_time DATETIME NOT NULL,
    format_type VARCHAR(50) NOT NULL DEFAULT '2D Dolby Atmos',
    status VARCHAR(50) DEFAULT 'AVAILABLE',
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (screen_id) REFERENCES screens(id) ON DELETE CASCADE
);

-- 5. SEATS TEMPLATE TABLE (Per Screen)
CREATE TABLE seats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    screen_id BIGINT NOT NULL,
    row_name VARCHAR(5) NOT NULL,
    seat_number INT NOT NULL,
    tier_category VARCHAR(50) NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (screen_id) REFERENCES screens(id) ON DELETE CASCADE
);

-- 6. SHOWTIME SEATS (Live Availability & 5-minute Seat Locking)
CREATE TABLE showtime_seats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    showtime_id BIGINT NOT NULL,
    seat_id BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'AVAILABLE',
    locked_until DATETIME NULL,
    locked_by_user_id BIGINT NULL,
    FOREIGN KEY (showtime_id) REFERENCES showtimes(id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE CASCADE,
    UNIQUE KEY unique_showtime_seat (showtime_id, seat_id)
);

-- 7. USERS TABLE
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. BOOKINGS TABLE
CREATE TABLE bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_code VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_phone VARCHAR(50),
    total_amount DECIMAL(10, 2) NOT NULL,
    convenience_fee DECIMAL(10, 2) NOT NULL DEFAULT 35.00,
    payment_method VARCHAR(50) DEFAULT 'UPI / Credit Card',
    booking_status VARCHAR(50) DEFAULT 'CONFIRMED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 9. BOOKING ITEMS TABLE
CREATE TABLE booking_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    showtime_id BIGINT NOT NULL,
    seat_id BIGINT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (showtime_id) REFERENCES showtimes(id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE CASCADE,
    UNIQUE KEY uk_booking_items_showtime_seat (showtime_id, seat_id)
);

-- =======================================================
-- SEED DATA
-- =======================================================

-- 1. Insert Top Indian Blockbusters & Worldwide Titles (1 to 12)
INSERT INTO movies (id, tmdb_id, title, poster_url, backdrop_url, rating, vote_count, runtime_min, languages, genres, certification, release_date, trailer_url, description) VALUES
(1, 1022789, 'Kalki 2898 AD', 
 'https://image.tmdb.org/t/p/w500/8724d45ad8b965e8a5a4843.jpg', 
 'https://image.tmdb.org/t/p/original/rAiYTsqhk0GL00v8r1b0l3j0wsm.jpg', 
 9.2, 485600, 181, 'Telugu, Hindi, Tamil, Malayalam, Kannada', 'Sci-Fi, Action, Mythology', 'UA16+', 'In Cinemas Now', 'https://www.youtube.com/embed/kQDd1AhGIHk', 
 'Set in a dystopian post-apocalyptic world in 2898 AD, Supreme Yaskin rules the Complex. When SUM-80 escapes carrying the prophesied tenth avatar of Vishnu, bounty hunter Bhairava and Ashwatthama clash in a battle spanning millennia.'),

(2, 1100782, 'Stree 2: Sarkate Ka Aatank', 
 'https://image.tmdb.org/t/p/w500/6yOfh4K4V4z8B1qK0U2j0eK4g9G.jpg', 
 'https://image.tmdb.org/t/p/original/dqK9Hag1054tghRQSqLSfrkvQnA.jpg', 
 9.1, 340200, 147, 'Hindi', 'Horror, Comedy, Supernatural', 'UA', 'In Cinemas Now', 'https://www.youtube.com/embed/KVnheSnp7_U', 
 'The peaceful town of Chanderi is terrorized by a headless ghost named Sarkata who abducts progressive women. Vicky, Bittu, JD, and Jana must summon their original savior Stree to protect the town.'),

(3, 1144943, 'Devara: Part 1', 
 'https://image.tmdb.org/t/p/w500/A5XGk8c4mYvH6lT3p8w2v0K6u8n.jpg', 
 'https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg', 
 8.9, 295400, 178, 'Telugu, Hindi, Tamil, Kannada, Malayalam', 'Action, Drama, Thriller', 'UA16+', 'In Cinemas Now', 'https://www.youtube.com/embed/g_T8VnU2qYk', 
 'A fearless sea guardian stands up against perilous smugglers along coastal islands. When betrayal strikes, his bloodline continues the crusade against maritime ruthless cartels.'),

(4, 939243, 'Pushpa 2: The Rule', 
 'https://image.tmdb.org/t/p/w500/b1c0Yy2bN6A5eF2z2mZ4x1y0W2j.jpg', 
 'https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg', 
 9.5, 890500, 190, 'Telugu, Hindi, Tamil, Malayalam, Kannada', 'Action, Crime, Thriller', 'UA16+', 'Releasing 06 Dec 2026', 'https://www.youtube.com/embed/1kVK0MZlbI4', 
 'Pushpa Raj expands his red sandalwood smuggling syndicate across international borders while Bhanwar Singh Shekhawat seeks venomous retribution.'),

(5, 1184918, 'Singham Again', 
 'https://image.tmdb.org/t/p/w500/vQ9x5g1W1o7Z0X3n2c6V8j5K4u1.jpg', 
 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s520QIq.jpg', 
 9.0, 412300, 165, 'Hindi', 'Action, Cop Universe, Thriller', 'UA', 'Releasing Diwali 2026', 'https://www.youtube.com/embed/qeqA3Z1A2lY', 
 'Bajirao Singham leads the unified Cop Universe force on an international cross-border mission to dismantle a sinister terrorist cartel.'),

(6, 1184919, 'Bhool Bhulaiyaa 3', 
 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0w75Hl.jpg', 
 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg', 
 8.8, 388900, 155, 'Hindi', 'Horror, Comedy, Mystery', 'UA', 'Releasing Diwali 2026', 'https://www.youtube.com/embed/8Kq_yN89DVE', 
 'Rooh Baba returns to untangle the ancient cursed spirits of the royal palace as Manjulika resurfaces with deadlier supernatural powers.'),

(7, 1075676, 'Kantara: A Legend Chapter 1', 
 'https://image.tmdb.org/t/p/w500/mOX9e7hK8x4J9u1W2mZ4x1y0W2j.jpg', 
 'https://image.tmdb.org/t/p/original/rAiYTsqhk0GL00v8r1b0l3j0wsm.jpg', 
 9.4, 650000, 170, 'Kannada, Hindi, Telugu, Tamil, Malayalam', 'Action, Folklore, Drama', 'UA16+', 'Releasing Dec 2026', 'https://www.youtube.com/embed/g8mwb_3g6p8', 
 'The origin story of the Panjurli Daiva and Guliga legend set during the Kadamba dynasty, exploring the spiritual covenant between nature and indigenous royalties.'),

(8, 872906, 'Jawan', 
 'https://image.tmdb.org/t/p/w500/jLLtx3nTRSLGPAKl4RoIv1FbNV8.jpg', 
 'https://image.tmdb.org/t/p/original/dqK9Hag1054tghRQSqLSfrkvQnA.jpg', 
 8.8, 520100, 169, 'Hindi, Tamil, Telugu', 'Action, Thriller, Vigilante', 'UA16+', 'In Cinemas Now', 'https://www.youtube.com/embed/COv52Qyctws', 
 'A prison warden driven by personal vendetta and systemic corruption mobilizes a specialized team of inmates to hold the state accountable.'),

(9, 1241982, 'Manjummel Boys', 
 'https://image.tmdb.org/t/p/w500/b9vDq8j5G0x2mZ4x1y0W2j0eK4g.jpg', 
 'https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg', 
 9.3, 310800, 135, 'Malayalam, Tamil, Telugu, Hindi', 'Survival, Adventure, Drama', 'U', 'In Cinemas Now', 'https://www.youtube.com/embed/id6mNswq094', 
 'Based on a real incident: a group of young friends from Kochi embark on a trip to Kodaikanal where one of them falls into the pitch-black abyss of Guna Caves.'),

(10, 1249071, 'Aavesham', 
 'https://image.tmdb.org/t/p/w500/7I6VUdPj6tQwhd10Rz0y2e2m1aC.jpg', 
 'https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg', 
 9.0, 220400, 158, 'Malayalam, Hindi, Telugu', 'Action, Comedy, Crime', 'UA', 'In Cinemas Now', 'https://www.youtube.com/embed/L0yEMl8PXnw', 
 'Three engineering college students in Bengaluru seeking protection from campus bullies cross paths with Ranga, an eccentric local gangster.'),

(11, 1075794, 'Leo', 
 'https://image.tmdb.org/t/p/w500/pZE6U75lB3z74xM6JbC7y1y0W2j.jpg', 
 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s520QIq.jpg', 
 8.7, 430700, 164, 'Tamil, Telugu, Hindi, Kannada', 'Action, Thriller, Crime', 'UA16+', 'In Cinemas Now', 'https://www.youtube.com/embed/Po3jStA673E', 
 'A calm cafe owner in Himachal Pradesh becomes an overnight hero after foiling an armed robbery, which attracts a ruthless gang convinced he is Leo Das.'),

(12, 872585, 'Salaar: Part 1 - Ceasefire', 
 'https://image.tmdb.org/t/p/w500/bF8u7iX6W9y0Z1A1x1y0W2j0eK4.jpg', 
 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg', 
 8.9, 390100, 175, 'Telugu, Hindi, Kannada, Tamil, Malayalam', 'Action, Crime, Drama', 'A', 'In Cinemas Now', 'https://www.youtube.com/embed/4GPvYMKtrtI', 
 'In the dystopian sovereign city-state of Khansaar, a childhood friendship transforms into a brutal war of supremacy when the royal throne faces a military coup.');

-- 2. Insert Cinemas Across Cities
INSERT INTO cinemas (id, name, brand, city, location_address, facilities) VALUES
(1, 'PVR ICON: Phoenix Palladium', 'PVR', 'Mumbai', '462, Senapati Bapat Marg, Lower Parel, Mumbai', 'M-Ticket, Food & Beverage, Recliners, Wheelchair Accessible, Valet Parking'),
(2, 'INOX: Megaplex Inorbit Mall', 'INOX', 'Mumbai', 'Link Road, Malad West, Mumbai', 'M-Ticket, F&B, IMAX Laser, Dolby Atmos, Wheelchair Access'),
(3, 'Cinepolis: Grand Central Mall', 'Cinepolis', 'Mumbai', 'Seawoods Grand Central, Sector 40, Navi Mumbai', 'M-Ticket, F&B, 4DX, VIP Lounge'),

(4, 'PVR Directors Cut: Ambience Mall', 'PVR', 'Delhi-NCR', 'Ambience Mall, Nelson Mandela Road, Vasant Kunj, New Delhi', 'M-Ticket, Luxury Dine-in, Recliners, Valet'),
(5, 'INOX: Pacific Mall', 'INOX', 'Delhi-NCR', 'Tagore Garden, Subhash Nagar, New Delhi', 'M-Ticket, F&B, IMAX 3D, Dolby Atmos'),

(6, 'PVR: Forum Mall Koramangala', 'PVR', 'Bengaluru', 'Hosur Road, Koramangala, Bengaluru', 'M-Ticket, F&B, IMAX Laser, Gold Class'),
(7, 'Cinepolis: Forum Shantiniketan', 'Cinepolis', 'Bengaluru', 'Whitefield Main Road, Bengaluru', 'M-Ticket, F&B, Dolby Atmos, VIP Lounge'),

(8, 'Prasads Multiplex: IMAX', 'Prasads', 'Hyderabad', 'NTR Gardens, Khairatabad, Hyderabad', 'M-Ticket, Large Screen IMAX, F&B, Parking'),
(9, 'PVR: Inorbit Mall Hitech City', 'PVR', 'Hyderabad', 'Hitech City, Madhapur, Hyderabad', 'M-Ticket, 4DX, Recliners, F&B'),

(10, 'AMC Empire 25: Times Square', 'AMC', 'New York', '234 W 42nd St, New York, NY 10036', 'M-Ticket, Dolby Cinema, IMAX Laser, Recliners, Full Bar'),
(11, 'BFI IMAX: Waterloo', 'ODEON', 'London', '1 Charlie Chaplin Walk, South Bank, London SE1 8XR', 'M-Ticket, Giant 70mm IMAX Screen, Wheelchair Access, Cafe');

-- 3. Insert Screens (Auditoriums)
INSERT INTO screens (id, cinema_id, screen_name, sound_type) VALUES
(1, 1, 'Audi 1 - IMAX with Laser', 'IMAX 12.1 Immersive Sound'),
(2, 1, 'Audi 2 - P[XL] Dolby Atmos', 'Dolby Atmos 7.1 Surround'),
(3, 2, 'Audi 1 - IMAX Laser 3D', 'IMAX 12.1 Immersive Sound'),
(4, 2, 'Audi 2 - ScreenX 270', 'Dolby Atmos 7.1 Surround'),
(5, 3, 'Audi 1 - 4DX Dynamic', 'Dolby Atmos 7.1 Surround'),
(6, 4, 'Audi 1 - VIP Directors Cut', 'Dolby Atmos 7.1 Surround'),
(7, 5, 'Audi 1 - IMAX Laser', 'IMAX 12.1 Immersive Sound'),
(8, 6, 'Audi 1 - IMAX Laser', 'IMAX 12.1 Immersive Sound'),
(9, 8, 'Audi 1 - Prasads Large Format', 'Dolby Atmos 7.1 Surround'),
(10, 10, 'Audi 1 - Dolby Cinema at AMC', 'Dolby Atmos 7.1 Surround'),
(11, 11, 'Audi 1 - BFI Giant IMAX', 'IMAX 12.1 Immersive Sound');

-- 4. Generate Standard Tiered Seats for Screens
INSERT INTO seats (screen_id, row_name, seat_number, tier_category, base_price)
SELECT s.id, r.row_name, n.seat_number,
       CASE 
         WHEN r.row_name = 'A' THEN 'RECLINER'
         WHEN r.row_name IN ('B', 'C', 'D') THEN 'PRIME'
         ELSE 'CLASSIC'
       END,
       CASE 
         WHEN r.row_name = 'A' THEN 450.00
         WHEN r.row_name IN ('B', 'C', 'D') THEN 280.00
         ELSE 180.00
       END
FROM screens s
CROSS JOIN (
    SELECT 'A' AS row_name UNION ALL
    SELECT 'B' UNION ALL
    SELECT 'C' UNION ALL
    SELECT 'D' UNION ALL
    SELECT 'E' UNION ALL
    SELECT 'F'
) r
CROSS JOIN (
    SELECT 1 AS seat_number UNION ALL
    SELECT 2 UNION ALL
    SELECT 3 UNION ALL
    SELECT 4 UNION ALL
    SELECT 5 UNION ALL
    SELECT 6 UNION ALL
    SELECT 7 UNION ALL
    SELECT 8 UNION ALL
    SELECT 9 UNION ALL
    SELECT 10
) n;

-- 5. Insert Showtimes for today and the next two days (dates are relative to the day this script runs)
INSERT INTO showtimes (id, movie_id, screen_id, start_time, format_type, status) VALUES
-- TODAY
(1, 1, 1, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '10:30:00'), 'IMAX 2D', 'AVAILABLE'),
(2, 1, 1, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '14:15:00'), 'IMAX 2D', 'FAST_FILLING'),
(3, 1, 1, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '18:00:00'), 'IMAX 2D', 'ALMOST_FULL'),
(4, 1, 1, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '21:45:00'), 'IMAX 2D', 'AVAILABLE'),
(5, 1, 2, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '11:00:00'), '2D Dolby Atmos', 'AVAILABLE'),
(6, 1, 2, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '15:30:00'), '2D Dolby Atmos', 'FAST_FILLING'),
(7, 1, 3, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '13:00:00'), 'IMAX 2D', 'AVAILABLE'),
(8, 1, 3, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '17:30:00'), 'IMAX 2D', 'ALMOST_FULL'),
(9, 1, 5, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '12:45:00'), '4DX 3D', 'AVAILABLE'),
(10, 1, 5, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '16:30:00'), '4DX 3D', 'FAST_FILLING'),

-- The Dark Knight (Movie 2) today
(11, 2, 1, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '11:30:00'), 'IMAX 2D', 'AVAILABLE'),
(12, 2, 1, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '15:45:00'), 'IMAX 2D', 'FAST_FILLING'),
(13, 2, 1, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '20:00:00'), 'IMAX 2D', 'ALMOST_FULL'),
(14, 2, 2, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '14:00:00'), '2D Dolby Atmos', 'AVAILABLE'),
(15, 2, 3, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '18:30:00'), 'IMAX 2D', 'FAST_FILLING'),

-- Inception (Movie 3) today
(16, 3, 1, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '10:00:00'), 'IMAX 2D', 'AVAILABLE'),
(17, 3, 1, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '14:30:00'), 'IMAX 2D', 'AVAILABLE'),
(18, 3, 2, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '19:15:00'), '2D Dolby Atmos', 'FAST_FILLING'),

-- Avengers: Endgame (Movie 4) today
(19, 4, 1, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '09:00:00'), 'IMAX 3D', 'FAST_FILLING'),
(20, 4, 1, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '13:30:00'), 'IMAX 3D', 'ALMOST_FULL'),
(21, 4, 2, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '17:45:00'), '3D Dolby Atmos', 'FAST_FILLING'),

-- Dune: Part Two (Movie 5) today
(22, 5, 1, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '12:00:00'), 'IMAX 2D', 'AVAILABLE'),
(23, 5, 3, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '16:15:00'), 'IMAX 2D', 'FAST_FILLING'),

-- Oppenheimer (Movie 6) today
(24, 6, 1, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '15:00:00'), 'IMAX 70mm', 'ALMOST_FULL'),
(25, 6, 2, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '20:30:00'), '2D Dolby Atmos', 'AVAILABLE'),

-- TOMORROW
(26, 1, 1, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '11:00:00'), 'IMAX 2D', 'AVAILABLE'),
(27, 1, 1, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '16:00:00'), 'IMAX 2D', 'FAST_FILLING'),
(28, 2, 1, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:00:00'), 'IMAX 2D', 'AVAILABLE'),
(29, 2, 2, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '19:30:00'), '2D Dolby Atmos', 'FAST_FILLING'),
(30, 3, 2, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '17:00:00'), '2D Dolby Atmos', 'AVAILABLE'),
(31, 4, 1, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '20:30:00'), 'IMAX 3D', 'ALMOST_FULL'),
(32, 5, 3, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '15:30:00'), 'IMAX 2D', 'AVAILABLE'),
(33, 6, 1, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '12:30:00'), 'IMAX 70mm', 'FAST_FILLING'),

-- DAY AFTER TOMORROW
(34, 1, 1, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '10:30:00'), 'IMAX 2D', 'AVAILABLE'),
(35, 2, 1, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '14:15:00'), 'IMAX 2D', 'AVAILABLE'),
(36, 3, 1, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '18:00:00'), 'IMAX 2D', 'FAST_FILLING'),
(37, 4, 2, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '13:00:00'), '3D Dolby Atmos', 'AVAILABLE'),
(38, 5, 1, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '16:45:00'), 'IMAX 2D', 'AVAILABLE'),
(39, 6, 2, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '20:15:00'), '2D Dolby Atmos', 'FAST_FILLING'),

-- Other Cities (Delhi-NCR, Bengaluru, Hyderabad, NY, London)
(40, 1, 6, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '13:00:00'), 'VIP Luxe', 'AVAILABLE'),
(41, 1, 6, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '18:30:00'), 'VIP Luxe', 'FAST_FILLING'),
(42, 2, 7, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '14:00:00'), 'IMAX 2D', 'AVAILABLE'),
(43, 2, 7, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '18:00:00'), 'IMAX 2D', 'FAST_FILLING'),
(44, 1, 8, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '11:30:00'), 'IMAX 2D', 'AVAILABLE'),
(45, 2, 8, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '16:00:00'), 'IMAX 2D', 'FAST_FILLING'),
(46, 1, 9, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '10:45:00'), 'IMAX Large Format', 'FAST_FILLING'),
(47, 3, 9, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '15:15:00'), 'IMAX Large Format', 'ALMOST_FULL'),
(48, 1, 10, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '12:00:00'), 'Dolby Cinema', 'AVAILABLE'),
(49, 2, 10, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '17:00:00'), 'Dolby Cinema', 'FAST_FILLING'),
(50, 1, 11, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 0 DAY), '13:30:00'), '70mm BFI IMAX', 'FAST_FILLING');

-- 6. Populate Initial Showtime Seats for showtimes 1 to 40
INSERT INTO showtime_seats (showtime_id, seat_id, status)
SELECT st.id, s.id, 'AVAILABLE'
FROM showtimes st
JOIN seats s ON s.screen_id = st.screen_id;

-- Simulate realistic pre-booked seats
UPDATE showtime_seats 
SET status = 'BOOKED' 
WHERE showtime_id = 1 AND seat_id IN (
    SELECT id FROM (
        SELECT s.id FROM seats s WHERE s.screen_id = 1 AND s.row_name = 'B' AND s.seat_number IN (4, 5, 6, 7)
    ) tmp
);

UPDATE showtime_seats 
SET status = 'BOOKED' 
WHERE showtime_id = 2 AND seat_id IN (
    SELECT id FROM (
        SELECT s.id FROM seats s WHERE s.screen_id = 1 AND s.row_name IN ('A', 'C') AND s.seat_number IN (1, 2, 5, 6, 8, 9)
    ) tmp
);
