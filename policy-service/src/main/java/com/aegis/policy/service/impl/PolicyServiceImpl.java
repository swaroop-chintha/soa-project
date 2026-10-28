package com.aegis.policy.service.impl;

import com.aegis.policy.dto.PolicyRequestDTO;
import com.aegis.policy.dto.PolicyResponseDTO;
import com.aegis.policy.dto.PolicyValidationResponseDTO;
import com.aegis.policy.entity.Policy;
import com.aegis.policy.entity.PolicyStatus;
import com.aegis.policy.exception.InvalidPolicyException;
import com.aegis.policy.exception.ResourceNotFoundException;
import com.aegis.policy.repository.PolicyRepository;
import com.aegis.policy.service.PolicyService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@SuppressWarnings("null")
public class PolicyServiceImpl implements PolicyService {

    private final PolicyRepository policyRepository;

    public PolicyServiceImpl(PolicyRepository policyRepository) {
        this.policyRepository = policyRepository;
    }

    @Override
    @Transactional
    public PolicyResponseDTO createPolicy(PolicyRequestDTO requestDTO) {
        if (policyRepository.existsByPolicyNumber(requestDTO.getPolicyNumber())) {
            throw new InvalidPolicyException("Policy with number " + requestDTO.getPolicyNumber() + " already exists");
        }

        if (requestDTO.getEndDate().isBefore(requestDTO.getStartDate())) {
            throw new InvalidPolicyException("Policy end date cannot be before start date");
        }

        Policy policy = Policy.builder()
                .policyNumber(requestDTO.getPolicyNumber().trim())
                .customerName(requestDTO.getCustomerName().trim())
                .policyType(requestDTO.getPolicyType().trim())
                .coverageAmount(requestDTO.getCoverageAmount())
                .startDate(requestDTO.getStartDate())
                .endDate(requestDTO.getEndDate())
                .status(requestDTO.getStatus())
                .build();

        Policy saved = policyRepository.save(policy);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PolicyResponseDTO> getAllPolicies() {
        return policyRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PolicyResponseDTO getPolicyById(Long id) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found with id: " + id));
        return mapToDTO(policy);
    }

    @Override
    @Transactional
    public PolicyResponseDTO updatePolicy(Long id, PolicyRequestDTO requestDTO) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found with id: " + id));

        if (!policy.getPolicyNumber().equalsIgnoreCase(requestDTO.getPolicyNumber())
                && policyRepository.existsByPolicyNumber(requestDTO.getPolicyNumber())) {
            throw new InvalidPolicyException("Policy with number " + requestDTO.getPolicyNumber() + " already exists");
        }

        if (requestDTO.getEndDate().isBefore(requestDTO.getStartDate())) {
            throw new InvalidPolicyException("Policy end date cannot be before start date");
        }

        policy.setPolicyNumber(requestDTO.getPolicyNumber().trim());
        policy.setCustomerName(requestDTO.getCustomerName().trim());
        policy.setPolicyType(requestDTO.getPolicyType().trim());
        policy.setCoverageAmount(requestDTO.getCoverageAmount());
        policy.setStartDate(requestDTO.getStartDate());
        policy.setEndDate(requestDTO.getEndDate());
        policy.setStatus(requestDTO.getStatus());

        Policy updated = policyRepository.save(policy);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deletePolicy(Long id) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found with id: " + id));
        policyRepository.delete(policy);
    }

    @Override
    @Transactional(readOnly = true)
    public PolicyValidationResponseDTO validatePolicy(Long id) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found with id: " + id));

        LocalDate today = LocalDate.now();

        if (policy.getStatus() != PolicyStatus.ACTIVE) {
            return PolicyValidationResponseDTO.builder()
                    .valid(false)
                    .policyId(policy.getId())
                    .policyNumber(policy.getPolicyNumber())
                    .customerName(policy.getCustomerName())
                    .coverageAmount(policy.getCoverageAmount())
                    .status(policy.getStatus())
                    .message("Policy is not ACTIVE (current status: " + policy.getStatus() + ")")
                    .build();
        }

        if (today.isBefore(policy.getStartDate())) {
            return PolicyValidationResponseDTO.builder()
                    .valid(false)
                    .policyId(policy.getId())
                    .policyNumber(policy.getPolicyNumber())
                    .customerName(policy.getCustomerName())
                    .coverageAmount(policy.getCoverageAmount())
                    .status(policy.getStatus())
                    .message("Policy coverage has not started yet (Start Date: " + policy.getStartDate() + ")")
                    .build();
        }

        if (today.isAfter(policy.getEndDate())) {
            return PolicyValidationResponseDTO.builder()
                    .valid(false)
                    .policyId(policy.getId())
                    .policyNumber(policy.getPolicyNumber())
                    .customerName(policy.getCustomerName())
                    .coverageAmount(policy.getCoverageAmount())
                    .status(policy.getStatus())
                    .message("Policy coverage has expired (End Date: " + policy.getEndDate() + ")")
                    .build();
        }

        if (policy.getCoverageAmount() == null || policy.getCoverageAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            return PolicyValidationResponseDTO.builder()
                    .valid(false)
                    .policyId(policy.getId())
                    .policyNumber(policy.getPolicyNumber())
                    .customerName(policy.getCustomerName())
                    .coverageAmount(policy.getCoverageAmount())
                    .status(policy.getStatus())
                    .message("Policy coverage amount must be positive")
                    .build();
        }

        return PolicyValidationResponseDTO.builder()
                .valid(true)
                .policyId(policy.getId())
                .policyNumber(policy.getPolicyNumber())
                .customerName(policy.getCustomerName())
                .coverageAmount(policy.getCoverageAmount())
                .status(policy.getStatus())
                .message("Policy is valid")
                .build();
    }

    private PolicyResponseDTO mapToDTO(Policy policy) {
        return PolicyResponseDTO.builder()
                .id(policy.getId())
                .policyNumber(policy.getPolicyNumber())
                .customerName(policy.getCustomerName())
                .policyType(policy.getPolicyType())
                .coverageAmount(policy.getCoverageAmount())
                .startDate(policy.getStartDate())
                .endDate(policy.getEndDate())
                .status(policy.getStatus())
                .build();
    }
}
