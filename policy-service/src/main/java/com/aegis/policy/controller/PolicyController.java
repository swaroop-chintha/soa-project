package com.aegis.policy.controller;

import com.aegis.policy.dto.PolicyRequestDTO;
import com.aegis.policy.dto.PolicyResponseDTO;
import com.aegis.policy.dto.PolicyValidationResponseDTO;
import com.aegis.policy.service.PolicyService;
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
@RequestMapping("/policies")
@Tag(name = "Policy Management", description = "Endpoints for policy creation, management, and validation")
public class PolicyController {

    private final PolicyService policyService;

    public PolicyController(PolicyService policyService) {
        this.policyService = policyService;
    }

    @PostMapping
    @Operation(summary = "Create an insurance policy", description = "Creates a new insurance policy with coverage and validity window")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Policy created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid policy data or duplicate policy number")
    })
    public ResponseEntity<PolicyResponseDTO> createPolicy(@Valid @RequestBody PolicyRequestDTO requestDTO) {
        PolicyResponseDTO response = policyService.createPolicy(requestDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "List all policies", description = "Retrieves all policies in the system")
    @ApiResponse(responseCode = "200", description = "Policies retrieved successfully")
    public ResponseEntity<List<PolicyResponseDTO>> getAllPolicies() {
        List<PolicyResponseDTO> policies = policyService.getAllPolicies();
        return ResponseEntity.ok(policies);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get policy by ID", description = "Retrieves details of a specific policy by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Policy found"),
            @ApiResponse(responseCode = "404", description = "Policy not found")
    })
    public ResponseEntity<PolicyResponseDTO> getPolicyById(@PathVariable Long id) {
        PolicyResponseDTO policy = policyService.getPolicyById(id);
        return ResponseEntity.ok(policy);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update policy", description = "Updates an existing policy's details")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Policy updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid update parameters"),
            @ApiResponse(responseCode = "404", description = "Policy not found")
    })
    public ResponseEntity<PolicyResponseDTO> updatePolicy(
            @PathVariable Long id,
            @Valid @RequestBody PolicyRequestDTO requestDTO) {
        PolicyResponseDTO response = policyService.updatePolicy(id, requestDTO);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete policy", description = "Deletes a policy by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Policy deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Policy not found")
    })
    public ResponseEntity<Void> deletePolicy(@PathVariable Long id) {
        policyService.deletePolicy(id);
        return ResponseEntity.noContent().build();
    }

    @RequestMapping(value = "/{id}/validate", method = {RequestMethod.GET, RequestMethod.POST})
    @Operation(summary = "Validate policy", description = "Validates if policy is active, within date window, and has positive coverage")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Policy validation evaluation result"),
            @ApiResponse(responseCode = "404", description = "Policy not found")
    })
    public ResponseEntity<PolicyValidationResponseDTO> validatePolicy(@PathVariable Long id) {
        PolicyValidationResponseDTO validationResponse = policyService.validatePolicy(id);
        return ResponseEntity.ok(validationResponse);
    }
}
