package com.aegis.claim.client.impl;

import com.aegis.claim.client.ApprovalServiceClient;
import com.aegis.claim.dto.ApprovalRequestDTO;
import com.aegis.claim.dto.ApprovalResponseDTO;
import com.aegis.claim.exception.ServiceCommunicationException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;

@Component
@SuppressWarnings("null")
public class ApprovalServiceClientImpl implements ApprovalServiceClient {

    private static final Logger log = LoggerFactory.getLogger(ApprovalServiceClientImpl.class);
    private static final String APPROVAL_SERVICE_NAME = "http://approval-service";

    private final RestClient restClient;

    public ApprovalServiceClientImpl(RestClient restClient) {
        this.restClient = restClient;
    }

    @Override
    @CircuitBreaker(name = "approvalService", fallbackMethod = "requestApprovalFallback")
    @Retry(name = "approvalService")
    public ApprovalResponseDTO requestApproval(Long claimId, Long policyId, BigDecimal claimAmount,
                                               BigDecimal coverageAmount, String description) {
        try {
            ApprovalRequestDTO requestDTO = ApprovalRequestDTO.builder()
                    .claimId(claimId)
                    .policyId(policyId)
                    .claimAmount(claimAmount)
                    .coverageAmount(coverageAmount)
                    .description(description)
                    .build();

            return restClient.post()
                    .uri(APPROVAL_SERVICE_NAME + "/approvals/evaluate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestDTO)
                    .retrieve()
                    .body(ApprovalResponseDTO.class);
        } catch (Exception e) {
            throw new ServiceCommunicationException("Approval Service", e.getMessage(), e);
        }
    }

    public ApprovalResponseDTO requestApprovalFallback(Long claimId, Long policyId, BigDecimal claimAmount,
                                                       BigDecimal coverageAmount, String description, Throwable t) {
        log.error("Circuit breaker/fallback triggered for Approval Service (claimId={}): {}", claimId, t.getMessage());
        if (t instanceof ServiceCommunicationException sce) {
            throw sce;
        }
        throw new ServiceCommunicationException("Approval Service", "Approval Service is unavailable: " + t.getMessage(), t);
    }
}
