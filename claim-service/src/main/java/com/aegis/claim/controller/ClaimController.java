package com.aegis.claim.controller;

import com.aegis.claim.dto.ClaimRequestDTO;
import com.aegis.claim.dto.ClaimResponseDTO;
import com.aegis.claim.dto.ClaimStatusHistoryResponseDTO;
import com.aegis.claim.dto.ClaimStatusUpdateDTO;
import com.aegis.claim.service.ClaimService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/claims")
@Tag(name = "Claim Management", description = "Endpoints for creating, managing, and tracking insurance claims")
public class ClaimController {

    private final ClaimService claimService;

    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    @PostMapping
    @Operation(summary = "Submit an insurance claim", description = "Submits a new insurance claim with optional idempotency key. Executes policy validation and automated approval adjudication.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Claim successfully created and adjudicated"),
            @ApiResponse(responseCode = "400", description = "Invalid claim request parameters"),
            @ApiResponse(responseCode = "503", description = "Downstream policy or approval service unavailable")
    })
    public ResponseEntity<ClaimResponseDTO> submitClaim(
            @Valid @RequestBody ClaimRequestDTO requestDTO,
            @Parameter(description = "Optional unique idempotency key to prevent duplicate claim creation")
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Parameter(hidden = true)
            @RequestHeader(value = "X-User-Name", required = false) String userName) {
        ClaimResponseDTO response = claimService.createClaim(requestDTO, idempotencyKey, userName);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "List all claims", description = "Returns all claims currently recorded in the system")
    @ApiResponse(responseCode = "200", description = "List of claims retrieved successfully")
    public ResponseEntity<List<ClaimResponseDTO>> getAllClaims() {
        List<ClaimResponseDTO> claims = claimService.getAllClaims();
        return ResponseEntity.ok(claims);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get claim by ID", description = "Retrieves claim details by unique claim identifier")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Claim found"),
            @ApiResponse(responseCode = "404", description = "Claim not found")
    })
    public ResponseEntity<ClaimResponseDTO> getClaimById(@PathVariable Long id) {
        ClaimResponseDTO claim = claimService.getClaimById(id);
        return ResponseEntity.ok(claim);
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update claim status", description = "Updates a claim's status enforcing lifecycle validation rules")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Claim status successfully updated"),
            @ApiResponse(responseCode = "400", description = "Illegal status transition attempted"),
            @ApiResponse(responseCode = "404", description = "Claim not found")
    })
    public ResponseEntity<ClaimResponseDTO> updateClaimStatus(
            @PathVariable Long id,
            @Valid @RequestBody ClaimStatusUpdateDTO statusUpdateDTO,
            @Parameter(hidden = true)
            @RequestHeader(value = "X-User-Name", required = false) String userName) {
        ClaimResponseDTO response = claimService.updateClaimStatus(id, statusUpdateDTO, userName);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/history")
    @Operation(summary = "Get claim status history", description = "Returns the complete chronological status transition audit log for a claim")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Claim history retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Claim not found")
    })
    public ResponseEntity<List<ClaimStatusHistoryResponseDTO>> getClaimHistory(@PathVariable Long id) {
        List<ClaimStatusHistoryResponseDTO> history = claimService.getClaimHistory(id);
        return ResponseEntity.ok(history);
    }
}
