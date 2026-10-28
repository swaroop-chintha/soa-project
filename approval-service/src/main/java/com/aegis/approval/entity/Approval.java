package com.aegis.approval.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "approvals")
public class Approval {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long claimId;

    @Column(nullable = false)
    private Long policyId;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal claimAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal coverageAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApprovalStatus status;

    @Column(nullable = false)
    private LocalDate decisionDate;

    @Column(nullable = false, length = 255)
    private String reason;

    @Column(length = 500)
    private String description;

    public Approval() {
    }

    public Approval(Long id, Long claimId, Long policyId, BigDecimal claimAmount, BigDecimal coverageAmount,
                    ApprovalStatus status, LocalDate decisionDate, String reason, String description) {
        this.id = id;
        this.claimId = claimId;
        this.policyId = policyId;
        this.claimAmount = claimAmount;
        this.coverageAmount = coverageAmount;
        this.status = status;
        this.decisionDate = decisionDate;
        this.reason = reason;
        this.description = description;
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
        private ApprovalStatus status;
        private LocalDate decisionDate;
        private String reason;
        private String description;

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

        public Builder status(ApprovalStatus status) {
            this.status = status;
            return this;
        }

        public Builder decisionDate(LocalDate decisionDate) {
            this.decisionDate = decisionDate;
            return this;
        }

        public Builder reason(String reason) {
            this.reason = reason;
            return this;
        }

        public Builder description(String description) {
            this.description = description;
            return this;
        }

        public Approval build() {
            return new Approval(id, claimId, policyId, claimAmount, coverageAmount, status, decisionDate, reason, description);
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

    public ApprovalStatus getStatus() {
        return status;
    }

    public void setStatus(ApprovalStatus status) {
        this.status = status;
    }

    public LocalDate getDecisionDate() {
        return decisionDate;
    }

    public void setDecisionDate(LocalDate decisionDate) {
        this.decisionDate = decisionDate;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
