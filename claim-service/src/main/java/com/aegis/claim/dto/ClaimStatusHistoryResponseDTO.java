package com.aegis.claim.dto;

import com.aegis.claim.entity.ClaimStatus;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ClaimStatusHistoryResponseDTO {

    private Long id;
    private Long claimId;
    private ClaimStatus previousStatus;
    private ClaimStatus newStatus;
    private String reason;
    private LocalDateTime changedAt;
    private String changedBy;

    public ClaimStatusHistoryResponseDTO() {
    }

    public ClaimStatusHistoryResponseDTO(Long id, Long claimId, ClaimStatus previousStatus,
                                         ClaimStatus newStatus, String reason,
                                         LocalDateTime changedAt, String changedBy) {
        this.id = id;
        this.claimId = claimId;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.reason = reason;
        this.changedAt = changedAt;
        this.changedBy = changedBy;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Long claimId;
        private ClaimStatus previousStatus;
        private ClaimStatus newStatus;
        private String reason;
        private LocalDateTime changedAt;
        private String changedBy;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder claimId(Long claimId) {
            this.claimId = claimId;
            return this;
        }

        public Builder previousStatus(ClaimStatus previousStatus) {
            this.previousStatus = previousStatus;
            return this;
        }

        public Builder newStatus(ClaimStatus newStatus) {
            this.newStatus = newStatus;
            return this;
        }

        public Builder reason(String reason) {
            this.reason = reason;
            return this;
        }

        public Builder changedAt(LocalDateTime changedAt) {
            this.changedAt = changedAt;
            return this;
        }

        public Builder changedBy(String changedBy) {
            this.changedBy = changedBy;
            return this;
        }

        public ClaimStatusHistoryResponseDTO build() {
            return new ClaimStatusHistoryResponseDTO(id, claimId, previousStatus, newStatus, reason, changedAt, changedBy);
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getClaimId() {
        return claimId;
    }

    public void setClaimId(Long claimId) {
        this.claimId = claimId;
    }

    public ClaimStatus getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(ClaimStatus previousStatus) {
        this.previousStatus = previousStatus;
    }

    public ClaimStatus getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(ClaimStatus newStatus) {
        this.newStatus = newStatus;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDateTime getChangedAt() {
        return changedAt;
    }

    public void setChangedAt(LocalDateTime changedAt) {
        this.changedAt = changedAt;
    }

    public String getChangedBy() {
        return changedBy;
    }

    public void setChangedBy(String changedBy) {
        this.changedBy = changedBy;
    }
}
