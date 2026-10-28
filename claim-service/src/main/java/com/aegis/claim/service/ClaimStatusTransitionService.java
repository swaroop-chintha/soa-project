package com.aegis.claim.service;

import com.aegis.claim.entity.Claim;
import com.aegis.claim.entity.ClaimStatus;
import com.aegis.claim.entity.ClaimStatusHistory;
import com.aegis.claim.exception.InvalidStatusTransitionException;
import com.aegis.claim.repository.ClaimRepository;
import com.aegis.claim.repository.ClaimStatusHistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@SuppressWarnings("null")
public class ClaimStatusTransitionService {

    private static final Logger log = LoggerFactory.getLogger(ClaimStatusTransitionService.class);

    private final ClaimRepository claimRepository;
    private final ClaimStatusHistoryRepository claimStatusHistoryRepository;
    private final ClaimEventPublisher claimEventPublisher;

    public ClaimStatusTransitionService(ClaimRepository claimRepository,
                                        ClaimStatusHistoryRepository claimStatusHistoryRepository,
                                        ClaimEventPublisher claimEventPublisher) {
        this.claimRepository = claimRepository;
        this.claimStatusHistoryRepository = claimStatusHistoryRepository;
        this.claimEventPublisher = claimEventPublisher;
    }

    @Transactional
    public Claim transitionClaimStatus(Claim claim, ClaimStatus newStatus, String reason, String changedBy) {
        ClaimStatus previousStatus = claim.getStatus();

        if (previousStatus != null && previousStatus == newStatus) {
            log.debug("Skipping redundant status transition for claim {}: already in status {}", claim.getId(), newStatus);
            return claim;
        }

        validateTransition(previousStatus, newStatus);

        claim.setStatus(newStatus);
        if (newStatus == ClaimStatus.REJECTED && reason != null) {
            claim.setRejectionReason(reason);
        } else if (newStatus == ClaimStatus.APPROVED) {
            claim.setRejectionReason(null);
        }

        Claim savedClaim = claimRepository.save(claim);

        ClaimStatusHistory history = ClaimStatusHistory.builder()
                .claimId(savedClaim.getId())
                .previousStatus(previousStatus)
                .newStatus(newStatus)
                .reason(reason)
                .changedAt(LocalDateTime.now())
                .changedBy(changedBy != null && !changedBy.isBlank() ? changedBy : "system")
                .build();
        claimStatusHistoryRepository.save(history);

        log.info("Claim {} transitioned from {} to {}. Reason: {}. ChangedBy: {}",
                savedClaim.getId(), previousStatus, newStatus, reason, history.getChangedBy());

        claimEventPublisher.publishStatusEvent(savedClaim.getId(), newStatus.name(), reason);

        return savedClaim;
    }

    public void validateTransition(ClaimStatus from, ClaimStatus to) {
        if (from == null) {
            if (to != ClaimStatus.SUBMITTED) {
                throw new InvalidStatusTransitionException("Initial claim status must be SUBMITTED, got: " + to);
            }
            return;
        }

        if (from == ClaimStatus.APPROVED || from == ClaimStatus.REJECTED) {
            throw new InvalidStatusTransitionException(
                    "Cannot transition from terminal status " + from + " to " + to);
        }

        boolean isValid = switch (from) {
            case SUBMITTED -> (to == ClaimStatus.POLICY_VALIDATED || to == ClaimStatus.REJECTED || to == ClaimStatus.UNDER_REVIEW);
            case POLICY_VALIDATED -> (to == ClaimStatus.UNDER_REVIEW || to == ClaimStatus.REJECTED);
            case UNDER_REVIEW -> (to == ClaimStatus.APPROVED || to == ClaimStatus.REJECTED);
            default -> false;
        };

        if (!isValid) {
            throw new InvalidStatusTransitionException("Illegal status transition from " + from + " to " + to);
        }
    }
}
