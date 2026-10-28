package com.aegis.claim.dto;

import java.math.BigDecimal;

public class PolicyValidationResponseDTO {

    private boolean valid;
    private Long policyId;
    private String policyNumber;
    private String customerName;
    private BigDecimal coverageAmount;
    private String status;
    private String message;

    public PolicyValidationResponseDTO() {
    }

    public PolicyValidationResponseDTO(boolean valid, Long policyId, String policyNumber, String customerName,
                                      BigDecimal coverageAmount, String status, String message) {
        this.valid = valid;
        this.policyId = policyId;
        this.policyNumber = policyNumber;
        this.customerName = customerName;
        this.coverageAmount = coverageAmount;
        this.status = status;
        this.message = message;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private boolean valid;
        private Long policyId;
        private String policyNumber;
        private String customerName;
        private BigDecimal coverageAmount;
        private String status;
        private String message;

        public Builder valid(boolean valid) {
            this.valid = valid;
            return this;
        }

        public Builder policyId(Long policyId) {
            this.policyId = policyId;
            return this;
        }

        public Builder policyNumber(String policyNumber) {
            this.policyNumber = policyNumber;
            return this;
        }

        public Builder customerName(String customerName) {
            this.customerName = customerName;
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

        public Builder message(String message) {
            this.message = message;
            return this;
        }

        public PolicyValidationResponseDTO build() {
            return new PolicyValidationResponseDTO(valid, policyId, policyNumber, customerName, coverageAmount, status, message);
        }
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public Long getPolicyId() {
        return policyId;
    }

    public void setPolicyId(Long policyId) {
        this.policyId = policyId;
    }

    public String getPolicyNumber() {
        return policyNumber;
    }

    public void setPolicyNumber(String policyNumber) {
        this.policyNumber = policyNumber;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
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

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
