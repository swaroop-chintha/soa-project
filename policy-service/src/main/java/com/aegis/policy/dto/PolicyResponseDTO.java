package com.aegis.policy.dto;

import com.aegis.policy.entity.PolicyStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public class PolicyResponseDTO {

    private Long id;
    private String policyNumber;
    private String customerName;
    private String policyType;
    private BigDecimal coverageAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private PolicyStatus status;

    public PolicyResponseDTO() {
    }

    public PolicyResponseDTO(Long id, String policyNumber, String customerName, String policyType,
                             BigDecimal coverageAmount, LocalDate startDate, LocalDate endDate, PolicyStatus status) {
        this.id = id;
        this.policyNumber = policyNumber;
        this.customerName = customerName;
        this.policyType = policyType;
        this.coverageAmount = coverageAmount;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String policyNumber;
        private String customerName;
        private String policyType;
        private BigDecimal coverageAmount;
        private LocalDate startDate;
        private LocalDate endDate;
        private PolicyStatus status;

        public Builder id(Long id) {
            this.id = id;
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

        public Builder policyType(String policyType) {
            this.policyType = policyType;
            return this;
        }

        public Builder coverageAmount(BigDecimal coverageAmount) {
            this.coverageAmount = coverageAmount;
            return this;
        }

        public Builder startDate(LocalDate startDate) {
            this.startDate = startDate;
            return this;
        }

        public Builder endDate(LocalDate endDate) {
            this.endDate = endDate;
            return this;
        }

        public Builder status(PolicyStatus status) {
            this.status = status;
            return this;
        }

        public PolicyResponseDTO build() {
            return new PolicyResponseDTO(id, policyNumber, customerName, policyType, coverageAmount, startDate, endDate, status);
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getPolicyType() {
        return policyType;
    }

    public void setPolicyType(String policyType) {
        this.policyType = policyType;
    }

    public BigDecimal getCoverageAmount() {
        return coverageAmount;
    }

    public void setCoverageAmount(BigDecimal coverageAmount) {
        this.coverageAmount = coverageAmount;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public PolicyStatus getStatus() {
        return status;
    }

    public void setStatus(PolicyStatus status) {
        this.status = status;
    }

    public String getHolderName() {
        return customerName;
    }

    public boolean isActive() {
        return status == PolicyStatus.ACTIVE;
    }
}
