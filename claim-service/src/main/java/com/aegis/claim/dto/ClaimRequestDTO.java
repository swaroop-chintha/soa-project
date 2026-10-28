package com.aegis.claim.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public class ClaimRequestDTO {

    @NotNull(message = "Policy ID is required")
    private Long policyId;

    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotNull(message = "Claim amount is required")
    @Positive(message = "Claim amount must be greater than zero")
    private BigDecimal claimAmount;

    private String description;

    public ClaimRequestDTO() {
    }

    public ClaimRequestDTO(Long policyId, String customerName, BigDecimal claimAmount, String description) {
        this.policyId = policyId;
        this.customerName = customerName;
        this.claimAmount = claimAmount;
        this.description = description;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long policyId;
        private String customerName;
        private BigDecimal claimAmount;
        private String description;

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

        public ClaimRequestDTO build() {
            return new ClaimRequestDTO(policyId, customerName, claimAmount, description);
        }
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
}
