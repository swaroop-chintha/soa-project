package com.aegis.claim;

import com.aegis.claim.client.ApprovalServiceClient;
import com.aegis.claim.client.PolicyServiceClient;
import com.aegis.claim.dto.*;
import com.aegis.claim.entity.ClaimStatus;
import com.aegis.claim.exception.ServiceCommunicationException;
import com.aegis.claim.repository.ClaimRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@SuppressWarnings("null")
class ClaimControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ClaimRepository claimRepository;

    @MockBean
    private PolicyServiceClient policyServiceClient;

    @MockBean
    private ApprovalServiceClient approvalServiceClient;

    @MockBean
    private com.aegis.claim.service.ClaimEventPublisher claimEventPublisher;

    @Test
    @DisplayName("Scenario 1: Active policy + Claim amount <= coverage -> APPROVED")
    void testScenario1_ActivePolicy_ClaimWithinCoverage_Approved() throws Exception {
        Long policyId = 1L;
        BigDecimal claimAmount = new BigDecimal("100000.00");
        BigDecimal coverageAmount = new BigDecimal("500000.00");

        when(policyServiceClient.validatePolicy(policyId)).thenReturn(
                PolicyValidationResponseDTO.builder()
                        .valid(true)
                        .policyId(policyId)
                        .policyNumber("POL1001")
                        .customerName("John Doe")
                        .coverageAmount(coverageAmount)
                        .status("ACTIVE")
                        .message("Policy is valid")
                        .build()
        );

        when(approvalServiceClient.requestApproval(any(), eq(policyId), eq(claimAmount), eq(coverageAmount), any())).thenReturn(
                ApprovalResponseDTO.builder()
                        .id(1L)
                        .claimId(1L)
                        .policyId(policyId)
                        .claimAmount(claimAmount)
                        .coverageAmount(coverageAmount)
                        .status("APPROVED")
                        .reason("Claim amount is within policy coverage")
                        .decisionDate(LocalDate.now())
                        .build()
        );

        ClaimRequestDTO request = ClaimRequestDTO.builder()
                .policyId(policyId)
                .customerName("John Doe")
                .claimAmount(claimAmount)
                .description("Hospitalization expenses")
                .build();

        mockMvc.perform(post("/claims")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.claimNumber").exists())
                .andExpect(jsonPath("$.status", is("APPROVED")))
                .andExpect(jsonPath("$.customerName", is("John Doe")));

        verify(policyServiceClient, times(1)).validatePolicy(policyId);
        verify(approvalServiceClient, times(1)).requestApproval(any(), eq(policyId), eq(claimAmount), eq(coverageAmount), any());
    }

    @Test
    @DisplayName("Scenario 1b: Active policy + Claim amount == coverage -> APPROVED")
    void testScenario1b_ActivePolicy_ClaimEqualToCoverage_Approved() throws Exception {
        Long policyId = 10L;
        BigDecimal claimAmount = new BigDecimal("500000.00");
        BigDecimal coverageAmount = new BigDecimal("500000.00");

        when(policyServiceClient.validatePolicy(policyId)).thenReturn(
                PolicyValidationResponseDTO.builder()
                        .valid(true)
                        .policyId(policyId)
                        .policyNumber("POL1010")
                        .customerName("George")
                        .coverageAmount(coverageAmount)
                        .status("ACTIVE")
                        .message("Policy is valid")
                        .build()
        );

        when(approvalServiceClient.requestApproval(any(), eq(policyId), eq(claimAmount), eq(coverageAmount), any())).thenReturn(
                ApprovalResponseDTO.builder()
                        .id(10L)
                        .claimId(10L)
                        .policyId(policyId)
                        .claimAmount(claimAmount)
                        .coverageAmount(coverageAmount)
                        .status("APPROVED")
                        .reason("Claim amount is within policy coverage")
                        .decisionDate(LocalDate.now())
                        .build()
        );

        ClaimRequestDTO request = ClaimRequestDTO.builder()
                .policyId(policyId)
                .customerName("George")
                .claimAmount(claimAmount)
                .description("Exact coverage limit claim")
                .build();

        mockMvc.perform(post("/claims")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.status", is("APPROVED")))
                .andExpect(jsonPath("$.claimAmount", is(500000.00)));

        verify(policyServiceClient, times(1)).validatePolicy(policyId);
        verify(approvalServiceClient, times(1)).requestApproval(any(), eq(policyId), eq(claimAmount), eq(coverageAmount), any());
    }

    @Test
    @DisplayName("Scenario 2: Active policy + Claim amount > coverage -> REJECTED")
    void testScenario2_ActivePolicy_ExceedsCoverage_Rejected() throws Exception {
        Long policyId = 2L;
        BigDecimal claimAmount = new BigDecimal("700000.00");
        BigDecimal coverageAmount = new BigDecimal("500000.00");

        when(policyServiceClient.validatePolicy(policyId)).thenReturn(
                PolicyValidationResponseDTO.builder()
                        .valid(true)
                        .policyId(policyId)
                        .coverageAmount(coverageAmount)
                        .status("ACTIVE")
                        .message("Policy is valid")
                        .build()
        );

        when(approvalServiceClient.requestApproval(any(), eq(policyId), eq(claimAmount), eq(coverageAmount), any())).thenReturn(
                ApprovalResponseDTO.builder()
                        .id(2L)
                        .claimId(2L)
                        .policyId(policyId)
                        .claimAmount(claimAmount)
                        .coverageAmount(coverageAmount)
                        .status("REJECTED")
                        .reason("Claim amount exceeds policy coverage")
                        .decisionDate(LocalDate.now())
                        .build()
        );

        ClaimRequestDTO request = ClaimRequestDTO.builder()
                .policyId(policyId)
                .customerName("Bob")
                .claimAmount(claimAmount)
                .description("Exceeding coverage")
                .build();

        mockMvc.perform(post("/claims")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("REJECTED")))
                .andExpect(jsonPath("$.rejectionReason", containsString("exceeds policy coverage")));

        verify(policyServiceClient, times(1)).validatePolicy(policyId);
        verify(approvalServiceClient, times(1)).requestApproval(any(), eq(policyId), eq(claimAmount), eq(coverageAmount), any());
    }

    @Test
    @DisplayName("Scenario 3: Expired policy -> REJECTED without calling Approval Service")
    void testScenario3_ExpiredPolicy_Rejected() throws Exception {
        Long policyId = 3L;

        when(policyServiceClient.validatePolicy(policyId)).thenReturn(
                PolicyValidationResponseDTO.builder()
                        .valid(false)
                        .policyId(policyId)
                        .policyNumber("POL-EXPIRED")
                        .status("EXPIRED")
                        .message("Policy coverage has expired")
                        .build()
        );

        ClaimRequestDTO request = ClaimRequestDTO.builder()
                .policyId(policyId)
                .customerName("Jane Doe")
                .claimAmount(new BigDecimal("50000.00"))
                .description("Expired policy claim")
                .build();

        mockMvc.perform(post("/claims")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("REJECTED")))
                .andExpect(jsonPath("$.rejectionReason", containsString("expired")));

        verify(policyServiceClient, times(1)).validatePolicy(policyId);
        verifyNoInteractions(approvalServiceClient);
    }

    @Test
    @DisplayName("Scenario 4: Cancelled policy -> REJECTED without calling Approval Service")
    void testScenario4_CancelledPolicy_Rejected() throws Exception {
        Long policyId = 4L;

        when(policyServiceClient.validatePolicy(policyId)).thenReturn(
                PolicyValidationResponseDTO.builder()
                        .valid(false)
                        .policyId(policyId)
                        .policyNumber("POL-CANCELLED")
                        .status("CANCELLED")
                        .message("Policy is not ACTIVE (current status: CANCELLED)")
                        .build()
        );

        ClaimRequestDTO request = ClaimRequestDTO.builder()
                .policyId(policyId)
                .customerName("Alice")
                .claimAmount(new BigDecimal("30000.00"))
                .description("Cancelled policy claim")
                .build();

        mockMvc.perform(post("/claims")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("REJECTED")))
                .andExpect(jsonPath("$.rejectionReason", containsString("CANCELLED")));

        verify(policyServiceClient, times(1)).validatePolicy(policyId);
        verifyNoInteractions(approvalServiceClient);
    }

    @Test
    @DisplayName("Scenario 5: Policy Service unavailable -> 503 (No false approval)")
    void testScenario5_PolicyServiceUnavailable_503() throws Exception {
        Long policyId = 5L;

        when(policyServiceClient.validatePolicy(policyId)).thenThrow(
                new ServiceCommunicationException("Policy Service", "Connection refused")
        );

        ClaimRequestDTO request = ClaimRequestDTO.builder()
                .policyId(policyId)
                .customerName("Charlie")
                .claimAmount(new BigDecimal("10000.00"))
                .description("Policy service down")
                .build();

        mockMvc.perform(post("/claims")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status", is(503)))
                .andExpect(jsonPath("$.message", containsString("Policy Service")));

        verifyNoInteractions(approvalServiceClient);
    }

    @Test
    @DisplayName("Scenario 6: Approval Service unavailable -> 503 & Claim preserved in UNDER_REVIEW")
    void testScenario6_ApprovalServiceUnavailable_503_PreservesUnderReview() throws Exception {
        Long policyId = 6L;
        BigDecimal claimAmount = new BigDecimal("20000.00");
        BigDecimal coverageAmount = new BigDecimal("100000.00");

        when(policyServiceClient.validatePolicy(policyId)).thenReturn(
                PolicyValidationResponseDTO.builder()
                        .valid(true)
                        .policyId(policyId)
                        .coverageAmount(coverageAmount)
                        .status("ACTIVE")
                        .message("Policy is valid")
                        .build()
        );

        when(approvalServiceClient.requestApproval(any(), eq(policyId), eq(claimAmount), eq(coverageAmount), any())).thenThrow(
                new ServiceCommunicationException("Approval Service", "Connection timed out")
        );

        ClaimRequestDTO request = ClaimRequestDTO.builder()
                .policyId(policyId)
                .customerName("David")
                .claimAmount(claimAmount)
                .description("Approval service down")
                .build();

        mockMvc.perform(post("/claims")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status", is(503)))
                .andExpect(jsonPath("$.message", containsString("Approval Service")));

        // Verify the claim was persisted in UNDER_REVIEW status in database
        assertEquals(ClaimStatus.UNDER_REVIEW, claimRepository.findAll().stream()
                .filter(c -> c.getCustomerName().equals("David"))
                .findFirst()
                .orElseThrow()
                .getStatus());
    }

    @Test
    @DisplayName("Status Transitions: Illegal transitions are properly rejected")
    void testIllegalStatusTransitions() throws Exception {
        Long policyId = 7L;
        when(policyServiceClient.validatePolicy(policyId)).thenReturn(
                PolicyValidationResponseDTO.builder()
                        .valid(true)
                        .policyId(policyId)
                        .coverageAmount(new BigDecimal("500000.00"))
                        .status("ACTIVE")
                        .message("Policy is valid")
                        .build()
        );

        when(approvalServiceClient.requestApproval(any(), any(), any(), any(), any())).thenReturn(
                ApprovalResponseDTO.builder()
                        .status("APPROVED")
                        .reason("OK")
                        .build()
        );

        ClaimRequestDTO request = ClaimRequestDTO.builder()
                .policyId(policyId)
                .customerName("Eve")
                .claimAmount(new BigDecimal("15000.00"))
                .description("Status transition test")
                .build();

        MvcResult result = mockMvc.perform(post("/claims")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        ClaimResponseDTO created = objectMapper.readValue(result.getResponse().getContentAsString(), ClaimResponseDTO.class);

        // 1. APPROVED -> SUBMITTED (Illegal)
        mockMvc.perform(put("/claims/" + created.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ClaimStatusUpdateDTO(ClaimStatus.SUBMITTED, "Reset"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Cannot transition from terminal status APPROVED")));

        // 2. APPROVED -> REJECTED (Illegal)
        mockMvc.perform(put("/claims/" + created.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ClaimStatusUpdateDTO(ClaimStatus.REJECTED, "Reject approved"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Cannot transition from terminal status APPROVED")));
    }

    @Test
    @DisplayName("Validation: Claim amount <= 0 or missing fields return 400 Bad Request")
    void testClaimValidationErrors() throws Exception {
        // Zero claim amount
        mockMvc.perform(post("/claims")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(ClaimRequestDTO.builder()
                                .policyId(1L)
                                .customerName("Frank")
                                .claimAmount(BigDecimal.ZERO)
                                .build())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.claimAmount", containsString("greater than zero")));

        // Missing customer name
        mockMvc.perform(post("/claims")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(ClaimRequestDTO.builder()
                                .policyId(1L)
                                .customerName("")
                                .claimAmount(new BigDecimal("100.00"))
                                .build())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.customerName", containsString("required")));

        // Missing policy ID
        mockMvc.perform(post("/claims")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(ClaimRequestDTO.builder()
                                .customerName("Frank")
                                .claimAmount(new BigDecimal("100.00"))
                                .build())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.policyId", containsString("required")));
    }

    @Test
    @DisplayName("CRUD: Get by ID (200), Get nonexistent (404), List all (200)")
    void testClaimCrudOperations() throws Exception {
        mockMvc.perform(get("/claims/99999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.message", containsString("Claim not found")));

        mockMvc.perform(get("/claims"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("Idempotency: Re-submitting with identical Idempotency-Key returns original claim without re-processing")
    void testIdempotentClaimSubmission() throws Exception {
        Long policyId = 101L;
        BigDecimal claimAmount = new BigDecimal("50000.00");
        BigDecimal coverageAmount = new BigDecimal("200000.00");
        String idempotencyKey = "IDEM-TEST-12345";

        when(policyServiceClient.validatePolicy(policyId)).thenReturn(
                PolicyValidationResponseDTO.builder()
                        .valid(true)
                        .policyId(policyId)
                        .coverageAmount(coverageAmount)
                        .status("ACTIVE")
                        .message("Policy is valid")
                        .build()
        );

        when(approvalServiceClient.requestApproval(any(), eq(policyId), eq(claimAmount), eq(coverageAmount), any())).thenReturn(
                ApprovalResponseDTO.builder()
                        .id(101L)
                        .claimId(101L)
                        .status("APPROVED")
                        .reason("Approved")
                        .decisionDate(LocalDate.now())
                        .build()
        );

        ClaimRequestDTO request = ClaimRequestDTO.builder()
                .policyId(policyId)
                .customerName("Alice Idempotency")
                .claimAmount(claimAmount)
                .description("First submission")
                .build();

        // 1. First submission
        MvcResult firstResult = mockMvc.perform(post("/claims")
                        .header("Idempotency-Key", idempotencyKey)
                        .header("X-User-Name", "alice")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idempotencyKey", is(idempotencyKey)))
                .andReturn();

        ClaimResponseDTO firstClaim = objectMapper.readValue(firstResult.getResponse().getContentAsString(), ClaimResponseDTO.class);

        // 2. Second submission with same idempotency key
        MvcResult secondResult = mockMvc.perform(post("/claims")
                        .header("Idempotency-Key", idempotencyKey)
                        .header("X-User-Name", "alice")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        ClaimResponseDTO secondClaim = objectMapper.readValue(secondResult.getResponse().getContentAsString(), ClaimResponseDTO.class);

        assertEquals(firstClaim.getId(), secondClaim.getId());
        assertEquals(firstClaim.getClaimNumber(), secondClaim.getClaimNumber());
        assertEquals(firstClaim.getStatus(), secondClaim.getStatus());

        // Downstream services should only be called once because second call returns cached result!
        verify(policyServiceClient, times(1)).validatePolicy(policyId);
        verify(approvalServiceClient, times(1)).requestApproval(any(), eq(policyId), eq(claimAmount), eq(coverageAmount), any());
    }

    @Test
    @DisplayName("Audit History: Chronological claim status history is recorded and queryable")
    void testClaimStatusHistory() throws Exception {
        Long policyId = 102L;
        BigDecimal claimAmount = new BigDecimal("40000.00");
        BigDecimal coverageAmount = new BigDecimal("100000.00");

        when(policyServiceClient.validatePolicy(policyId)).thenReturn(
                PolicyValidationResponseDTO.builder()
                        .valid(true)
                        .policyId(policyId)
                        .coverageAmount(coverageAmount)
                        .status("ACTIVE")
                        .message("Policy is valid")
                        .build()
        );

        when(approvalServiceClient.requestApproval(any(), eq(policyId), eq(claimAmount), eq(coverageAmount), any())).thenReturn(
                ApprovalResponseDTO.builder()
                        .status("APPROVED")
                        .reason("Claim amount is within policy coverage")
                        .build()
        );

        ClaimRequestDTO request = ClaimRequestDTO.builder()
                .policyId(policyId)
                .customerName("Audit History User")
                .claimAmount(claimAmount)
                .description("Audit test")
                .build();

        MvcResult result = mockMvc.perform(post("/claims")
                        .header("X-User-Name", "audit-user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        ClaimResponseDTO created = objectMapper.readValue(result.getResponse().getContentAsString(), ClaimResponseDTO.class);

        // Query history
        mockMvc.perform(get("/claims/" + created.getId() + "/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(4)))
                .andExpect(jsonPath("$[0].previousStatus").doesNotExist())
                .andExpect(jsonPath("$[0].newStatus", is("SUBMITTED")))
                .andExpect(jsonPath("$[0].changedBy", is("audit-user")))
                .andExpect(jsonPath("$[1].previousStatus", is("SUBMITTED")))
                .andExpect(jsonPath("$[1].newStatus", is("POLICY_VALIDATED")))
                .andExpect(jsonPath("$[2].previousStatus", is("POLICY_VALIDATED")))
                .andExpect(jsonPath("$[2].newStatus", is("UNDER_REVIEW")))
                .andExpect(jsonPath("$[3].previousStatus", is("UNDER_REVIEW")))
                .andExpect(jsonPath("$[3].newStatus", is("APPROVED")))
                .andExpect(jsonPath("$[3].reason", containsString("within policy coverage")));
    }

    @Test
    @DisplayName("Resilience: Recovery after downstream service returns to service")
    void testDownstreamRecovery() throws Exception {
        Long policyId = 103L;
        BigDecimal claimAmount = new BigDecimal("30000.00");
        BigDecimal coverageAmount = new BigDecimal("100000.00");

        // 1. Initial attempt fails when Approval Service is down
        when(policyServiceClient.validatePolicy(policyId)).thenReturn(
                PolicyValidationResponseDTO.builder()
                        .valid(true)
                        .policyId(policyId)
                        .coverageAmount(coverageAmount)
                        .status("ACTIVE")
                        .message("Policy is valid")
                        .build()
        );
        when(approvalServiceClient.requestApproval(any(), eq(policyId), eq(claimAmount), eq(coverageAmount), any())).thenThrow(
                new ServiceCommunicationException("Approval Service", "Connection timed out")
        );

        ClaimRequestDTO request1 = ClaimRequestDTO.builder()
                .policyId(policyId)
                .customerName("Downstream Down User")
                .claimAmount(claimAmount)
                .description("Failure attempt")
                .build();

        mockMvc.perform(post("/claims")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isServiceUnavailable());

        // 2. Downstream service recovers
        when(approvalServiceClient.requestApproval(any(), eq(policyId), eq(claimAmount), eq(coverageAmount), any())).thenReturn(
                ApprovalResponseDTO.builder()
                        .status("APPROVED")
                        .reason("Approved after recovery")
                        .build()
        );

        ClaimRequestDTO request2 = ClaimRequestDTO.builder()
                .policyId(policyId)
                .customerName("Downstream Recovered User")
                .claimAmount(claimAmount)
                .description("Recovery attempt")
                .build();

        mockMvc.perform(post("/claims")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("APPROVED")));
    }

    @Test
    @DisplayName("Events: Claim status transitions generate real-time events")
    void testRealtimeEventsGenerated() throws Exception {
        Long policyId = 104L;
        BigDecimal claimAmount = new BigDecimal("25000.00");
        BigDecimal coverageAmount = new BigDecimal("50000.00");

        when(policyServiceClient.validatePolicy(policyId)).thenReturn(
                PolicyValidationResponseDTO.builder()
                        .valid(true)
                        .policyId(policyId)
                        .coverageAmount(coverageAmount)
                        .status("ACTIVE")
                        .message("Policy is valid")
                        .build()
        );

        when(approvalServiceClient.requestApproval(any(), eq(policyId), eq(claimAmount), eq(coverageAmount), any())).thenReturn(
                ApprovalResponseDTO.builder()
                        .status("APPROVED")
                        .reason("Approved")
                        .build()
        );

        ClaimRequestDTO request = ClaimRequestDTO.builder()
                .policyId(policyId)
                .customerName("Events User")
                .claimAmount(claimAmount)
                .description("Events test")
                .build();

        mockMvc.perform(post("/claims")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Verify that events were published for SUBMITTED, POLICY_VALIDATED, UNDER_REVIEW, APPROVED
        verify(claimEventPublisher, atLeastOnce()).publishStatusEvent(any(), eq("SUBMITTED"), any());
        verify(claimEventPublisher, atLeastOnce()).publishStatusEvent(any(), eq("POLICY_VALIDATED"), any());
        verify(claimEventPublisher, atLeastOnce()).publishStatusEvent(any(), eq("UNDER_REVIEW"), any());
        verify(claimEventPublisher, atLeastOnce()).publishStatusEvent(any(), eq("APPROVED"), any());
    }

    @Test
    @DisplayName("Failure & Recovery: Approval service failure preserves UNDER_REVIEW and subsequent manual recovery succeeds")
    void testApprovalServiceFailureAndRecovery() throws Exception {
        Long policyId = 201L;
        BigDecimal claimAmount = new BigDecimal("12000.00");
        BigDecimal coverageAmount = new BigDecimal("50000.00");

        when(policyServiceClient.validatePolicy(policyId)).thenReturn(
                PolicyValidationResponseDTO.builder()
                        .valid(true)
                        .policyId(policyId)
                        .coverageAmount(coverageAmount)
                        .status("ACTIVE")
                        .message("Policy is valid")
                        .build()
        );

        // Simulate approval service outage
        when(approvalServiceClient.requestApproval(any(), eq(policyId), eq(claimAmount), eq(coverageAmount), any())).thenThrow(
                new ServiceCommunicationException("Approval Service", "Connection timed out")
        );

        ClaimRequestDTO request = ClaimRequestDTO.builder()
                .policyId(policyId)
                .customerName("Grace Recovery")
                .claimAmount(claimAmount)
                .description("Failure and recovery test claim")
                .build();

        // 1. Submit claim - fails with 503 Service Unavailable
        mockMvc.perform(post("/claims")
                        .header("X-User-Name", "grace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status", is(503)))
                .andExpect(jsonPath("$.message", containsString("Approval Service")));

        // 2. Query persisted claim: must be safely preserved in UNDER_REVIEW
        var parkedClaim = claimRepository.findAll().stream()
                .filter(c -> "Grace Recovery".equals(c.getCustomerName()))
                .findFirst()
                .orElseThrow();
        assertEquals(ClaimStatus.UNDER_REVIEW, parkedClaim.getStatus());

        // 3. Verify history trail currently records SUBMITTED -> POLICY_VALIDATED -> UNDER_REVIEW
        mockMvc.perform(get("/claims/" + parkedClaim.getId() + "/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0].newStatus", is("SUBMITTED")))
                .andExpect(jsonPath("$[1].newStatus", is("POLICY_VALIDATED")))
                .andExpect(jsonPath("$[2].newStatus", is("UNDER_REVIEW")));

        // 4. RECOVERY: Adjuster reviews and transitions the parked claim to APPROVED
        ClaimStatusUpdateDTO recoveryUpdate = new ClaimStatusUpdateDTO(
                ClaimStatus.APPROVED,
                "Adjudication approved manually after service recovery"
        );

        mockMvc.perform(put("/claims/" + parkedClaim.getId() + "/status")
                        .header("X-User-Name", "adjuster_sarah")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(recoveryUpdate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("APPROVED")))
                .andExpect(jsonPath("$.customerName", is("Grace Recovery")));

        // 5. Verify final history records all 4 transitions and records adjuster_sarah
        mockMvc.perform(get("/claims/" + parkedClaim.getId() + "/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(4)))
                .andExpect(jsonPath("$[3].previousStatus", is("UNDER_REVIEW")))
                .andExpect(jsonPath("$[3].newStatus", is("APPROVED")))
                .andExpect(jsonPath("$[3].changedBy", is("adjuster_sarah")))
                .andExpect(jsonPath("$[3].reason", containsString("manually after service recovery")));
    }

    @Test
    @DisplayName("Idempotency: Whitespace trimming in key deduplicates, and blank keys generate distinct claims")
    void testIdempotencyKeyNormalizationAndBlankHandling() throws Exception {
        Long policyId = 202L;
        BigDecimal claimAmount = new BigDecimal("8000.00");
        BigDecimal coverageAmount = new BigDecimal("40000.00");

        when(policyServiceClient.validatePolicy(policyId)).thenReturn(
                PolicyValidationResponseDTO.builder()
                        .valid(true)
                        .policyId(policyId)
                        .coverageAmount(coverageAmount)
                        .status("ACTIVE")
                        .message("Policy is valid")
                        .build()
        );

        when(approvalServiceClient.requestApproval(any(), eq(policyId), eq(claimAmount), eq(coverageAmount), any())).thenReturn(
                ApprovalResponseDTO.builder()
                        .status("APPROVED")
                        .reason("Approved")
                        .build()
        );

        ClaimRequestDTO request = ClaimRequestDTO.builder()
                .policyId(policyId)
                .customerName("Hank Idempotency")
                .claimAmount(claimAmount)
                .description("Whitespace idempotency test")
                .build();

        // 1. Submit with leading/trailing spaces in key
        MvcResult res1 = mockMvc.perform(post("/claims")
                        .header("Idempotency-Key", "   IDEM-TRIM-KEY-999   ")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idempotencyKey", is("IDEM-TRIM-KEY-999")))
                .andReturn();

        ClaimResponseDTO claim1 = objectMapper.readValue(res1.getResponse().getContentAsString(), ClaimResponseDTO.class);

        // 2. Submit with trimmed key: returns same claim without re-processing
        MvcResult res2 = mockMvc.perform(post("/claims")
                        .header("Idempotency-Key", "IDEM-TRIM-KEY-999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        ClaimResponseDTO claim2 = objectMapper.readValue(res2.getResponse().getContentAsString(), ClaimResponseDTO.class);
        assertEquals(claim1.getId(), claim2.getId());

        // 3. Submitting with all-whitespace / blank key produces distinct new claims
        MvcResult resBlank1 = mockMvc.perform(post("/claims")
                        .header("Idempotency-Key", "    ")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        MvcResult resBlank2 = mockMvc.perform(post("/claims")
                        .header("Idempotency-Key", "    ")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        ClaimResponseDTO claimBlank1 = objectMapper.readValue(resBlank1.getResponse().getContentAsString(), ClaimResponseDTO.class);
        ClaimResponseDTO claimBlank2 = objectMapper.readValue(resBlank2.getResponse().getContentAsString(), ClaimResponseDTO.class);
        org.junit.jupiter.api.Assertions.assertNotEquals(claimBlank1.getId(), claimBlank2.getId());
    }

    @Test
    @DisplayName("Audit History: Query non-existent claim history returns 404")
    void testNonExistentClaimHistoryReturns404() throws Exception {
        mockMvc.perform(get("/claims/888888/history"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.message", containsString("Claim not found with id: 888888")));
    }
}
