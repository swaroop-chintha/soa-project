package com.aegis.claim.dto;

import com.aegis.claim.entity.ClaimStatus;
import jakarta.validation.constraints.NotNull;

public class ClaimStatusUpdateDTO {

    @NotNull(message = "Status is required")
    private ClaimStatus status;

    private String reason;

    public ClaimStatusUpdateDTO() {
    }

    public ClaimStatusUpdateDTO(ClaimStatus status, String reason) {
        this.status = status;
        this.reason = reason;
    }

    public ClaimStatus getStatus() {
        return status;
    }

    public void setStatus(ClaimStatus status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
