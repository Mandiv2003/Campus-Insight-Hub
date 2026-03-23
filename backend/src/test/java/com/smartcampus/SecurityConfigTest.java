package com.smartcampus;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void publicResourcesEndpointIsAccessibleWithoutToken() throws Exception {
        // Security permits this endpoint without auth.
        // M1's ResourceController is not yet wired, so 404 is acceptable — but NOT 401/403.
        int httpStatus = mockMvc.perform(get("/api/v1/resources"))
            .andReturn().getResponse().getStatus();
        assertThat(httpStatus).isNotIn(401, 403);
    }

    @Test
    void authMeRequiresToken() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void adminEndpointRequiresToken() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users"))
            .andExpect(status().isUnauthorized());
    }
}
