package com.moviebooking;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SecurityIntegrationTest extends IntegrationTestBase {

    @Test
    @DisplayName("Booking history without a token is rejected with 401")
    void historyRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/bookings"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("A garbage token is rejected with 401")
    void invalidTokenIsRejected() throws Exception {
        mockMvc.perform(get("/api/v1/bookings").header(HttpHeaders.AUTHORIZATION, "Bearer not-a-real-token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Movie catalogue stays public")
    void moviesArePublic() throws Exception {
        mockMvc.perform(get("/api/v1/movies/now-playing"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Register, then call a protected endpoint with the returned token")
    void registerThenAccessProtectedEndpoint() throws Exception {
        String token = register("asha@example.com", "Passw0rd!");

        mockMvc.perform(get("/api/v1/bookings").header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        mockMvc.perform(get("/api/v1/auth/me").header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("asha@example.com"));
    }

    @Test
    @DisplayName("Registering the same email twice returns 409")
    void duplicateRegistrationReturnsConflict() throws Exception {
        register("dup@example.com", "Passw0rd!");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody("dup@example.com", "Passw0rd!")))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Invalid registration data returns 400 with field errors")
    void invalidRegistrationReturnsFieldErrors() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "A", "email", "not-an-email", "password", "short"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.email").value(notNullValue()))
                .andExpect(jsonPath("$.fieldErrors.password").value(notNullValue()));
    }

    @Test
    @DisplayName("Wrong password and unknown email both return the same 401")
    void badCredentialsReturnUnauthorized() throws Exception {
        register("login@example.com", "Passw0rd!");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody("login@example.com", "WrongPass1")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password."));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody("nobody@example.com", "Passw0rd!")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password."));
    }

    @Test
    @DisplayName("A user can only see their own bookings and gets 404 for someone else's")
    void bookingsAreIsolatedBetweenUsers() throws Exception {
        String ownerToken = register("owner@example.com", "Passw0rd!");
        String otherToken = register("other@example.com", "Passw0rd!");
        Long seatId = fixture.seatIds().get(0);

        mockMvc.perform(post("/api/v1/showtimes/{id}/seat-locks", fixture.showtimeId())
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("seatIds", List.of(seatId)))))
                .andExpect(status().isCreated());

        MvcResult created = mockMvc.perform(post("/api/v1/bookings")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "showtimeId", fixture.showtimeId(),
                                "seatIds", List.of(seatId),
                                "paymentMethod", "UPI"))))
                .andExpect(status().isCreated())
                .andExpect(header().exists(HttpHeaders.LOCATION))
                .andReturn();
        long bookingId = objectMapper.readTree(created.getResponse().getContentAsString()).get("bookingId").asLong();

        mockMvc.perform(get("/api/v1/bookings").header(HttpHeaders.AUTHORIZATION, "Bearer " + ownerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        mockMvc.perform(get("/api/v1/bookings").header(HttpHeaders.AUTHORIZATION, "Bearer " + otherToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        mockMvc.perform(get("/api/v1/bookings/{id}", bookingId).header(HttpHeaders.AUTHORIZATION, "Bearer " + otherToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("CORS allows the configured origin and rejects others")
    void corsOnlyAllowsConfiguredOrigin() throws Exception {
        mockMvc.perform(options("/api/v1/movies/now-playing")
                        .header(HttpHeaders.ORIGIN, "http://localhost:5173")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5173"));

        mockMvc.perform(options("/api/v1/movies/now-playing")
                        .header(HttpHeaders.ORIGIN, "https://evil.example.com")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET"))
                .andExpect(status().isForbidden());
    }

    private String register(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody(email, password)))
                .andExpect(status().isCreated())
                .andReturn();
        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        assertEquals("Bearer", body.get("tokenType").asText());
        return body.get("token").asText();
    }

    private String registerBody(String email, String password) throws Exception {
        return objectMapper.writeValueAsString(Map.of(
                "name", "Asha Rao",
                "email", email,
                "phone", "9876543210",
                "password", password));
    }

    private String loginBody(String email, String password) throws Exception {
        return objectMapper.writeValueAsString(Map.of("email", email, "password", password));
    }
}
