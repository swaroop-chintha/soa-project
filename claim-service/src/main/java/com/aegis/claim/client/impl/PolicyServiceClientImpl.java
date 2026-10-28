package com.aegis.claim.client.impl;

import com.aegis.claim.client.PolicyServiceClient;
import com.aegis.claim.dto.PolicyValidationResponseDTO;
import com.aegis.claim.exception.ServiceCommunicationException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

@Component
@SuppressWarnings("null")
public class PolicyServiceClientImpl implements PolicyServiceClient {

    private static final Logger log = LoggerFactory.getLogger(PolicyServiceClientImpl.class);
    private static final String POLICY_SERVICE_NAME = "http://policy-service";

    private final RestClient restClient;

    public PolicyServiceClientImpl(RestClient restClient) {
        this.restClient = restClient;
    }

    @Override
    @CircuitBreaker(name = "policyService", fallbackMethod = "validatePolicyFallback")
    @Retry(name = "policyService")
    public PolicyValidationResponseDTO validatePolicy(Long policyId) {
        try {
            return restClient.get()
                    .uri(POLICY_SERVICE_NAME + "/policies/{id}/validate", policyId)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (request, response) -> {
                        if (response.getStatusCode().value() == 404) {
                            throw new HttpClientErrorException(response.getStatusCode(), "Policy not found");
                        }
                    })
                    .body(PolicyValidationResponseDTO.class);
        } catch (HttpClientErrorException.NotFound e) {
            return PolicyValidationResponseDTO.builder()
                    .valid(false)
                    .policyId(policyId)
                    .message("Policy not found with id: " + policyId)
                    .build();
        } catch (HttpClientErrorException e) {
            return PolicyValidationResponseDTO.builder()
                    .valid(false)
                    .policyId(policyId)
                    .message("Policy validation failed: " + e.getStatusText())
                    .build();
        } catch (Exception e) {
            throw new ServiceCommunicationException("Policy Service", e.getMessage(), e);
        }
    }

    public PolicyValidationResponseDTO validatePolicyFallback(Long policyId, Throwable t) {
        log.error("Circuit breaker/fallback triggered for Policy Service (policyId={}): {}", policyId, t.getMessage());
        if (t instanceof ServiceCommunicationException sce) {
            throw sce;
        }
        throw new ServiceCommunicationException("Policy Service", "Policy Service is unavailable: " + t.getMessage(), t);
    }
}
