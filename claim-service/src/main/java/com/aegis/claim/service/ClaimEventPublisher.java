package com.aegis.claim.service;

public interface ClaimEventPublisher {

    void publishStatusEvent(Long claimId, String status, String message);
}
