package com.aegis.claim.dto;

import com.aegis.claim.entity.ClaimStatus;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ClaimResponseDTO {

    private Long id;
    private String claimNumber;
    private Long policyId;
    private String customerName;
    private BigDecimal claimAmount;
    private String description;
    private LocalDate claimDate;
    private ClaimStatus status;
    private String rejectionReason;
    private String idempotencyKey;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ClaimResponseDTO() {
    }

    public ClaimResponseDTO(Long id, String claimNumber, Long policyId, String customerName,
                            BigDecimal claimAmount, String description, LocalDate claimDate,
                            ClaimStatus status, String rejectionReason) {
        this(id, claimNumber, policyId, customerName, claimAmount, description, claimDate, status, rejectionReason, null, null, null);
    }

    public ClaimResponseDTO(Long id, String claimNumber, Long policyId, String customerName,
                            BigDecimal claimAmount, String description, LocalDate claimDate,
                            ClaimStatus status, String rejectionReason, String idempotencyKey, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.claimNumber = claimNumber;
        this.policyId = policyId;
        this.customerName = customerName;
        this.claimAmount = claimAmount;
        this.description = description;
        this.claimDate = claimDate;
        this.status = status;
        this.rejectionReason = rejectionReason;
        this.idempotencyKey = idempotencyKey;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String claimNumber;
        private Long policyId;
        private String customerName;
        private BigDecimal claimAmount;
        private String description;
        private LocalDate claimDate;
        private ClaimStatus status;
        private String rejectionReason;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder claimNumber(String claimNumber) {
            this.claimNumber = claimNumber;
            return this;
        }

        public Builder policyId(Long policyId) {
            this.policyId = policyId;
            return this;
        }

        public Builder customerName(String customerName) {
            this.customerName = customerName;
            return this;
        }

        public Builder claimAmount(BigDecimal claimAmount) {
            this.claimAmount = claimAmount;
            return this;
        }

        public Builder description(String description) {
            this.description = description;
            return this;
        }

        public Builder claimDate(LocalDate claimDate) {
            this.claimDate = claimDate;
            return this;
        }

        public Builder status(ClaimStatus status) {
            this.status = status;
            return this;
        }

        public Builder rejectionReason(String rejectionReason) {
            this.rejectionReason = rejectionReason;
            return this;
        }

        private String idempotencyKey;

        public Builder idempotencyKey(String idempotencyKey) {
            this.idempotencyKey = idempotencyKey;
            return this;
        }

        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Builder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public ClaimResponseDTO build() {
            return new ClaimResponseDTO(id, claimNumber, policyId, customerName, claimAmount, description, claimDate, status, rejectionReason, idempotencyKey, createdAt, updatedAt);
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getClaimNumber() {
        return claimNumber;
    }

    public void setClaimNumber(String claimNumber) {
        this.claimNumber = claimNumber;
    }

    public Long getPolicyId() {
        return policyId;
    }

    public void setPolicyId(Long policyId) {
        this.policyId = policyId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public BigDecimal getClaimAmount() {
        return claimAmount;
    }

    public void setClaimAmount(BigDecimal claimAmount) {
        this.claimAmount = claimAmount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getClaimDate() {
        return claimDate;
    }

    public void setClaimDate(LocalDate claimDate) {
        this.claimDate = claimDate;
    }

    public ClaimStatus getStatus() {
        return status;
    }

    public void setStatus(ClaimStatus status) {
        this.status = status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
