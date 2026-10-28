package com.aegis.claim.service.impl;

import com.aegis.claim.dto.ClaimEvent;
import com.aegis.claim.service.ClaimEventPublisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ClaimEventPublisherImpl implements ClaimEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(ClaimEventPublisherImpl.class);

    private final SimpMessagingTemplate messagingTemplate;

    public ClaimEventPublisherImpl(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public void publishStatusEvent(Long claimId, String status, String message) {
        try {
            ClaimEvent event = new ClaimEvent(claimId, status, LocalDateTime.now(), message);
            messagingTemplate.convertAndSend("/topic/claims/" + claimId, event);
            messagingTemplate.convertAndSend("/topic/claims", event);
            log.info("Published real-time claim status event: claimId={}, status={}, message={}", claimId, status, message);
        } catch (Exception e) {
            log.warn("Failed to publish real-time status event for claimId={}: {}", claimId, e.getMessage());
        }
    }
}
