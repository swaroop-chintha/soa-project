package com.aegis.claim.service.impl;

import com.aegis.claim.client.ApprovalServiceClient;
import com.aegis.claim.client.PolicyServiceClient;
import com.aegis.claim.dto.*;
import com.aegis.claim.entity.Claim;
import com.aegis.claim.entity.ClaimStatus;
import com.aegis.claim.entity.ClaimStatusHistory;
import com.aegis.claim.exception.ResourceNotFoundException;
import com.aegis.claim.exception.ServiceCommunicationException;
import com.aegis.claim.repository.ClaimRepository;
import com.aegis.claim.repository.ClaimStatusHistoryRepository;
import com.aegis.claim.service.ClaimEventPublisher;
import com.aegis.claim.service.ClaimService;
import com.aegis.claim.service.ClaimStatusTransitionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class ClaimServiceImpl implements ClaimService {

    private static final Logger log = LoggerFactory.getLogger(ClaimServiceImpl.class);

    private final ClaimRepository claimRepository;
    private final ClaimStatusHistoryRepository claimStatusHistoryRepository;
    private final PolicyServiceClient policyServiceClient;
    private final ApprovalServiceClient approvalServiceClient;
    private final ClaimStatusTransitionService transitionService;
    private final ClaimEventPublisher claimEventPublisher;

    public ClaimServiceImpl(ClaimRepository claimRepository,
                            ClaimStatusHistoryRepository claimStatusHistoryRepository,
                            PolicyServiceClient policyServiceClient,
                            ApprovalServiceClient approvalServiceClient,
                            ClaimStatusTransitionService transitionService,
                            ClaimEventPublisher claimEventPublisher) {
        this.claimRepository = claimRepository;
        this.claimStatusHistoryRepository = claimStatusHistoryRepository;
        this.policyServiceClient = policyServiceClient;
        this.approvalServiceClient = approvalServiceClient;
        this.transitionService = transitionService;
        this.claimEventPublisher = claimEventPublisher;
    }

    @Override
    @Transactional(noRollbackFor = ServiceCommunicationException.class)
    public ClaimResponseDTO createClaim(ClaimRequestDTO requestDTO, String idempotencyKey, String changedBy) {
        String normalizedIdempotencyKey = (idempotencyKey != null && !idempotencyKey.trim().isEmpty())
                ? idempotencyKey.trim() : null;

        // Idempotency check: if key already exists, return existing claim without re-processing
        if (normalizedIdempotencyKey != null) {
            Optional<Claim> existingClaim = claimRepository.findByIdempotencyKey(normalizedIdempotencyKey);
            if (existingClaim.isPresent()) {
                Claim existing = existingClaim.get();
                log.info("Idempotent claim submission detected for key: {}. Returning existing claim: {}",
                        normalizedIdempotencyKey, existing.getClaimNumber());
                return mapToDTO(existing);
            }
        }

        String user = (changedBy != null && !changedBy.trim().isEmpty()) ? changedBy.trim() : "user";

        // 1. Generate unique claim number
        String claimNumber = generateClaimNumber();

        // 2. Initial claim creation with SUBMITTED status
        Claim claim = Claim.builder()
                .claimNumber(claimNumber)
                .policyId(requestDTO.getPolicyId())
                .customerName(requestDTO.getCustomerName().trim())
                .claimAmount(requestDTO.getClaimAmount())
                .description(requestDTO.getDescription())
                .claimDate(LocalDate.now())
                .status(ClaimStatus.SUBMITTED)
                .idempotencyKey(normalizedIdempotencyKey)
                .build();

        try {
            claim = claimRepository.saveAndFlush(claim);
        } catch (org.springframework.dao.DataIntegrityViolationException dive) {
            if (normalizedIdempotencyKey != null) {
                Optional<Claim> existingClaim = claimRepository.findByIdempotencyKey(normalizedIdempotencyKey);
                if (existingClaim.isPresent()) {
                    log.info("Concurrent idempotent claim submission detected for key: {}. Returning existing claim: {}",
                            normalizedIdempotencyKey, existingClaim.get().getClaimNumber());
                    return mapToDTO(existingClaim.get());
                }
            }
            // If claim number collided across instances, retry with fresh claim number
            claim.setClaimNumber(generateClaimNumber());
            claim = claimRepository.saveAndFlush(claim);
        }

        // Record initial status in history and publish event
        ClaimStatusHistory initialHistory = ClaimStatusHistory.builder()
                .claimId(claim.getId())
                .previousStatus(null)
                .newStatus(ClaimStatus.SUBMITTED)
                .reason("Claim submitted")
                .changedAt(LocalDateTime.now())
                .changedBy(user)
                .build();
        claimStatusHistoryRepository.save(initialHistory);
        claimEventPublisher.publishStatusEvent(claim.getId(), ClaimStatus.SUBMITTED.name(), "Claim submitted");

        log.info("Claim created: id={}, number={}, customer={}, amount={}",
                claim.getId(), claim.getClaimNumber(), claim.getCustomerName(), claim.getClaimAmount());

        // 3. Call Policy Service to validate policy
        PolicyValidationResponseDTO policyValidation = policyServiceClient.validatePolicy(claim.getPolicyId());

        if (!policyValidation.isValid()) {
            // Policy is invalid (expired, cancelled, or non-existent) -> REJECT
            String rejectionReason = policyValidation.getMessage() != null
                    ? policyValidation.getMessage() : "Policy validation failed";
            claim = transitionService.transitionClaimStatus(
                    claim,
                    ClaimStatus.REJECTED,
                    rejectionReason,
                    user
            );
            return mapToDTO(claim);
        }

        // 4. Policy is valid -> transition to POLICY_VALIDATED then UNDER_REVIEW
        claim = transitionService.transitionClaimStatus(
                claim,
                ClaimStatus.POLICY_VALIDATED,
                "Policy is valid",
                user
        );

        claim = transitionService.transitionClaimStatus(
                claim,
                ClaimStatus.UNDER_REVIEW,
                "Claim entered adjudication",
                user
        );

        // 5. Call Approval Service with coverageAmount from Policy Service
        try {
            ApprovalResponseDTO approvalResponse = approvalServiceClient.requestApproval(
                    claim.getId(),
                    claim.getPolicyId(),
                    claim.getClaimAmount(),
                    policyValidation.getCoverageAmount(),
                    claim.getDescription()
            );

            if ("APPROVED".equalsIgnoreCase(approvalResponse.getStatus())) {
                claim = transitionService.transitionClaimStatus(
                        claim,
                        ClaimStatus.APPROVED,
                        approvalResponse.getReason() != null ? approvalResponse.getReason() : "Claim amount is within policy coverage",
                        user
                );
            } else {
                claim = transitionService.transitionClaimStatus(
                        claim,
                        ClaimStatus.REJECTED,
                        approvalResponse.getReason() != null ? approvalResponse.getReason() : "Claim rejected by approval service",
                        user
                );
            }

            return mapToDTO(claim);

        } catch (ServiceCommunicationException e) {
            // Approval Service is unavailable: keep claim saved in UNDER_REVIEW
            log.warn("Approval Service unavailable for claim ID {}. Claim remains in UNDER_REVIEW: {}",
                    claim.getId(), e.getMessage());
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ClaimResponseDTO getClaimById(Long id) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + id));
        return mapToDTO(claim);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClaimResponseDTO> getAllClaims() {
        return claimRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ClaimResponseDTO updateClaimStatus(Long id, ClaimStatusUpdateDTO statusUpdateDTO, String changedBy) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + id));

        String user = (changedBy != null && !changedBy.trim().isEmpty()) ? changedBy.trim() : "user";
        String reason = statusUpdateDTO.getReason() != null ? statusUpdateDTO.getReason() : "Status updated by " + user;

        claim = transitionService.transitionClaimStatus(claim, statusUpdateDTO.getStatus(), reason, user);
        return mapToDTO(claim);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClaimStatusHistoryResponseDTO> getClaimHistory(Long claimId) {
        if (!claimRepository.existsById(claimId)) {
            throw new ResourceNotFoundException("Claim not found with id: " + claimId);
        }
        return claimStatusHistoryRepository.findByClaimIdOrderByChangedAtAscIdAsc(claimId).stream()
                .map(this::mapHistoryToDTO)
                .collect(Collectors.toList());
    }

    private synchronized String generateClaimNumber() {
        long count = claimRepository.count();
        long nextId = 1001 + count;
        String candidate = "CLM" + nextId;
        while (claimRepository.existsByClaimNumber(candidate)) {
            nextId++;
            candidate = "CLM" + nextId;
        }
        return candidate;
    }

    private ClaimResponseDTO mapToDTO(Claim claim) {
        return ClaimResponseDTO.builder()
                .id(claim.getId())
                .claimNumber(claim.getClaimNumber())
                .policyId(claim.getPolicyId())
                .customerName(claim.getCustomerName())
                .claimAmount(claim.getClaimAmount())
                .description(claim.getDescription())
                .claimDate(claim.getClaimDate())
                .status(claim.getStatus())
                .rejectionReason(claim.getRejectionReason())
                .idempotencyKey(claim.getIdempotencyKey())
                .createdAt(claim.getCreatedAt())
                .updatedAt(claim.getUpdatedAt())
                .build();
    }

    private ClaimStatusHistoryResponseDTO mapHistoryToDTO(ClaimStatusHistory history) {
        return ClaimStatusHistoryResponseDTO.builder()
                .id(history.getId())
                .claimId(history.getClaimId())
                .previousStatus(history.getPreviousStatus())
                .newStatus(history.getNewStatus())
                .reason(history.getReason())
                .changedAt(history.getChangedAt())
                .changedBy(history.getChangedBy())
                .build();
    }
}
