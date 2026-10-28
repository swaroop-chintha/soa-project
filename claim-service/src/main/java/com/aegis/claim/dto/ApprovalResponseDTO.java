package com.aegis.claim.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ApprovalResponseDTO {

    private Long id;
    private Long claimId;
    private Long policyId;
    private BigDecimal claimAmount;
    private BigDecimal coverageAmount;
    private String status;
    private String reason;
    private LocalDate decisionDate;

    public ApprovalResponseDTO() {
    }

    public ApprovalResponseDTO(Long id, Long claimId, Long policyId, BigDecimal claimAmount,
                               BigDecimal coverageAmount, String status, String reason, LocalDate decisionDate) {
        this.id = id;
        this.claimId = claimId;
        this.policyId = policyId;
        this.claimAmount = claimAmount;
        this.coverageAmount = coverageAmount;
        this.status = status;
        this.reason = reason;
        this.decisionDate = decisionDate;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Long claimId;
        private Long policyId;
        private BigDecimal claimAmount;
        private BigDecimal coverageAmount;
        private String status;
        private String reason;
        private LocalDate decisionDate;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

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

        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public Builder reason(String reason) {
            this.reason = reason;
            return this;
        }

        public Builder decisionDate(LocalDate decisionDate) {
            this.decisionDate = decisionDate;
            return this;
        }

        public ApprovalResponseDTO build() {
            return new ApprovalResponseDTO(id, claimId, policyId, claimAmount, coverageAmount, status, reason, decisionDate);
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDate getDecisionDate() {
        return decisionDate;
    }

    public void setDecisionDate(LocalDate decisionDate) {
        this.decisionDate = decisionDate;
    }
}
