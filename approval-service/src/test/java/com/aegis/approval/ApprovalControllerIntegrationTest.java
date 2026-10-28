package com.aegis.approval;

import com.aegis.approval.dto.ApprovalRequestDTO;
import com.aegis.approval.dto.ApprovalResponseDTO;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@SuppressWarnings("null")
class ApprovalControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("1. Claim amount less than coverage -> APPROVED")
    void testClaimAmountLessThanCoverage_Approved() throws Exception {
        ApprovalRequestDTO request = ApprovalRequestDTO.builder()
                .claimId(101L)
                .policyId(1L)
                .claimAmount(new BigDecimal("100000.00"))
                .coverageAmount(new BigDecimal("500000.00"))
                .description("Hospitalization")
                .build();

        mockMvc.perform(post("/approvals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.claimId", is(101)))
                .andExpect(jsonPath("$.status", is("APPROVED")))
                .andExpect(jsonPath("$.reason", is("Claim amount is within policy coverage")));
    }

    @Test
    @DisplayName("2. Claim amount equal to coverage -> APPROVED")
    void testClaimAmountEqualToCoverage_Approved() throws Exception {
        ApprovalRequestDTO request = ApprovalRequestDTO.builder()
                .claimId(102L)
                .policyId(1L)
                .claimAmount(new BigDecimal("500000.00"))
                .coverageAmount(new BigDecimal("500000.00"))
                .description("Surgery exact limit")
                .build();

        mockMvc.perform(post("/approvals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("APPROVED")))
                .andExpect(jsonPath("$.reason", is("Claim amount is within policy coverage")));
    }

    @Test
    @DisplayName("3. Claim amount greater than coverage -> REJECTED")
    void testClaimAmountGreaterThanCoverage_Rejected() throws Exception {
        ApprovalRequestDTO request = ApprovalRequestDTO.builder()
                .claimId(103L)
                .policyId(1L)
                .claimAmount(new BigDecimal("600000.00"))
                .coverageAmount(new BigDecimal("500000.00"))
                .description("Exceeding limit")
                .build();

        mockMvc.perform(post("/approvals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("REJECTED")))
                .andExpect(jsonPath("$.reason", is("Claim amount exceeds policy coverage")));
    }

    @Test
    @DisplayName("4. Invalid claim amount (zero/negative) -> 400 Bad Request")
    void testInvalidClaimAmount_BadRequest() throws Exception {
        ApprovalRequestDTO request = ApprovalRequestDTO.builder()
                .claimId(104L)
                .policyId(1L)
                .claimAmount(new BigDecimal("-50.00"))
                .coverageAmount(new BigDecimal("500000.00"))
                .description("Negative claim")
                .build();

        mockMvc.perform(post("/approvals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.errors.claimAmount", containsString("greater than zero")));
    }

    @Test
    @DisplayName("5. Invalid coverage amount (zero/negative) -> 400 Bad Request")
    void testInvalidCoverageAmount_BadRequest() throws Exception {
        ApprovalRequestDTO request = ApprovalRequestDTO.builder()
                .claimId(105L)
                .policyId(1L)
                .claimAmount(new BigDecimal("1000.00"))
                .coverageAmount(new BigDecimal("0.00"))
                .description("Zero coverage")
                .build();

        mockMvc.perform(post("/approvals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.errors.coverageAmount", containsString("greater than zero")));
    }

    @Test
    @DisplayName("6. Get existing approval -> 200 OK")
    void testGetExistingApproval_Ok() throws Exception {
        ApprovalRequestDTO request = ApprovalRequestDTO.builder()
                .claimId(106L)
                .policyId(2L)
                .claimAmount(new BigDecimal("25000.00"))
                .coverageAmount(new BigDecimal("100000.00"))
                .description("Diagnostics")
                .build();

        MvcResult result = mockMvc.perform(post("/approvals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        ApprovalResponseDTO created = objectMapper.readValue(result.getResponse().getContentAsString(), ApprovalResponseDTO.class);

        mockMvc.perform(get("/approvals/" + created.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(created.getId().intValue())))
                .andExpect(jsonPath("$.claimId", is(106)))
                .andExpect(jsonPath("$.status", is("APPROVED")));

        mockMvc.perform(get("/approvals/claim/106"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(created.getId().intValue())))
                .andExpect(jsonPath("$.claimId", is(106)));
    }

    @Test
    @DisplayName("7. Get nonexistent approval -> 404 Not Found")
    void testGetNonexistentApproval_NotFound() throws Exception {
        mockMvc.perform(get("/approvals/99999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.message", containsString("Approval not found")));

        mockMvc.perform(get("/approvals/claim/99999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.message", containsString("Approval not found for claim id")));
    }

    @Test
    @DisplayName("8. Create approval -> 201 Created")
    void testCreateApproval_Created() throws Exception {
        ApprovalRequestDTO request = ApprovalRequestDTO.builder()
                .claimId(108L)
                .policyId(3L)
                .claimAmount(new BigDecimal("75000.00"))
                .coverageAmount(new BigDecimal("200000.00"))
                .description("Consultation and medication")
                .build();

        mockMvc.perform(post("/approvals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.claimId", is(108)))
                .andExpect(jsonPath("$.policyId", is(3)))
                .andExpect(jsonPath("$.claimAmount", is(75000.00)))
                .andExpect(jsonPath("$.coverageAmount", is(200000.00)))
                .andExpect(jsonPath("$.status", is("APPROVED")))
                .andExpect(jsonPath("$.decisionDate").exists());
    }
}
