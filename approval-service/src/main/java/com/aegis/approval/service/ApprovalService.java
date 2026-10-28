package com.aegis.approval.service;

import com.aegis.approval.dto.ApprovalRequestDTO;
import com.aegis.approval.dto.ApprovalResponseDTO;

import java.util.List;

public interface ApprovalService {

    ApprovalResponseDTO processApproval(ApprovalRequestDTO requestDTO);

    ApprovalResponseDTO getApprovalById(Long id);

    ApprovalResponseDTO getApprovalByClaimId(Long claimId);

    List<ApprovalResponseDTO> getAllApprovals();
}
