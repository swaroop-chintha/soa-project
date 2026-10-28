package com.aegis.policy;

import com.aegis.policy.dto.PolicyRequestDTO;
import com.aegis.policy.dto.PolicyResponseDTO;
import com.aegis.policy.entity.PolicyStatus;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@SuppressWarnings("null")
class PolicyControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("1. Should create policy successfully")
    void testCreatePolicy() throws Exception {
        PolicyRequestDTO request = PolicyRequestDTO.builder()
                .policyNumber("POL1001")
                .customerName("John Doe")
                .policyType("HEALTH")
                .coverageAmount(new BigDecimal("500000.00"))
                .startDate(LocalDate.now().minusDays(10))
                .endDate(LocalDate.now().plusDays(355))
                .status(PolicyStatus.ACTIVE)
                .build();

        mockMvc.perform(post("/policies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.policyNumber", is("POL1001")))
                .andExpect(jsonPath("$.customerName", is("John Doe")))
                .andExpect(jsonPath("$.coverageAmount", is(500000.00)))
                .andExpect(jsonPath("$.status", is("ACTIVE")));
    }

    @Test
    @DisplayName("2. Should validate active policy as valid")
    void testValidateActivePolicy() throws Exception {
        PolicyRequestDTO request = PolicyRequestDTO.builder()
                .policyNumber("POL1002")
                .customerName("Jane Smith")
                .policyType("AUTO")
                .coverageAmount(new BigDecimal("300000.00"))
                .startDate(LocalDate.now().minusDays(30))
                .endDate(LocalDate.now().plusDays(335))
                .status(PolicyStatus.ACTIVE)
                .build();

        MvcResult result = mockMvc.perform(post("/policies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        PolicyResponseDTO created = objectMapper.readValue(result.getResponse().getContentAsString(), PolicyResponseDTO.class);

        mockMvc.perform(get("/policies/" + created.getId() + "/validate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid", is(true)))
                .andExpect(jsonPath("$.policyId", is(created.getId().intValue())))
                .andExpect(jsonPath("$.coverageAmount", is(300000.00)))
                .andExpect(jsonPath("$.message", is("Policy is valid")));
    }

    @Test
    @DisplayName("3. Should validate expired policy as invalid")
    void testValidateExpiredPolicy() throws Exception {
        PolicyRequestDTO request = PolicyRequestDTO.builder()
                .policyNumber("POL1003")
                .customerName("Bob Wilson")
                .policyType("LIFE")
                .coverageAmount(new BigDecimal("1000000.00"))
                .startDate(LocalDate.now().minusYears(2))
                .endDate(LocalDate.now().minusDays(1))
                .status(PolicyStatus.ACTIVE)
                .build();

        MvcResult result = mockMvc.perform(post("/policies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        PolicyResponseDTO created = objectMapper.readValue(result.getResponse().getContentAsString(), PolicyResponseDTO.class);

        mockMvc.perform(get("/policies/" + created.getId() + "/validate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid", is(false)))
                .andExpect(jsonPath("$.policyId", is(created.getId().intValue())))
                .andExpect(jsonPath("$.message", containsString("expired")));
    }

    @Test
    @DisplayName("4. Should validate cancelled policy as invalid")
    void testValidateCancelledPolicy() throws Exception {
        PolicyRequestDTO request = PolicyRequestDTO.builder()
                .policyNumber("POL-CANCELLED")
                .customerName("Alice")
                .policyType("HEALTH")
                .coverageAmount(new BigDecimal("200000.00"))
                .startDate(LocalDate.now().minusDays(10))
                .endDate(LocalDate.now().plusDays(355))
                .status(PolicyStatus.CANCELLED)
                .build();

        MvcResult result = mockMvc.perform(post("/policies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        PolicyResponseDTO created = objectMapper.readValue(result.getResponse().getContentAsString(), PolicyResponseDTO.class);

        mockMvc.perform(get("/policies/" + created.getId() + "/validate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid", is(false)))
                .andExpect(jsonPath("$.message", containsString("not ACTIVE")));
    }

    @Test
    @DisplayName("5. Should validate future policy as invalid")
    void testValidateFuturePolicy() throws Exception {
        PolicyRequestDTO request = PolicyRequestDTO.builder()
                .policyNumber("POL-FUTURE")
                .customerName("Charlie")
                .policyType("HEALTH")
                .coverageAmount(new BigDecimal("250000.00"))
                .startDate(LocalDate.now().plusDays(10))
                .endDate(LocalDate.now().plusDays(375))
                .status(PolicyStatus.ACTIVE)
                .build();

        MvcResult result = mockMvc.perform(post("/policies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        PolicyResponseDTO created = objectMapper.readValue(result.getResponse().getContentAsString(), PolicyResponseDTO.class);

        mockMvc.perform(get("/policies/" + created.getId() + "/validate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid", is(false)))
                .andExpect(jsonPath("$.message", containsString("not started yet")));
    }

    @Test
    @DisplayName("6. Should return 404 when policy not found")
    void testPolicyNotFound() throws Exception {
        mockMvc.perform(get("/policies/99999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.message", containsString("Policy not found")));
    }

    @Test
    @DisplayName("7. Should return 400 on duplicate policy number")
    void testDuplicatePolicyNumber() throws Exception {
        PolicyRequestDTO request = PolicyRequestDTO.builder()
                .policyNumber("POL_DUP")
                .customerName("Alice")
                .policyType("HEALTH")
                .coverageAmount(new BigDecimal("200000.00"))
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusYears(1))
                .status(PolicyStatus.ACTIVE)
                .build();

        mockMvc.perform(post("/policies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/policies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", containsString("already exists")));
    }

    @Test
    @DisplayName("8. Should update and delete policy successfully")
    void testUpdateAndDeletePolicy() throws Exception {
        PolicyRequestDTO request = PolicyRequestDTO.builder()
                .policyNumber("POL_UPD_DEL")
                .customerName("Initial Name")
                .policyType("HEALTH")
                .coverageAmount(new BigDecimal("100000.00"))
                .startDate(LocalDate.now().minusDays(5))
                .endDate(LocalDate.now().plusDays(360))
                .status(PolicyStatus.ACTIVE)
                .build();

        MvcResult result = mockMvc.perform(post("/policies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        PolicyResponseDTO created = objectMapper.readValue(result.getResponse().getContentAsString(), PolicyResponseDTO.class);

        // Update policy
        PolicyRequestDTO updateRequest = PolicyRequestDTO.builder()
                .policyNumber("POL_UPD_DEL")
                .customerName("Updated Name")
                .policyType("HEALTH_PREMIUM")
                .coverageAmount(new BigDecimal("150000.00"))
                .startDate(LocalDate.now().minusDays(5))
                .endDate(LocalDate.now().plusDays(360))
                .status(PolicyStatus.ACTIVE)
                .build();

        mockMvc.perform(put("/policies/" + created.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customerName", is("Updated Name")))
                .andExpect(jsonPath("$.coverageAmount", is(150000.00)));

        // Delete policy
        mockMvc.perform(delete("/policies/" + created.getId()))
                .andExpect(status().isNoContent());

        // Verify 404 after deletion
        mockMvc.perform(get("/policies/" + created.getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("9. Invalid dates: End date before start date -> 400 Bad Request")
    void testInvalidDates_EndDateBeforeStartDate() throws Exception {
        PolicyRequestDTO request = PolicyRequestDTO.builder()
                .policyNumber("POL_INVALID_DATES")
                .customerName("Invalid Dates User")
                .policyType("HEALTH")
                .coverageAmount(new BigDecimal("100000.00"))
                .startDate(LocalDate.now().plusDays(10))
                .endDate(LocalDate.now()) // endDate before startDate
                .status(PolicyStatus.ACTIVE)
                .build();

        mockMvc.perform(post("/policies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", containsString("end date cannot be before start date")));
    }

    @Test
    @DisplayName("10. Invalid coverage amount: Coverage amount <= 0 -> 400 Bad Request")
    void testInvalidCoverageAmount_NonPositive() throws Exception {
        PolicyRequestDTO request = PolicyRequestDTO.builder()
                .policyNumber("POL_INVALID_COV")
                .customerName("Zero Coverage User")
                .policyType("HEALTH")
                .coverageAmount(BigDecimal.ZERO)
                .startDate(LocalDate.now().minusDays(1))
                .endDate(LocalDate.now().plusYears(1))
                .status(PolicyStatus.ACTIVE)
                .build();

        mockMvc.perform(post("/policies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.errors.coverageAmount", containsString("greater than zero")));
    }

    @Test
    @DisplayName("11. Boundary Dates: Policy starting today and ending today is valid; POST /validate works identically")
    void testValidatePolicyBoundaryDates() throws Exception {
        LocalDate today = LocalDate.now();
        PolicyRequestDTO request = PolicyRequestDTO.builder()
                .policyNumber("POL_BOUNDARY_TODAY")
                .customerName("Boundary Tester")
                .policyType("TRAVEL")
                .coverageAmount(new BigDecimal("50000.00"))
                .startDate(today)
                .endDate(today)
                .status(PolicyStatus.ACTIVE)
                .build();

        MvcResult result = mockMvc.perform(post("/policies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        PolicyResponseDTO created = objectMapper.readValue(result.getResponse().getContentAsString(), PolicyResponseDTO.class);

        // GET /policies/{id}/validate
        mockMvc.perform(get("/policies/" + created.getId() + "/validate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid", is(true)))
                .andExpect(jsonPath("$.message", is("Policy is valid")));

        // POST /policies/{id}/validate
        mockMvc.perform(post("/policies/" + created.getId() + "/validate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid", is(true)))
                .andExpect(jsonPath("$.message", is("Policy is valid")));
    }
}
