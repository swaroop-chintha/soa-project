package com.aegis.approval.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public class ApprovalRequestDTO {

    @NotNull(message = "Claim ID is required")
    private Long claimId;

    @NotNull(message = "Policy ID is required")
    private Long policyId;

    @NotNull(message = "Claim amount is required")
    @Positive(message = "Claim amount must be greater than zero")
    private BigDecimal claimAmount;

    @NotNull(message = "Coverage amount is required")
    @Positive(message = "Coverage amount must be greater than zero")
    private BigDecimal coverageAmount;

    private String description;

    public ApprovalRequestDTO() {
    }

    public ApprovalRequestDTO(Long claimId, Long policyId, BigDecimal claimAmount, BigDecimal coverageAmount, String description) {
        this.claimId = claimId;
        this.policyId = policyId;
        this.claimAmount = claimAmount;
        this.coverageAmount = coverageAmount;
        this.description = description;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long claimId;
        private Long policyId;
        private BigDecimal claimAmount;
        private BigDecimal coverageAmount;
        private String description;

        public Builder claimId(Long claimId) {
            this.claimId = claimId;
            return this;
        }

        public Builder policyId(Long policyId) {
            this.policyId = policyId;
            return this;
        }

        public Builder claimAmount(BigDecimal claimAmount) {
            this.claimAmount = claimAmount;
            return this;
        }

        public Builder coverageAmount(BigDecimal coverageAmount) {
            this.coverageAmount = coverageAmount;
            return this;
        }

        public Builder description(String description) {
            this.description = description;
            return this;
        }

        public ApprovalRequestDTO build() {
            return new ApprovalRequestDTO(claimId, policyId, claimAmount, coverageAmount, description);
        }
    }

    public Long getClaimId() {
        return claimId;
    }

    public void setClaimId(Long claimId) {
        this.claimId = claimId;
    }

    public Long getPolicyId() {
        return policyId;
    }

    public void setPolicyId(Long policyId) {
        this.policyId = policyId;
    }

    public BigDecimal getClaimAmount() {
        return claimAmount;
    }

    public void setClaimAmount(BigDecimal claimAmount) {
        this.claimAmount = claimAmount;
    }

    public BigDecimal getCoverageAmount() {
        return coverageAmount;
    }

    public void setCoverageAmount(BigDecimal coverageAmount) {
        this.coverageAmount = coverageAmount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
