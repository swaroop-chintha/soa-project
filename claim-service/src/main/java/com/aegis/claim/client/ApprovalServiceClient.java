package com.aegis.claim.client;

import com.aegis.claim.dto.ApprovalResponseDTO;

import java.math.BigDecimal;

public interface ApprovalServiceClient {

    ApprovalResponseDTO requestApproval(Long claimId, Long policyId, BigDecimal claimAmount,
                                        BigDecimal coverageAmount, String description);
}
