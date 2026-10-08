# BookMyShow Clone: Movie Ticket Booking

A full stack movie ticket booking app. Users browse movies, pick a city and showtime, choose seats on a live seat map, hold them for a few minutes and confirm the booking. Seat holds and confirmations are handled atomically in the database, so two people can never book the same seat.

Live demo: https://bookmyshow-projects.netlify.app

The backend runs on a free plan, so the first request after a period of inactivity can take up to a minute.

## Tech Stack

Backend
- Java 17, Spring Boot 3.2
- Spring Security with stateless JWT authentication, BCrypt password hashing
- Spring Data JPA, Hibernate
- MySQL (H2 for tests)

Frontend
- React 19, Vite
- React Router 7
- Context API and custom hooks
- Plain CSS

## Features

- Register, login and logout with JWT
- Protected routes for seat booking and booking history
- Movie catalog with search, language and genre filters
- City selection and date based showtimes grouped by cinema
- Live seat map with tiers (Recliner, Prime, Classic), per-user seat holds with a countdown
- Atomic seat locking and confirmation: no double booking under concurrent requests
- Booking history scoped to the logged in user
- Unified JSON error responses with proper HTTP status codes
- Loading, error and retry states on every data screen
- Responsive layout for phones and desktops

## Screenshots

| Home | Showtimes |
| --- | --- |
| ![Home](docs/screenshots/home.png) | ![Showtimes](docs/screenshots/showtimes.png) |

| Seat selection | Booking history |
| --- | --- |
| ![Seat selection](docs/screenshots/seats.png) | ![Booking history](docs/screenshots/history.png) |

## Architecture Notes

- Controller, service, repository layers with DTOs; entities are never returned from controllers
- Seat hold and confirm use conditional bulk UPDATE statements and compare affected row counts, so a lost race rolls back with a 409
- A unique constraint on booking items (showtime, seat) is the final safety net
- Seat holds belong to the authenticated user, not to a client supplied id
- Booking lookups are filtered by user id, so other users' bookings return 404
- Fee, hold duration and seat limit come from configuration, not from the client

## Local Setup

Requirements: Java 17, Node 18 or newer, MySQL 8.

1. Clone the repo

```
git clone https://github.com/hemanthkumar0114/Full_Stack-Movie_Ticket_BookMyshow-Project-.git
cd Full_Stack-Movie_Ticket_BookMyshow-Project-
```

2. Create the database and sample data

```
mysql -u root -p < database-setup.sql
```

This drops and recreates all tables. Showtimes are generated relative to the day the script runs, so re-run it to refresh them.

3. Configure and start the backend

```
cd backend
```

Set these environment variables in your shell or IDE run configuration (see `backend/.env.example` for the full list):

| Variable | Example |
| --- | --- |
| DB_URL | jdbc:mysql://localhost:3306/bookmyshow_db |
| DB_USERNAME | root |
| DB_PASSWORD | your password |
| JWT_SECRET | any random string of 32 characters or more |
| CORS_ALLOWED_ORIGINS | http://localhost:5173 |

Then run:

```
./mvnw spring-boot:run
```

The API is available at http://localhost:8080/api/v1

4. Configure and start the frontend

```
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173

5. Run backend tests

```
cd backend
./mvnw test
```

## Deployment

- Frontend: set `VITE_API_URL` to the deployed backend URL ending in `/api/v1`
- Backend: set the same environment variables as above, with `CORS_ALLOWED_ORIGINS` set to the frontend URL

## Known Limitations

- Payment is simulated; no real payment gateway is connected
- The JWT is stored in localStorage, which is readable by scripts if the site has an XSS bug. An httpOnly cookie is the stronger option
- The app assumes a single timezone (configurable with `APP_TIMEZONE`)

## Author

Hemanth Kumar B M

- GitHub: https://github.com/hemanthkumar0114
- LinkedIn: https://linkedin.com/in/hemanth-kumar-469201393
