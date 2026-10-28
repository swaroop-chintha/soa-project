package com.aegis.approval.controller;

import com.aegis.approval.dto.ApprovalRequestDTO;
import com.aegis.approval.dto.ApprovalResponseDTO;
import com.aegis.approval.service.ApprovalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/approvals")
@Tag(name = "Approval Management", description = "Endpoints for evaluating and querying claim adjudication decisions")
public class ApprovalController {

    private final ApprovalService approvalService;

    public ApprovalController(ApprovalService approvalService) {
        this.approvalService = approvalService;
    }

    @PostMapping({"", "/evaluate"})
    @Operation(summary = "Evaluate claim approval", description = "Evaluates claim approval deterministically: approved if claimAmount <= coverageAmount, otherwise rejected")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Approval evaluation decision processed and persisted"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload or non-positive amounts")
    })
    public ResponseEntity<ApprovalResponseDTO> processApproval(@Valid @RequestBody ApprovalRequestDTO requestDTO) {
        ApprovalResponseDTO response = approvalService.processApproval(requestDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "List all approval decisions", description = "Retrieves all recorded approval adjudication records")
    @ApiResponse(responseCode = "200", description = "Approval decisions retrieved successfully")
    public ResponseEntity<List<ApprovalResponseDTO>> getAllApprovals() {
        List<ApprovalResponseDTO> approvals = approvalService.getAllApprovals();
        return ResponseEntity.ok(approvals);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get approval decision by ID", description = "Retrieves an approval decision record by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Approval record found"),
            @ApiResponse(responseCode = "404", description = "Approval record not found")
    })
    public ResponseEntity<ApprovalResponseDTO> getApprovalById(@PathVariable Long id) {
        ApprovalResponseDTO approval = approvalService.getApprovalById(id);
        return ResponseEntity.ok(approval);
    }

    @GetMapping("/claim/{claimId}")
    @Operation(summary = "Get approval decision by claim ID", description = "Retrieves the approval decision associated with a specific claim ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Approval record found for claim"),
            @ApiResponse(responseCode = "404", description = "Approval record not found for claim")
    })
    public ResponseEntity<ApprovalResponseDTO> getApprovalByClaimId(@PathVariable Long claimId) {
        ApprovalResponseDTO approval = approvalService.getApprovalByClaimId(claimId);
        return ResponseEntity.ok(approval);
    }
}
