package com.aegis.claim.service;

import com.aegis.claim.dto.ClaimRequestDTO;
import com.aegis.claim.dto.ClaimResponseDTO;
import com.aegis.claim.dto.ClaimStatusHistoryResponseDTO;
import com.aegis.claim.dto.ClaimStatusUpdateDTO;

import java.util.List;

public interface ClaimService {

    ClaimResponseDTO createClaim(ClaimRequestDTO requestDTO, String idempotencyKey, String changedBy);

    default ClaimResponseDTO createClaim(ClaimRequestDTO requestDTO) {
        return createClaim(requestDTO, null, null);
    }

    ClaimResponseDTO getClaimById(Long id);

    List<ClaimResponseDTO> getAllClaims();

    ClaimResponseDTO updateClaimStatus(Long id, ClaimStatusUpdateDTO statusUpdateDTO, String changedBy);

    default ClaimResponseDTO updateClaimStatus(Long id, ClaimStatusUpdateDTO statusUpdateDTO) {
        return updateClaimStatus(id, statusUpdateDTO, null);
    }

    List<ClaimStatusHistoryResponseDTO> getClaimHistory(Long claimId);
}
