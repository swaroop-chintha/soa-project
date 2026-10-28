package com.aegis.approval.service.impl;

import com.aegis.approval.dto.ApprovalRequestDTO;
import com.aegis.approval.dto.ApprovalResponseDTO;
import com.aegis.approval.entity.Approval;
import com.aegis.approval.entity.ApprovalStatus;
import com.aegis.approval.exception.InvalidApprovalException;
import com.aegis.approval.exception.ResourceNotFoundException;
import com.aegis.approval.repository.ApprovalRepository;
import com.aegis.approval.service.ApprovalService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class ApprovalServiceImpl implements ApprovalService {

    private static final Logger log = LoggerFactory.getLogger(ApprovalServiceImpl.class);

    private final ApprovalRepository approvalRepository;

    public ApprovalServiceImpl(ApprovalRepository approvalRepository) {
        this.approvalRepository = approvalRepository;
    }

    @Override
    @Transactional
    public ApprovalResponseDTO processApproval(ApprovalRequestDTO requestDTO) {
        if (requestDTO == null) {
            throw new InvalidApprovalException("Approval request body cannot be null");
        }

        BigDecimal claimAmount = requestDTO.getClaimAmount();
        BigDecimal coverageAmount = requestDTO.getCoverageAmount();

        if (claimAmount == null || coverageAmount == null) {
            throw new InvalidApprovalException("Claim amount and coverage amount are required");
        }

        if (claimAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidApprovalException("Claim amount must be strictly greater than zero");
        }

        ApprovalStatus status;
        String reason;

        if (coverageAmount.compareTo(BigDecimal.ZERO) <= 0) {
            status = ApprovalStatus.REJECTED;
            reason = "Policy coverage amount is zero or negative";
        } else if (claimAmount.compareTo(coverageAmount) <= 0) {
            status = ApprovalStatus.APPROVED;
            reason = "Claim amount is within policy coverage";
        } else {
            status = ApprovalStatus.REJECTED;
            reason = "Claim amount exceeds policy coverage";
        }

        Approval approval = Approval.builder()
                .claimId(requestDTO.getClaimId())
                .policyId(requestDTO.getPolicyId())
                .claimAmount(claimAmount)
                .coverageAmount(coverageAmount)
                .status(status)
                .decisionDate(LocalDate.now())
                .reason(reason)
                .description(requestDTO.getDescription())
                .build();

        Approval saved = approvalRepository.save(approval);
        log.info("Adjudication completed for claim ID {}: status={}, reason={}",
                saved.getClaimId(), status, reason);

        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ApprovalResponseDTO getApprovalById(Long id) {
        Approval approval = approvalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Approval not found with id: " + id));
        return mapToDTO(approval);
    }

    @Override
    @Transactional(readOnly = true)
    public ApprovalResponseDTO getApprovalByClaimId(Long claimId) {
        Approval approval = approvalRepository.findByClaimId(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Approval not found for claim id: " + claimId));
        return mapToDTO(approval);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApprovalResponseDTO> getAllApprovals() {
        return approvalRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private ApprovalResponseDTO mapToDTO(Approval approval) {
        return ApprovalResponseDTO.builder()
                .id(approval.getId())
                .claimId(approval.getClaimId())
                .policyId(approval.getPolicyId())
                .claimAmount(approval.getClaimAmount())
                .coverageAmount(approval.getCoverageAmount())
                .status(approval.getStatus())
                .reason(approval.getReason())
                .decisionDate(approval.getDecisionDate())
                .build();
    }
}
