package com.aegis.claim.client;

import com.aegis.claim.dto.PolicyValidationResponseDTO;

public interface PolicyServiceClient {

    PolicyValidationResponseDTO validatePolicy(Long policyId);
}
