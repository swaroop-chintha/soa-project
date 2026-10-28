package com.aegis.claim.dto;

import java.time.LocalDateTime;

public class ClaimEvent {

    private Long claimId;
    private String status;
    private LocalDateTime timestamp;
    private String message;

    public ClaimEvent() {
    }

    public ClaimEvent(Long claimId, String status, LocalDateTime timestamp, String message) {
        this.claimId = claimId;
        this.status = status;
        this.timestamp = timestamp;
        this.message = message;
    }

    public Long getClaimId() {
        return claimId;
    }

    public void setClaimId(Long claimId) {
        this.claimId = claimId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
